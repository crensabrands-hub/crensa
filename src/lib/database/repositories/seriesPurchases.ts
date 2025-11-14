import { db } from "@/lib/database";
import { seriesPurchases, seriesProgress, series, users } from "@/lib/database/schema";
import { eq, and, desc, count } from "drizzle-orm";
import type { SeriesPurchase, SeriesProgress, NewSeriesPurchase, NewSeriesProgress } from "@/lib/database/schema";

export class SeriesPurchasesRepository {
 
 async create(data: NewSeriesPurchase): Promise<SeriesPurchase> {
 const [purchase] = await db
 .insert(seriesPurchases)
 .values(data)
 .returning();
 
 return purchase;
 }

 async findById(id: string): Promise<SeriesPurchase | null> {
 const [purchase] = await db
 .select()
 .from(seriesPurchases)
 .where(eq(seriesPurchases.id, id))
 .limit(1);
 
 return purchase || null;
 }

 async findByUserAndSeries(userId: string, seriesId: string): Promise<SeriesPurchase | null> {
 const [purchase] = await db
 .select()
 .from(seriesPurchases)
 .where(
 and(
 eq(seriesPurchases.userId, userId),
 eq(seriesPurchases.seriesId, seriesId),
 eq(seriesPurchases.status, "completed")
 )
 )
 .limit(1);
 
 return purchase || null;
 }

 async findByRazorpayOrderId(orderId: string): Promise<SeriesPurchase | null> {
 const [purchase] = await db
 .select()
 .from(seriesPurchases)
 .where(eq(seriesPurchases.razorpayOrderId, orderId))
 .limit(1);
 
 return purchase || null;
 }

 async update(id: string, data: Partial<NewSeriesPurchase>): Promise<SeriesPurchase> {
 const [purchase] = await db
 .update(seriesPurchases)
 .set({ ...data, updatedAt: new Date() })
 .where(eq(seriesPurchases.id, id))
 .returning();
 
 return purchase;
 }

 async getUserPurchases(userId: string, options?: { limit?: number; offset?: number }) {
 const { limit = 20, offset = 0 } = options || {};
 
 const purchases = await db
 .select({
 purchase: seriesPurchases,
 series: series,
 })
 .from(seriesPurchases)
 .innerJoin(series, eq(seriesPurchases.seriesId, series.id))
 .where(
 and(
 eq(seriesPurchases.userId, userId),
 eq(seriesPurchases.status, "completed")
 )
 )
 .orderBy(desc(seriesPurchases.purchasedAt))
 .limit(limit)
 .offset(offset);
 
 const [{ count: total }] = await db
 .select({ count: count() })
 .from(seriesPurchases)
 .where(
 and(
 eq(seriesPurchases.userId, userId),
 eq(seriesPurchases.status, "completed")
 )
 );
 
 return {
 purchases,
 total,
 hasMore: offset + purchases.length < total,
 };
 }

 async hasAccess(userId: string, seriesId: string): Promise<boolean> {
 const [purchase] = await db
 .select({ id: seriesPurchases.id })
 .from(seriesPurchases)
 .where(
 and(
 eq(seriesPurchases.userId, userId),
 eq(seriesPurchases.seriesId, seriesId),
 eq(seriesPurchases.status, "completed")
 )
 )
 .limit(1);
 
 return !!purchase;
 }

 async getSeriesAccess(userId: string, seriesId: string) {
 const purchase = await this.findByUserAndSeries(userId, seriesId);
 
 if (!purchase) {
 return {
 hasAccess: false,
 purchaseDate: null,
 expiresAt: null,
 progress: null,
 };
 }

 const progress = await this.getSeriesProgress(userId, seriesId);

 return {
 hasAccess: true,
 purchaseDate: purchase.purchasedAt,
 expiresAt: purchase.expiresAt,
 progress,
 };
 }

 async updateProgress(data: NewSeriesProgress): Promise<SeriesProgress> {

 const [existing] = await db
 .select()
 .from(seriesProgress)
 .where(
 and(
 eq(seriesProgress.userId, data.userId),
 eq(seriesProgress.seriesId, data.seriesId)
 )
 )
 .limit(1);

 if (existing) {

 const [updated] = await db
 .update(seriesProgress)
 .set({ ...data, updatedAt: new Date() })
 .where(eq(seriesProgress.id, existing.id))
 .returning();
 
 return updated;
 } else {

 const [created] = await db
 .insert(seriesProgress)
 .values(data)
 .returning();
 
 return created;
 }
 }

 async getSeriesProgress(userId: string, seriesId: string): Promise<SeriesProgress | null> {
 const [progress] = await db
 .select()
 .from(seriesProgress)
 .where(
 and(
 eq(seriesProgress.userId, userId),
 eq(seriesProgress.seriesId, seriesId)
 )
 )
 .limit(1);
 
 return progress || null;
 }

 async getSeriesStats(seriesId: string) {
 const [purchaseStats] = await db
 .select({
 totalPurchases: count(),
 })
 .from(seriesPurchases)
 .where(
 and(
 eq(seriesPurchases.seriesId, seriesId),
 eq(seriesPurchases.status, "completed")
 )
 );

 return {
 totalPurchases: purchaseStats?.totalPurchases || 0,
 };
 }
}

export const seriesPurchasesRepository = new SeriesPurchasesRepository();