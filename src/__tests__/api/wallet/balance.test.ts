

import { GET } from '@/app/api/wallet/balance/route'
import { auth } from '@clerk/nextjs/server'
import { creditService } from '@/lib/services/creditService'
import { NextRequest } from 'next/server'

jest.mock('@clerk/nextjs/server')
jest.mock('@/lib/services/creditService')

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockCreditService = creditService as jest.Mocked<typeof creditService>

describe('/api/wallet/balance', () => {
 beforeEach(() => {
 jest.clearAllMocks()
 })

 it('returns wallet balance for authenticated user', async () => {
 const mockUserId = 'user-123'
 const mockBalance = {
 balance: 25.5,
 lastUpdated: new Date(),
 pendingTransactions: 2
 }

 mockAuth.mockResolvedValue({ userId: mockUserId })
 mockCreditService.getWalletBalance.mockResolvedValue(mockBalance)

 const request = new NextRequest('http://localhost:3000/api/wallet/balance')
 const response = await GET(request)

 expect(response.status).toBe(200)
 
 const data = await response.json()
 expect(data).toEqual({
 balance: 25.5,
 lastUpdated: mockBalance.lastUpdated.toISOString(),
 pendingTransactions: 2
 })

 expect(mockCreditService.getWalletBalance).toHaveBeenCalledWith(mockUserId)
 })

 it('returns 401 for unauthenticated user', async () => {
 mockAuth.mockResolvedValue({ userId: null })

 const request = new NextRequest('http://localhost:3000/api/wallet/balance')
 const response = await GET(request)

 expect(response.status).toBe(401)
 
 const data = await response.json()
 expect(data).toEqual({ error: 'Unauthorized' })

 expect(mockCreditService.getWalletBalance).not.toHaveBeenCalled()
 })

 it('returns 500 for service errors', async () => {
 const mockUserId = 'user-123'

 mockAuth.mockResolvedValue({ userId: mockUserId })
 mockCreditService.getWalletBalance.mockRejectedValue(new Error('Database error'))

 const request = new NextRequest('http://localhost:3000/api/wallet/balance')
 const response = await GET(request)

 expect(response.status).toBe(500)
 
 const data = await response.json()
 expect(data).toEqual({ error: 'Internal server error' })
 })

 it('handles auth service errors', async () => {
 mockAuth.mockRejectedValue(new Error('Auth service error'))

 const request = new NextRequest('http://localhost:3000/api/wallet/balance')
 const response = await GET(request)

 expect(response.status).toBe(500)
 
 const data = await response.json()
 expect(data).toEqual({ error: 'Internal server error' })
 })
})