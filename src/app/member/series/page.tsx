import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/database";
import { seriesPurchases, seriesProgress, users } from "@/lib/database/schema";
import { eq, and, desc } from "drizzle-orm";
import MemberSeriesLibraryClient from "./MemberSeriesLibraryClient";

export default async function MemberSeriesPage() {

 const { userId: clerkUserId } = await auth();

 if (!clerkUserId) {
 redirect("/sign-in");
 }

 const user = await db.query.users.findFirst({
 where: eq(users.clerkId, clerkUserId),
 });

 if (!user) {
 redirect("/sign-in");
 }

 if (user.role !== "member") {
 redirect("/");
 }

 const purchases = await db.query.seriesPurchases.findMany({
 where: and(
 eq(seriesPurchases.userId, user.id),
 eq(seriesPurchases.status, "completed")
 ),
 with: {
 series: {
 with: {
 creator: {
 with: {
 creatorProfile: true,
 },
 },
 videos: {
 columns: {
 id: true,
 },
 },
 },
 },
 },
 orderBy: [desc(seriesPurchases.purchasedAt)],
 });

 const purchasedSeriesWithProgress = await Promise.all(
 purchases.map(async (purchase) => {
 const progress = await db.query.seriesProgress.findFirst({
 where: and(
 eq(seriesProgress.userId, user.id),
 eq(seriesProgress.seriesId, purchase.seriesId)
 ),
 });

 return {
 series: purchase.series,
 purchaseDate: purchase.purchasedAt,
 progress: progress
 ? {
 videosWatched: progress.videosWatched,
 totalVideos: progress.totalVideos,
 percentage: parseFloat(progress.progressPercentage),
 lastWatchedAt: progress.lastWatchedAt,
 }
 : {
 videosWatched: 0,
 totalVideos: purchase.series.videoCount,
 percentage: 0,
 lastWatchedAt: null,
 },
 };
 })
 );

 return (
 <MemberSeriesLibraryClient
 purchasedSeries={purchasedSeriesWithProgress}
 userId={user.id}
 />
 );
}
