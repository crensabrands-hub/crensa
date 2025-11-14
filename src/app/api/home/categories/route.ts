import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/connection'
import { videos } from '@/lib/database/schema'
import { sql, eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
 try {

 const categoryStats = await db
 .select({
 category: videos.category,
 count: sql<number>`count(*)::int`
 })
 .from(videos)
 .where(eq(videos.isActive, true))
 .groupBy(videos.category)
 .orderBy(sql`count(*) desc`)

 const categoryConfig: Record<string, { icon: string; color: string; id: string }> = {
 'Dance': { icon: '💃', color: 'bg-accent-pink', id: 'dance' },
 'Comedy': { icon: '😂', color: 'bg-primary-neon-yellow', id: 'comedy' },
 'Cooking': { icon: '👨‍🍳', color: 'bg-accent-green', id: 'cooking' },
 'Music': { icon: '🎵', color: 'bg-accent-green', id: 'music' },
 'Fitness': { icon: '💪', color: 'bg-red-500', id: 'fitness' },
 'Art': { icon: '🎨', color: 'bg-purple-500', id: 'art' },
 'Art & Design': { icon: '🎨', color: 'bg-purple-500', id: 'art-design' },
 'Education': { icon: '📚', color: 'bg-accent-teal', id: 'education' },
 'Technology': { icon: '💻', color: 'bg-gray-500', id: 'technology' },
 'Lifestyle': { icon: '✨', color: 'bg-teal-500', id: 'lifestyle' },
 'Gaming': { icon: '🎮', color: 'bg-violet-500', id: 'gaming' }
 }

 const formattedCategories = categoryStats.map(stat => {
 const config = categoryConfig[stat.category] || { 
 icon: '📹', 
 color: 'bg-gray-500', 
 id: stat.category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '') 
 };
 
 return {
 id: config.id,
 name: stat.category,
 icon: config.icon,
 videoCount: stat.count,
 color: config.color
 };
 })

 return NextResponse.json(formattedCategories)
 } catch (error) {
 console.error('Error fetching categories:', error)
 return NextResponse.json(
 { error: 'Failed to fetch categories' },
 { status: 500 }
 )
 }
}