

import { eq, and, sql, gte, lte, desc, asc } from "drizzle-orm";
import { db } from "../connection";
import {
 transactions,
 users,
 videos,
 type Transaction,
 type NewTransaction,
 type TransactionType,
} from "../schema";

export interface TransactionWithDetails extends Transaction {
 user?: {
 id: string;
 username: string;
 email: string;
 };
 video?: {
 id: string;
 title: string;
 };
 creator?: {
 id: string;
 username: string;
 };
}

export interface TransactionFilters {
 userId?: string;
 creatorId?: string;
 videoId?: string;
 type?: TransactionType;
 status?: "pending" | "completed" | "failed";
 startDate?: Date;
 endDate?: Date;
 razorpayOrderId?: string;
 metadata?: any;
}

export interface PaginationOptions {
 page?: number;
 limit?: number;
 sortBy?: "createdAt" | "amount";
 sortOrder?: "asc" | "desc";
}

export class TransactionRepository {
 
 async create(transactionData: NewTransaction): Promise<Transaction> {
 const result = await db
 .insert(transactions)
 .values(transactionData)
 .returning();
 if (!result || !Array.isArray(result) || result.length === 0) {
 throw new Error('Failed to create transaction');
 }
 return result[0] as Transaction;
 }

 async findById(id: string): Promise<TransactionWithDetails | null> {
 const result = await db
 .select({
 transaction: transactions,
 user: {
 id: users.id,
 username: users.username,
 email: users.email,
 },
 video: {
 id: videos.id,
 title: videos.title,
 },
 })
 .from(transactions)
 .leftJoin(users, eq(transactions.userId, users.id))
 .leftJoin(videos, eq(transactions.videoId, videos.id))
 .where(eq(transactions.id, id))
 .limit(1);

 if (result.length === 0) return null;

 const row = result[0];
 return {
 ...row.transaction,
 user: row.user || undefined,
 video: row.video || undefined,
 };
 }

 async findByRazorpayPaymentId(
 paymentId: string
 ): Promise<Transaction | null> {
 const result = await db
 .select()
 .from(transactions)
 .where(eq(transactions.razorpayPaymentId, paymentId))
 .limit(1);

 return (result && Array.isArray(result) && result.length > 0) ? result[0] as Transaction : null;
 }

 async findMany(
 filters: TransactionFilters = {},
 pagination: PaginationOptions = {}
 ): Promise<{ transactions: TransactionWithDetails[]; total: number }> {
 const {
 page = 1,
 limit = 20,
 sortBy = "createdAt",
 sortOrder = "desc",
 } = pagination;

 const offset = (page - 1) * limit;

 const conditions = [];

 if (filters.userId) {
 conditions.push(eq(transactions.userId, filters.userId));
 }

 if (filters.creatorId) {
 conditions.push(eq(transactions.creatorId, filters.creatorId));
 }

 if (filters.videoId) {
 conditions.push(eq(transactions.videoId, filters.videoId));
 }

 if (filters.type) {
 conditions.push(eq(transactions.type, filters.type));
 }

 if (filters.status) {
 conditions.push(eq(transactions.status, filters.status));
 }

 if (filters.startDate) {
 conditions.push(gte(transactions.createdAt, filters.startDate));
 }

 if (filters.endDate) {
 conditions.push(lte(transactions.createdAt, filters.endDate));
 }

 if (filters.razorpayOrderId) {
 conditions.push(
 eq(transactions.razorpayOrderId, filters.razorpayOrderId)
 );
 }

 const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

 const sortColumn = transactions[sortBy];
 const orderClause =
 sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

 const transactionsResult = await db
 .select({
 transaction: transactions,
 user: {
 id: users.id,
 username: users.username,
 email: users.email,
 },
 video: {
 id: videos.id,
 title: videos.title,
 },
 })
 .from(transactions)
 .leftJoin(users, eq(transactions.userId, users.id))
 .leftJoin(videos, eq(transactions.videoId, videos.id))
 .where(whereClause)
 .orderBy(orderClause)
 .limit(limit)
 .offset(offset);

 const [{ count }] = await db
 .select({ count: sql<number>`count(*)` })
 .from(transactions)
 .where(whereClause);

 const transactionsWithDetails = transactionsResult.map((row) => ({
 ...row.transaction,
 user: row.user || undefined,
 video: row.video || undefined,
 }));

 return {
 transactions: transactionsWithDetails,
 total: count,
 };
 }

 async update(
 id: string,
 transactionData: Partial<NewTransaction>
 ): Promise<Transaction | null> {
 const [transaction] = await db
 .update(transactions)
 .set({ ...transactionData, updatedAt: new Date() })
 .where(eq(transactions.id, id))
 .returning();

 return transaction || null;
 }

