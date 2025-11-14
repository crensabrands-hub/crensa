

import { NextResponse } from "next/server";

const CATEGORIES = [
 { id: "1", name: "Art & Design", slug: "art-design" },
 { id: "2", name: "Education", slug: "education" },
 { id: "3", name: "Entertainment", slug: "entertainment" },
 { id: "4", name: "Technology", slug: "technology" },
 { id: "5", name: "Lifestyle", slug: "lifestyle" },
 { id: "6", name: "Music", slug: "music" },
 { id: "7", name: "Gaming", slug: "gaming" },
 { id: "8", name: "Fitness & Health", slug: "fitness-health" },
 { id: "9", name: "Business", slug: "business" },
 { id: "10", name: "Comedy", slug: "comedy" },
];

export async function GET() {
 try {
 return NextResponse.json({
 success: true,
 categories: CATEGORIES.map((cat) => ({
 id: cat.id,
 name: cat.name,
 slug: cat.slug,
 description: "",
 iconUrl: "",
 videoCount: 0,
 seriesCount: 0,
 isActive: true,
 displayOrder: parseInt(cat.id),
 createdAt: new Date(),
 updatedAt: new Date(),
 })),
 });
 } catch (error) {
 console.error("Error fetching categories:", error);
 return NextResponse.json(
 { success: false, error: "Failed to fetch categories" },
 { status: 500 }
 );
 }
}
