import { db } from "@/lib/database/connection";
import {
 users,
 videos,
 reports,
 auditLogs,
 contentFilters,
} from "@/lib/database/schema";
import { eq, desc, count, sql, and, or, like, gte, lte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export interface AdminStats {
 totalUsers: number;
 totalCreators: number;
 totalMembers: number;
 totalVideos: number;
 totalReports: number;
 pendingReports: number;
 suspendedUsers: number;
 flaggedVideos: number;
 totalRevenue: number;
 monthlyActiveUsers: number;
}

export interface UserManagementData {
 id: string;
 username: string;
 email: string;
 role: string;
 isActive: boolean;
 isSuspended: boolean;
 suspensionReason?: string;
 createdAt: string;
 totalEarnings?: number;
 videoCount?: number;
 walletBalance?: number;
}

export interface VideoModerationData {
 id: string;
 title: string;
 creatorName: string;
 category: string;
 viewCount: number;
 moderationStatus: string;
 moderationReason?: string;
 createdAt: string;
 reportCount: number;
}

export interface ReportData {
 id: string;
 type: string;
 reason: string;
 description?: string;
 status: string;
 reporterName: string;
 reportedUserName?: string;
 reportedVideoTitle?: string;
 createdAt: string;
 reviewedAt?: string;
 reviewedBy?: string;
}

export interface AuditLogData {
 id: string;
 adminName: string;
 action: string;
 targetType: string;
 targetId: string;
 details?: any;
 ipAddress?: string;
 createdAt: string;
}

export class AdminService {
 static async getAdminStats(): Promise<AdminStats> {
 try {
 const [
 totalUsersResult,
 totalCreatorsResult,
 totalMembersResult,
 totalVideosResult,
 totalReportsResult,
 pendingReportsResult,
 suspendedUsersResult,
 flaggedVideosResult,
 ] = await Promise.all([
 db.select({ count: count() }).from(users),
 db
 .select({ count: count() })
 .from(users)
 .where(eq(users.role, "creator")),
 db
 .select({ count: count() })
 .from(users)
 .where(eq(users.role, "member")),
 db.select({ count: count() }).from(videos),
 db.select({ count: count() }).from(reports),
 db
 .select({ count: count() })
 .from(reports)
 .where(eq(reports.status, "pending")),
 db
 .select({ count: count() })
 .from(users)
 .where(eq(users.isSuspended, true)),
 db
 .select({ count: count() })
 .from(videos)
 .where(eq(videos.moderationStatus, "flagged")),
 ]);

 const thirtyDaysAgo = new Date();
 thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

 const monthlyActiveUsersResult = await db
 .select({ count: count() })
 .from(users)
 .where(gte(users.updatedAt, thirtyDaysAgo));

 return {
 totalUsers: totalUsersResult[0]?.count || 0,
 totalCreators: totalCreatorsResult[0]?.count || 0,
 totalMembers: totalMembersResult[0]?.count || 0,
 totalVideos: totalVideosResult[0]?.count || 0,
 totalReports: totalReportsResult[0]?.count || 0,
 pendingReports: pendingReportsResult[0]?.count || 0,
 suspendedUsers: suspendedUsersResult[0]?.count || 0,
 flaggedVideos: flaggedVideosResult[0]?.count || 0,
 totalRevenue: 0, // This would need to be calculated from transactions
 monthlyActiveUsers: monthlyActiveUsersResult[0]?.count || 0,
 };
 } catch (error) {
 console.error("Error fetching admin stats:", error);
 throw new Error("Failed to fetch admin statistics");
 }
 }

 static async getUsersForManagement(
 page: number = 1,
 limit: number = 20,
 search?: string,
 role?: string,
 status?: string
 ): Promise<{ users: UserManagementData[]; total: number }> {
 try {
 const offset = (page - 1) * limit;
 let whereConditions = [];

 if (search) {
 whereConditions.push(
 or(
 like(users.username, `%${search}%`),
 like(users.email, `%${search}%`)
 )
 );
 }

 if (role && role !== "all") {
 whereConditions.push(eq(users.role, role as "creator" | "member" | "admin"));
 }

 if (status === "suspended") {
 whereConditions.push(eq(users.isSuspended, true));
 } else if (status === "active") {
 whereConditions.push(
 and(eq(users.isActive, true), eq(users.isSuspended, false))
 );
 }

 const whereClause =
 whereConditions.length > 0 ? and(...whereConditions) : undefined;

 const [usersResult, totalResult] = await Promise.all([
 db
 .select({
 id: users.id,
 username: users.username,
 email: users.email,
 role: users.role,
 isActive: users.isActive,
 isSuspended: users.isSuspended,
 suspensionReason: users.suspensionReason,
 createdAt: users.createdAt,
 })
 .from(users)
 .where(whereClause)
 .orderBy(desc(users.createdAt))
 .limit(limit)
 .offset(offset),
 db.select({ count: count() }).from(users).where(whereClause),
 ]);

 return {
 users: usersResult.map(user => ({
 ...user,
 suspensionReason: user.suspensionReason || undefined,
 createdAt: user.createdAt.toISOString()
 })),
 total: totalResult[0]?.count || 0,
 };
 } catch (error) {
 console.error("Error fetching users for management:", error);
 throw new Error("Failed to fetch users");
 }
 }

 static async suspendUser(
 userId: string,
 adminId: string,
 reason: string,
 ipAddress?: string
 ): Promise<void> {
 try {
 await db.transaction(async (tx) => {

 await tx
 .update(users)
 .set({
 isSuspended: true,
 suspensionReason: reason,
 suspendedAt: new Date(),
 suspendedBy: adminId,
 updatedAt: new Date(),
 })
 .where(eq(users.id, userId));

 await tx.insert(auditLogs).values({
 adminId,
 action: "suspend_user",
 targetType: "user",
 targetId: userId,
 details: { reason },
 ipAddress,
 });
 });
 } catch (error) {
 console.error("Error suspending user:", error);
 throw new Error("Failed to suspend user");
 }
 }

 static async unsuspendUser(
 userId: string,
 adminId: string,
 ipAddress?: string
 ): Promise<void> {
 try {
 await db.transaction(async (tx) => {

 await tx
 .update(users)
 .set({
 isSuspended: false,
 suspensionReason: null,
 suspendedAt: null,
 suspendedBy: null,
 updatedAt: new Date(),
 })
 .where(eq(users.id, userId));

 await tx.insert(auditLogs).values({
 adminId,
 action: "unsuspend_user",
 targetType: "user",
 targetId: userId,
 ipAddress,
 });
 });
 } catch (error) {
 console.error("Error unsuspending user:", error);
 throw new Error("Failed to unsuspend user");
 }
 }

 static async getVideosForModeration(
 page: number = 1,
 limit: number = 20,
 status?: string,
 category?: string
 ): Promise<{ videos: VideoModerationData[]; total: number }> {
 try {
 const offset = (page - 1) * limit;
 let whereConditions = [];

 if (status && status !== "all") {
 whereConditions.push(
 eq(
 videos.moderationStatus,
 status as "approved" | "pending" | "rejected" | "flagged"
 )
 );
 }

 if (category && category !== "all") {
 whereConditions.push(eq(videos.category, category));
 }

 const whereClause =
 whereConditions.length > 0 ? and(...whereConditions) : undefined;

 const [videosResult, totalResult] = await Promise.all([
 db
 .select({
 id: videos.id,
 title: videos.title,
 creatorName: users.username,
 category: videos.category,
 viewCount: videos.viewCount,
 moderationStatus: videos.moderationStatus,
 moderationReason: videos.moderationReason,
 createdAt: videos.createdAt,
 })
 .from(videos)
 .leftJoin(users, eq(videos.creatorId, users.id))
 .where(whereClause)
 .orderBy(desc(videos.createdAt))
 .limit(limit)
 .offset(offset),
 db.select({ count: count() }).from(videos).where(whereClause),
 ]);

 const videoIds = videosResult.map((v) => v.id);
 const reportCounts = await db
 .select({
 videoId: reports.reportedVideoId,
 count: count(),
 })
 .from(reports)
 .where(sql`${reports.reportedVideoId} IN ${videoIds}`)
 .groupBy(reports.reportedVideoId);

 const reportCountMap = new Map(
 reportCounts.map((r) => [r.videoId, r.count])
 );

 const videosWithReportCounts = videosResult.map((video) => ({
 ...video,
 creatorName: video.creatorName || 'Unknown Creator',
 moderationReason: video.moderationReason || undefined,
 createdAt: video.createdAt.toISOString(),
 reportCount: reportCountMap.get(video.id) || 0,
 }));

 return {
 videos: videosWithReportCounts,
 total: totalResult[0]?.count || 0,
 };
 } catch (error) {
 console.error("Error fetching videos for moderation:", error);
 throw new Error("Failed to fetch videos");
 }
 }

 static async moderateVideo(
 videoId: string,
 adminId: string,
 status: string,
 reason?: string,
 ipAddress?: string
 ): Promise<void> {
 try {
 await db.transaction(async (tx) => {

 await tx
 .update(videos)
 .set({
 moderationStatus: status as
 | "approved"
 | "pending"
 | "rejected"
 | "flagged",
 moderationReason: reason,
 moderatedAt: new Date(),
 moderatedBy: adminId,
 updatedAt: new Date(),
 })
 .where(eq(videos.id, videoId));

 await tx.insert(auditLogs).values({
 adminId,
 action: "moderate_video",
 targetType: "video",
 targetId: videoId,
 details: { status, reason },
 ipAddress,
 });
 });
 } catch (error) {
 console.error("Error moderating video:", error);
 throw new Error("Failed to moderate video");
 }
 }

 static async getReports(
 page: number = 1,
 limit: number = 20,
 status?: string,
 type?: string
 ): Promise<{ reports: ReportData[]; total: number }> {
 try {
 const offset = (page - 1) * limit;
 let whereConditions = [];

 if (status && status !== "all") {
 whereConditions.push(
 eq(
 reports.status,
 status as "pending" | "reviewed" | "resolved" | "dismissed"
 )
 );
 }

 if (type && type !== "all") {
 whereConditions.push(
 eq(
 reports.type,
 type as
 | "user"
 | "video"
 | "comment"
 | "spam"
 | "harassment"
 | "inappropriate_content"
 )
 );
 }

 const whereClause =
 whereConditions.length > 0 ? and(...whereConditions) : undefined;

 const [reportsResult, totalResult] = await Promise.all([
 db
 .select({
 id: reports.id,
 type: reports.type,
 reason: reports.reason,
 description: reports.description,
 status: reports.status,
 reporterName: sql<string>`reporter.username`,
 reportedUserName: sql<string>`reported_user.username`,
 reportedVideoTitle: videos.title,
 createdAt: reports.createdAt,
 reviewedAt: reports.reviewedAt,
 reviewedByName: sql<string>`reviewer.username`,
 })
 .from(reports)
 .leftJoin(alias(users, "reporter"), eq(reports.reporterId, users.id))
 .leftJoin(
 alias(users, "reported_user"),
 eq(reports.reportedUserId, users.id)
 )
 .leftJoin(videos, eq(reports.reportedVideoId, videos.id))
 .leftJoin(alias(users, "reviewer"), eq(reports.reviewedBy, users.id))
 .where(whereClause)
 .orderBy(desc(reports.createdAt))
 .limit(limit)
 .offset(offset),
 db.select({ count: count() }).from(reports).where(whereClause),
 ]);

 return {
 reports: reportsResult.map((report) => ({
 id: report.id,
 type: report.type,
 reason: report.reason,
 description: report.description || undefined,
 status: report.status,
 reporterName: report.reporterName || "Unknown",
 reportedUserName: report.reportedUserName || undefined,
 reportedVideoTitle: report.reportedVideoTitle || undefined,
 createdAt: report.createdAt.toISOString(),
 reviewedAt: report.reviewedAt?.toISOString(),
 reviewedBy: report.reviewedByName || undefined,
 })),
 total: totalResult[0]?.count || 0,
 };
 } catch (error) {
 console.error("Error fetching reports:", error);
 throw new Error("Failed to fetch reports");
 }
 }

 static async reviewReport(
 reportId: string,
 adminId: string,
 status: string,
 resolution?: string,
 ipAddress?: string
 ): Promise<void> {
 try {
 await db.transaction(async (tx) => {

 await tx
 .update(reports)
 .set({
 status: status as "pending" | "reviewed" | "resolved" | "dismissed",
 resolution,
 reviewedBy: adminId,
 reviewedAt: new Date(),
 updatedAt: new Date(),
 })
 .where(eq(reports.id, reportId));

 await tx.insert(auditLogs).values({
 adminId,
 action: "review_report",
 targetType: "report",
 targetId: reportId,
 details: { status, resolution },
 ipAddress,
 });
 });
 } catch (error) {
 console.error("Error reviewing report:", error);
 throw new Error("Failed to review report");
 }
 }

 static async getAuditLogs(
 page: number = 1,
 limit: number = 50,
 adminId?: string,
 action?: string,
 startDate?: string,
 endDate?: string
 ): Promise<{ logs: AuditLogData[]; total: number }> {
 try {
 const offset = (page - 1) * limit;
 let whereConditions = [];

 if (adminId) {
 whereConditions.push(eq(auditLogs.adminId, adminId));
 }

 if (action && action !== "all") {
 whereConditions.push(eq(auditLogs.action, action));
 }

 if (startDate) {
 whereConditions.push(gte(auditLogs.createdAt, new Date(startDate)));
 }

 if (endDate) {
 whereConditions.push(lte(auditLogs.createdAt, new Date(endDate)));
 }

 const whereClause =
 whereConditions.length > 0 ? and(...whereConditions) : undefined;

 const [logsResult, totalResult] = await Promise.all([
 db
 .select({
 id: auditLogs.id,
 adminName: users.username,
 action: auditLogs.action,
 targetType: auditLogs.targetType,
 targetId: auditLogs.targetId,
 details: auditLogs.details,
 ipAddress: auditLogs.ipAddress,
 createdAt: auditLogs.createdAt,
 })
 .from(auditLogs)
 .leftJoin(users, eq(auditLogs.adminId, users.id))
 .where(whereClause)
 .orderBy(desc(auditLogs.createdAt))
 .limit(limit)
 .offset(offset),
 db.select({ count: count() }).from(auditLogs).where(whereClause),
 ]);

 return {
 logs: logsResult.map((log) => ({
 id: log.id,
 adminName: log.adminName || "Unknown",
 action: log.action,
 targetType: log.targetType,
 targetId: log.targetId,
 details: log.details,
 ipAddress: log.ipAddress || undefined,
 createdAt: log.createdAt.toISOString(),
 })),
 total: totalResult[0]?.count || 0,
 };
 } catch (error) {
 console.error("Error fetching audit logs:", error);
 throw new Error("Failed to fetch audit logs");
 }
 }
}