 async updateStatus(
 id: string,
 status: "pending" | "completed" | "failed"
 ): Promise<Transaction | null> {
 const [transaction] = await db
 .update(transactions)
 .set({ status, updatedAt: new Date() })
 .where(eq(transactions.id, id))
 .returning();

 return transaction || null;
 }

 async getUserWalletBalance(userId: string): Promise<number> {
 const result = await db
 .select({
 totalCoins: sql<number>`
 COALESCE(SUM(CASE WHEN type = 'coin_purchase' AND status = 'completed' THEN amount ELSE 0 END), 0)
 `,
 totalSpent: sql<number>`
 COALESCE(SUM(CASE WHEN type = 'video_view' AND status = 'completed' THEN amount ELSE 0 END), 0)
 `,
 })
 .from(transactions)
 .where(eq(transactions.userId, userId));

 if (result.length === 0) return 0;

 const { totalCoins, totalSpent } = result[0] as { totalCoins: number; totalSpent: number };
 return totalCoins - totalSpent;
 }

 async getCreatorEarnings(creatorId: string): Promise<number> {
 const result = await db
 .select({
 totalEarnings: sql<number>`
 COALESCE(SUM(CASE WHEN type = 'creator_earning' AND status = 'completed' THEN amount ELSE 0 END), 0)
 `,
 })
 .from(transactions)
 .where(eq(transactions.creatorId, creatorId));

 if (result.length === 0) return 0;

 return (result[0] as { totalEarnings: number }).totalEarnings;
 }

 async getEarningsByDateRange(
 creatorId: string,
 startDate: Date,
 endDate: Date
 ): Promise<{ date: string; earnings: number }[]> {
 const result = await db
 .select({
 date: sql<string>`DATE(created_at)`,
 earnings: sql<number>`COALESCE(SUM(amount), 0)`,
 })
 .from(transactions)
 .where(
 and(
 eq(transactions.creatorId, creatorId),
 eq(transactions.type, "creator_earning" as TransactionType),
 eq(transactions.status, "completed"),
 gte(transactions.createdAt, startDate),
 lte(transactions.createdAt, endDate)
 )
 )
 .groupBy(sql`DATE(created_at)`)
 .orderBy(sql`DATE(created_at)`);

 return result;
 }

 async createCoinPurchase(
 userId: string,
 amount: number,
 razorpayPaymentId?: string,
 razorpayOrderId?: string
 ): Promise<Transaction> {
 return this.create({
 userId,
 type: "coin_purchase" as TransactionType,
 amount: amount.toString(),
 razorpayPaymentId,
 razorpayOrderId,
 status: razorpayPaymentId ? "completed" : "pending",
 });
 }

 async createVideoView(
 userId: string,
 videoId: string,
 creatorId: string,
 amount: number
 ): Promise<Transaction> {
 return this.create({
 userId,
 videoId,
 creatorId,
 type: "video_view" as TransactionType,
 amount: amount.toString(),
 status: "completed",
 });
 }

 async createCreatorEarning(
 creatorId: string,
 videoId: string,
 amount: number,
 metadata?: any
 ): Promise<Transaction> {
 return this.create({
 userId: creatorId,
 videoId,
 creatorId,
 type: "creator_earning" as TransactionType,
 amount: amount.toString(),
 status: "completed",
 metadata,
 });
 }

 async findByUserAndDateRange(
 userId: string,
 startDate: Date,
 endDate: Date,
 type?: TransactionType
 ): Promise<Transaction[]> {
 const conditions = [
 eq(transactions.userId, userId),
 gte(transactions.createdAt, startDate),
 lte(transactions.createdAt, endDate)
 ];

 if (type) {
 conditions.push(eq(transactions.type, type));
 }

 const result = await db
 .select()
 .from(transactions)
 .where(and(...conditions))
 .orderBy(desc(transactions.createdAt));

 return result;
 }

 async findByUserAndTypes(
 userId: string,
 types: TransactionType[]
 ): Promise<Transaction[]> {
 const result = await db
 .select()
 .from(transactions)
 .where(
 and(
 eq(transactions.userId, userId),
 sql`${transactions.type} = ANY(${types})`
 )
 )
 .orderBy(desc(transactions.createdAt));

 return result;
 }

 async delete(id: string): Promise<boolean> {
 const result = await db.delete(transactions).where(eq(transactions.id, id));
 return (result.rowCount ?? 0) > 0;
 }
}

export const transactionRepository = new TransactionRepository();
