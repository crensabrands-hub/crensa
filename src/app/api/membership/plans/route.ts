import { NextRequest, NextResponse } from 'next/server'
import type { MembershipPlan } from '@/types'

export async function GET(request: NextRequest) {
 try {

 const plans: MembershipPlan[] = [
 {
 id: 'monthly',
 name: 'Monthly Premium',
 description: 'Perfect for trying out premium features',
 price: 299,
 duration: 30,
 features: [
 'Access to all exclusive content',
 'Ad-free viewing experience',
 'Priority customer support',
 'Early access to new shows',
 'Direct creator messaging',
 'Unlimited viewing history'
 ]
 },
 {
 id: 'quarterly',
 name: 'Quarterly Premium',
 description: 'Best value for regular users',
 price: 799,
 originalPrice: 897,
 discountPercentage: 11,
 duration: 90,
 isPopular: true,
 features: [
 'All Monthly Premium features',
 'Exclusive quarterly content drops',
 'Priority access to live events',
 'Advanced analytics dashboard',
 'Custom profile themes',
 'Download for offline viewing'
 ]
 },
 {
 id: 'yearly',
 name: 'Yearly Premium',
 description: 'Maximum savings for committed users',
 price: 2999,
 originalPrice: 3588,
 discountPercentage: 16,
 duration: 365,
 features: [
 'All Quarterly Premium features',
 'Annual exclusive content library',
 'VIP creator meet & greet access',
 'Custom badges and recognition',
 'Advanced content recommendations',
 'Priority feature requests'
 ]
 }
 ]

 return NextResponse.json(plans)
 } catch (error) {
 console.error('Error fetching membership plans:', error)
 return NextResponse.json(
 { error: 'Failed to fetch membership plans' },
 { status: 500 }
 )
 }
}