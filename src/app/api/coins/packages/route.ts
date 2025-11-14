import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/connection'
import { coinPackages } from '@/lib/database/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
 try {

 const packages = await db
 .select({
 id: coinPackages.id,
 name: coinPackages.name,
 coinAmount: coinPackages.coinAmount,
 rupeePrice: coinPackages.rupeePrice,
 bonusCoins: coinPackages.bonusCoins,
 isPopular: coinPackages.isPopular,
 displayOrder: coinPackages.displayOrder,
 })
 .from(coinPackages)
 .where(eq(coinPackages.isActive, true))
 .orderBy(asc(coinPackages.displayOrder))

 const formattedPackages = packages.map(pkg => ({
 ...pkg,
 rupeePrice: parseFloat(pkg.rupeePrice),
 totalCoins: pkg.coinAmount + pkg.bonusCoins
 }))

 return NextResponse.json({
 packages: formattedPackages
 })
 } catch (error) {
 console.error('Error fetching coin packages:', error)
 return NextResponse.json(
 { error: 'Internal server error' },
 { status: 500 }
 )
 }
}
