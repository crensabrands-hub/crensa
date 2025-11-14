

import { NextRequest, NextResponse } from "next/server";
import { TrendingService } from "@/lib/services/trendingService";

export async function GET(request: NextRequest) {
 try {
 const { searchParams } = new URL(request.url);
 const limit = parseInt(searchParams.get('limit') || '20');

 if (limit < 1 || limit > 100) {
 return NextResponse.json(
 { error: 'Limit must be between 1 and 100' },
 { status: 400 }
 );
 }

 const trendingShows = await TrendingService.calculateTrendingShows(limit);

 return NextResponse.json({
 success: true,
 data: trendingShows,
 count: trendingShows.length,
 metadata: {
 calculatedAt: new Date().toISOString(),
 period: '7 days'
 }
 });

 } catch (error) {
 console.error('Error fetching trending shows:', error);
 
 return NextResponse.json(
 { 
 error: 'Failed to fetch trending shows',
 success: false 
 },
 { status: 500 }
 );
 }
}