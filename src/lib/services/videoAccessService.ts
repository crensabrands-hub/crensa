import { db } from "@/lib/database";
import { seriesVideos, seriesPurchases, coinTransactions, users } from "@/lib/database/schema";
import { eq, and } from "drizzle-orm";

export interface VideoAccessResult {
  hasAccess: boolean;
  accessType: "free" | "paid" | "series-only";
  requiresPayment: boolean;
  coinPrice?: number;
  reason?: string;
}

export class VideoAccessService {
  /**
   * Check if a user has access to a specific video in a series
   */
  static async checkVideoAccess(
    userId: string,
    videoId: string,
    seriesId: string
  ): Promise<VideoAccessResult> {
    try {
      // Get the video's access settings from seriesVideos
      const [seriesVideo] = await db
        .select({
          accessType: seriesVideos.accessType,
          individualCoinPrice: seriesVideos.individualCoinPrice,
        })
        .from(seriesVideos)
        .where(
          and(
            eq(seriesVideos.videoId, videoId),
            eq(seriesVideos.seriesId, seriesId)
          )
        )
        .limit(1);

      if (!seriesVideo) {
        return {
          hasAccess: false,
          accessType: "series-only",
          requiresPayment: false,
          reason: "Video not found in series",
        };
      }

      const accessType = seriesVideo.accessType || "series-only";

      // Case 1: Free video - always accessible
      if (accessType === "free") {
        return {
          hasAccess: true,
          accessType: "free",
          requiresPayment: false,
        };
      }

      // Case 2: Paid video - check if user has purchased this specific video
      if (accessType === "paid") {
        const [videoPurchase] = await db
          .select()
          .from(coinTransactions)
          .where(
            and(
              eq(coinTransactions.userId, userId),
              eq(coinTransactions.relatedContentId, videoId),
              eq(coinTransactions.relatedContentType, "video"),
              eq(coinTransactions.transactionType, "spend")
            )
          )
          .limit(1);

        if (videoPurchase) {
          return {
            hasAccess: true,
            accessType: "paid",
            requiresPayment: false,
          };
        }

        return {
          hasAccess: false,
          accessType: "paid",
          requiresPayment: true,
          coinPrice: seriesVideo.individualCoinPrice || 0,
          reason: `This video requires ${seriesVideo.individualCoinPrice} coins to watch`,
        };
      }

      // Case 3: Series-only - check if user has purchased the series
      const [seriesPurchase] = await db
        .select()
        .from(seriesPurchases)
        .where(
          and(
            eq(seriesPurchases.userId, userId),
            eq(seriesPurchases.seriesId, seriesId)
          )
        )
        .limit(1);

      if (seriesPurchase) {
        return {
          hasAccess: true,
          accessType: "series-only",
          requiresPayment: false,
        };
      }

      return {
        hasAccess: false,
        accessType: "series-only",
        requiresPayment: true,
        reason: "This video is only accessible by purchasing the complete series",
      };
    } catch (error) {
      console.error("Error checking video access:", error);
      return {
        hasAccess: false,
        accessType: "series-only",
        requiresPayment: false,
        reason: "Error checking access",
      };
    }
  }

  /**
   * Purchase individual paid video
   */
  static async purchaseVideo(
    userId: string,
    videoId: string,
    seriesId: string,
    creatorId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get video access settings
      const [seriesVideo] = await db
        .select({
          accessType: seriesVideos.accessType,
          individualCoinPrice: seriesVideos.individualCoinPrice,
        })
        .from(seriesVideos)
        .where(
          and(
            eq(seriesVideos.videoId, videoId),
            eq(seriesVideos.seriesId, seriesId)
          )
        )
        .limit(1);

      if (!seriesVideo || seriesVideo.accessType !== "paid") {
        return {
          success: false,
          message: "This video is not available for individual purchase",
        };
      }

      const coinPrice = seriesVideo.individualCoinPrice || 0;

      // Check user's coin balance
      const [user] = await db
        .select({ coinBalance: users.coinBalance })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user || user.coinBalance < coinPrice) {
        return {
          success: false,
          message: "Insufficient coin balance",
        };
      }

      // Check if already purchased
      const [existingPurchase] = await db
        .select()
        .from(coinTransactions)
        .where(
          and(
            eq(coinTransactions.userId, userId),
            eq(coinTransactions.relatedContentId, videoId),
            eq(coinTransactions.relatedContentType, "video"),
            eq(coinTransactions.transactionType, "spend")
          )
        )
        .limit(1);

      if (existingPurchase) {
        return {
          success: false,
          message: "You have already purchased this video",
        };
      }

      // Create transaction and update balances
      await db.transaction(async (tx) => {
        // Deduct coins from user
        await tx
          .update(users)
          .set({
            coinBalance: user.coinBalance - coinPrice,
            totalCoinsSpent: user.coinBalance - coinPrice,
          })
          .where(eq(users.id, userId));

        // Create coin transaction
        await tx.insert(coinTransactions).values({
          userId,
          transactionType: "spend",
          coinAmount: coinPrice,
          relatedContentType: "video",
          relatedContentId: videoId,
          status: "completed",
          description: `Purchased video for ${coinPrice} coins`,
        });

        // Add coins to creator (as earnings)
        await tx.insert(coinTransactions).values({
          userId: creatorId,
          transactionType: "earn",
          coinAmount: coinPrice,
          relatedContentType: "video",
          relatedContentId: videoId,
          status: "completed",
          description: `Earned ${coinPrice} coins from video purchase`,
        });

        // Update creator coin balance
        const [creator] = await tx
          .select({ coinBalance: users.coinBalance })
          .from(users)
          .where(eq(users.id, creatorId))
          .limit(1);

        if (creator) {
          await tx
            .update(users)
            .set({
              coinBalance: creator.coinBalance + coinPrice,
            })
            .where(eq(users.id, creatorId));
        }
      });

      return {
        success: true,
        message: "Video purchased successfully",
      };
    } catch (error) {
      console.error("Error purchasing video:", error);
      return {
        success: false,
        message: "Failed to purchase video",
      };
    }
  }

  /**
   * Get all accessible videos in a series for a user
   */
  static async getAccessibleVideos(
    userId: string,
    seriesId: string
  ): Promise<string[]> {
    try {
      const videosList = await db
        .select({
          videoId: seriesVideos.videoId,
          accessType: seriesVideos.accessType,
        })
        .from(seriesVideos)
        .where(eq(seriesVideos.seriesId, seriesId));

      const accessibleVideoIds: string[] = [];

      for (const video of videosList) {
        const access = await this.checkVideoAccess(
          userId,
          video.videoId,
          seriesId
        );
        if (access.hasAccess) {
          accessibleVideoIds.push(video.videoId);
        }
      }

      return accessibleVideoIds;
    } catch (error) {
      console.error("Error getting accessible videos:", error);
      return [];
    }
  }
}

export const videoAccessService = VideoAccessService;
