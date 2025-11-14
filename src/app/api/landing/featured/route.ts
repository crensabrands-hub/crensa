

import { NextRequest, NextResponse } from "next/server";
import { TrendingService } from "@/lib/services/trendingService";

export async function GET(request: NextRequest) {
 try {
 const { searchParams } = new URL(request.url);
 const limit = parseInt(searchParams.get('limit') || '5');

 if (limit < 1 || limit > 20) {
 return NextResponse.json(
 { error: 'Limit must be between 1 and 20' },
 { status: 400 }
 );
 }

 const featuredContent = await TrendingService.getFeaturedContent(limit);

 return NextResponse.json({
 success: true,
 data: featuredContent,
 count: featuredContent.length
 });

 } catch (error) {
 console.error('Error fetching featured content:', error);
 
 return NextResponse.json(
 { 
 error: 'Failed to fetch featured content',
 success: false 
 },
 { status: 500 }
 );
 }
}