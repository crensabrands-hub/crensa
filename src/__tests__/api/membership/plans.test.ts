

import { GET } from '@/app/api/membership/plans/route'
import { NextRequest } from 'next/server'

describe('/api/membership/plans', () => {
 it('should return membership plans', async () => {
 const request = new NextRequest('http://localhost:3000/api/membership/plans')
 const response = await GET(request)
 
 expect(response.status).toBe(200)
 
 const data = await response.json()
 expect(Array.isArray(data)).toBe(true)
 expect(data).toHaveLength(3)

 const monthlyPlan = data.find((plan: any) => plan.id === 'monthly')
 expect(monthlyPlan).toBeDefined()
 expect(monthlyPlan.name).toBe('Monthly Premium')
 expect(monthlyPlan.price).toBe(299)
 expect(monthlyPlan.duration).toBe(30)
 expect(Array.isArray(monthlyPlan.features)).toBe(true)

 const quarterlyPlan = data.find((plan: any) => plan.id === 'quarterly')
 expect(quarterlyPlan).toBeDefined()
 expect(quarterlyPlan.isPopular).toBe(true)
 expect(quarterlyPlan.discountPercentage).toBe(11)
 expect(quarterlyPlan.originalPrice).toBe(897)

 const yearlyPlan = data.find((plan: any) => plan.id === 'yearly')
 expect(yearlyPlan).toBeDefined()
 expect(yearlyPlan.price).toBe(2999)
 expect(yearlyPlan.duration).toBe(365)
 expect(yearlyPlan.discountPercentage).toBe(16)
 })

 it('should include all required plan properties', async () => {
 const request = new NextRequest('http://localhost:3000/api/membership/plans')
 const response = await GET(request)
 
 const data = await response.json()
 
 data.forEach((plan: any) => {
 expect(plan).toHaveProperty('id')
 expect(plan).toHaveProperty('name')
 expect(plan).toHaveProperty('description')
 expect(plan).toHaveProperty('price')
 expect(plan).toHaveProperty('duration')
 expect(plan).toHaveProperty('features')
 expect(Array.isArray(plan.features)).toBe(true)
 expect(plan.features.length).toBeGreaterThan(0)
 })
 })

 it('should have proper pricing structure', async () => {
 const request = new NextRequest('http://localhost:3000/api/membership/plans')
 const response = await GET(request)
 
 const data = await response.json()
 
 const monthlyPlan = data.find((plan: any) => plan.id === 'monthly')
 const quarterlyPlan = data.find((plan: any) => plan.id === 'quarterly')
 const yearlyPlan = data.find((plan: any) => plan.id === 'yearly')

 expect(monthlyPlan.price).toBe(299)

 expect(quarterlyPlan.price).toBeLessThan(monthlyPlan.price * 3)
 expect(quarterlyPlan.originalPrice).toBe(monthlyPlan.price * 3)

 expect(yearlyPlan.price).toBeLessThan(monthlyPlan.price * 12)
 expect(yearlyPlan.originalPrice).toBe(monthlyPlan.price * 12)
 })
})