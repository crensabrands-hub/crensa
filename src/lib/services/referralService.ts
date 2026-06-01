/**
 * ReferralService — tracking-only, no reward logic.
 * Future reward system: set status='rewarded', populate rewardAmount/rewardIssuedAt.
 */

import { db } from "@/lib/database/connection";
import { users, creatorProfiles, referrals } from "@/lib/database/schema";
import { eq, count, desc, sql } from "drizzle-orm";

// Sentinel Clerk ID for the Crensa platform system creator (never a real Clerk user)
const CRENSA_CLERK_ID = "system_crensa_platform";

// Module-level cache — resolved once per process, never re-queried
let _platformCreatorId: string | null | undefined = undefined;

// Generates a unique referral code: CRNS + 6 uppercase alphanumeric chars
function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "CRNS";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export class ReferralService {
  /**
   * Returns the Crensa platform system creator's user ID.
   * Used as the fallback referrer for organic (un-referred) signups.
   * Returns null if the seed hasn't been run yet — callers handle gracefully.
   */
  static async getPlatformCreatorId(): Promise<string | null> {
    if (_platformCreatorId !== undefined) return _platformCreatorId;

    const result = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, CRENSA_CLERK_ID))
      .limit(1);

    _platformCreatorId = result[0]?.id ?? null;
    return _platformCreatorId;
  }

  /**
   * Ensures a creator has a referral code. Creates one if missing.
   * Called during creator profile creation and as a lazy fallback.
   */
  static async ensureCreatorReferralCode(creatorUserId: string): Promise<string> {
    const profile = await db
      .select({ id: creatorProfiles.id, referralCode: creatorProfiles.referralCode })
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, creatorUserId))
      .limit(1);

    if (!profile.length) throw new Error("Creator profile not found");

    if (profile[0].referralCode) return profile[0].referralCode;

    // Generate a unique code with collision retry
    let code: string;
    let attempts = 0;
    do {
      code = generateReferralCode();
      const existing = await db
        .select({ id: creatorProfiles.id })
        .from(creatorProfiles)
        .where(eq(creatorProfiles.referralCode, code))
        .limit(1);
      if (!existing.length) break;
      attempts++;
    } while (attempts < 10);

    await db
      .update(creatorProfiles)
      .set({ referralCode: code!, updatedAt: new Date() })
      .where(eq(creatorProfiles.userId, creatorUserId));

    return code!;
  }

  /**
   * Looks up a creator by referral code.
   * Returns the creator's user ID, or null if code is invalid/inactive.
   */
  static async resolveReferralCode(
    code: string
  ): Promise<{ creatorUserId: string; displayName: string } | null> {
    if (!code || code.length < 4) return null;

    const result = await db
      .select({
        userId: creatorProfiles.userId,
        displayName: creatorProfiles.displayName,
        isActive: users.isActive,
        isSuspended: users.isSuspended,
      })
      .from(creatorProfiles)
      .innerJoin(users, eq(creatorProfiles.userId, users.id))
      .where(eq(creatorProfiles.referralCode, code.toUpperCase()))
      .limit(1);

    if (!result.length) return null;

    const creator = result[0];
    // Reject if creator account is inactive or suspended
    if (!creator.isActive || creator.isSuspended) return null;

    return { creatorUserId: creator.userId, displayName: creator.displayName };
  }

  /**
   * Records a referral relationship after a new user completes signup.
   * Idempotent — silently succeeds if referral already exists for this user.
   * Prevents self-referral.
   */
  static async recordReferral(params: {
    referrerId: string;
    referredUserId: string;
    referralCode: string;
  }): Promise<{ success: boolean; reason?: string }> {
    const { referrerId, referredUserId, referralCode } = params;

    // Prevent self-referral
    if (referrerId === referredUserId) {
      return { success: false, reason: "self_referral" };
    }

    // Check if this user was already referred (unique constraint on referred_user_id)
    const existing = await db
      .select({ id: referrals.id })
      .from(referrals)
      .where(eq(referrals.referredUserId, referredUserId))
      .limit(1);

    if (existing.length) {
      return { success: false, reason: "already_referred" };
    }

    await db.insert(referrals).values({
      referrerId,
      referredUserId,
      referralCode: referralCode.toUpperCase(),
      status: "completed",
      metadata: { recordedAt: new Date().toISOString() },
    });

    return { success: true };
  }

  /**
   * Gets referral stats for a single creator (for creator dashboard).
   */
  static async getCreatorReferralStats(creatorUserId: string): Promise<{
    referralCode: string | null;
    totalReferred: number;
    recentReferrals: Array<{ username: string; joinedAt: Date }>;
  }> {
    const profile = await db
      .select({ referralCode: creatorProfiles.referralCode })
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, creatorUserId))
      .limit(1);

    const referralCode = profile[0]?.referralCode ?? null;

    const totalResult = await db
      .select({ total: count() })
      .from(referrals)
      .where(eq(referrals.referrerId, creatorUserId));

    const recentResult = await db
      .select({
        username: users.username,
        joinedAt: referrals.createdAt,
      })
      .from(referrals)
      .innerJoin(users, eq(referrals.referredUserId, users.id))
      .where(eq(referrals.referrerId, creatorUserId))
      .orderBy(desc(referrals.createdAt))
      .limit(50); // return up to 50 for the creator dashboard list

    return {
      referralCode,
      totalReferred: totalResult[0]?.total ?? 0,
      recentReferrals: recentResult.map((r) => ({
        username: r.username,
        joinedAt: r.joinedAt,
      })),
    };
  }

  /**
   * Admin: get all users referred by a specific creator, with pagination.
   */
  static async getReferredUsers(
    creatorUserId: string
  ): Promise<
    Array<{
      username: string;
      email: string;
      avatar: string | null;
      joinedAt: Date;
      role: string;
    }>
  > {
    const result = await db
      .select({
        username: users.username,
        email: users.email,
        avatar: users.avatar,
        joinedAt: referrals.createdAt,
        role: users.role,
      })
      .from(referrals)
      .innerJoin(users, eq(referrals.referredUserId, users.id))
      .where(eq(referrals.referrerId, creatorUserId))
      .orderBy(desc(referrals.createdAt));

    return result;
  }

  /**
   * Admin analytics: all creators with their referral stats.
   * Sorted by total referred users descending.
   */
  static async getAdminReferralAnalytics(): Promise<
    Array<{
      creatorUserId: string;
      username: string;
      displayName: string;
      referralCode: string;
      totalReferred: number;
      lastReferralAt: Date | null;
    }>
  > {
    const results = await db
      .select({
        creatorUserId: users.id,
        username: users.username,
        displayName: creatorProfiles.displayName,
        referralCode: creatorProfiles.referralCode,
        totalReferred: sql<number>`COUNT(${referrals.id})`,
        lastReferralAt: sql<Date | null>`MAX(${referrals.createdAt})`,
      })
      .from(creatorProfiles)
      .innerJoin(users, eq(creatorProfiles.userId, users.id))
      .leftJoin(referrals, eq(referrals.referrerId, users.id))
      .where(eq(users.role, "creator"))
      .groupBy(users.id, users.username, creatorProfiles.displayName, creatorProfiles.referralCode)
      .orderBy(sql`COUNT(${referrals.id}) DESC`);

    return results.map((r) => ({
      creatorUserId: r.creatorUserId,
      username: r.username,
      displayName: r.displayName,
      referralCode: r.referralCode ?? "—",
      totalReferred: Number(r.totalReferred),
      lastReferralAt: r.lastReferralAt,
    }));
  }
}
