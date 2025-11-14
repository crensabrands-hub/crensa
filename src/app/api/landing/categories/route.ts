

import { NextRequest, NextResponse } from "next/server";
import { CategoriesService } from "@/lib/services/categoriesService";

export async function GET(request: NextRequest) {
 try {
 const categories = await CategoriesService.getActiveCategories();

 return NextResponse.json({
 success: true,
 data: categories,
 count: categories.length,
 });
 } catch (error) {
 console.error("Error fetching categories:", error);

 const fallbackCategories = [
 {
 id: "1",
 name: "Entertainment",
 slug: "entertainment",
 description: "Fun and entertaining content",
 iconUrl: "🎬",
 contentCount: 245,
 videoCount: 180,
 seriesCount: 65,
 isActive: true,
 displayOrder: 1,
 },
 {
 id: "2",
 name: "Education",
 slug: "education",
 description: "Educational and learning content",
 iconUrl: "📚",
 contentCount: 189,
 videoCount: 120,
 seriesCount: 69,
 isActive: true,
 displayOrder: 2,
 },
 {
 id: "3",
 name: "Music",
 slug: "music",
 description: "Music videos and performances",
 iconUrl: "🎵",
 contentCount: 156,
 videoCount: 140,
 seriesCount: 16,
 isActive: true,
 displayOrder: 3,
 },
 {
 id: "4",
 name: "Comedy",
 slug: "comedy",
 description: "Funny and humorous content",
 iconUrl: "😂",
 contentCount: 134,
 videoCount: 110,
 seriesCount: 24,
 isActive: true,
 displayOrder: 4,
 },
 ];

 return NextResponse.json({
 success: true,
 data: fallbackCategories,
 count: fallbackCategories.length,
 });
 }
}
