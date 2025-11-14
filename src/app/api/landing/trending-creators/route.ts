

import { NextRequest, NextResponse } from "next/server";
import { TrendingService } from "@/lib/services/trendingService";

export async function GET(request: NextRequest) {
 try {
 const { searchParams } = new URL(request.url);
 const limit = parseInt(searchParams.get('limit') || '10');

 if (limit < 1 || limit > 50) {
 return NextResponse.json(
 { error: 'Limit must be between 1 and 50' },
 { status: 400 }
 );
 }

 const trendingCreators = await TrendingService.calculateTrendingCreators(limit);

 return NextResponse.json({
 success: true,
 data: trendingCreators,
 count: trendingCreators.length,
 metadata: {
 calculatedAt: new Date().toISOString(),
 period: '7 days'
 }
 });

 } catch (error) {
 console.error('Error fetching trending creators:', error);
 
 return NextResponse.json(
 { 
 error: 'Failed to fetch trending creators',
 success: false 
 },
 { status: 500 }
 );
 }
}