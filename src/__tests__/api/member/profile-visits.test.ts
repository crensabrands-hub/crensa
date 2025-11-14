

import { NextRequest } from 'next/server';
import { GET, POST, PATCH } from '@/app/api/member/profile-visits/route';
import { userRepository } from '@/lib/database/repositories/users';
import { db } from '@/lib/database/connection';
import { auth } from '@clerk/nextjs/server';

jest.mock('@clerk/nextjs/server');
jest.mock('@/lib/database/repositories/users');
jest.mock('@/lib/database/connection');

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockDb = db as jest.Mocked<typeof db>;

describe('Profile Visits API', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('GET /api/member/profile-visits', () => {
 it('should handle unauthorized requests gracefully', async () => {
 mockAuth.mockResolvedValue({ userId: null });

 const request = new NextRequest('http://localhost/api/member/profile-visits');
 const response = await GET(request);
 const data = await response.json();

 expect(response.status).toBe(401);
 expect(data.error).toBe('Unauthorized');
 expect(data.message).toBe('Please sign in to view your visit history');
 });

 it('should handle database connection errors', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk_123' });
 mockUserRepository.findByClerkId.mockRejectedValue(new Error('Connection refused'));

 const request = new NextRequest('http://localhost/api/member/profile-visits');
 const response = await GET(request);
 const data = await response.json();

 expect(response.status).toBe(500);
 expect(data.error).toBe('Database error');
 expect(data.retryable).toBe(true);
 });

 it('should handle user not found', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk_123' });
 mockUserRepository.findByClerkId.mockResolvedValue(null);

 const request = new NextRequest('http://localhost/api/member/profile-visits');
 const response = await GET(request);
 const data = await response.json();

 expect(response.status).toBe(404);
 expect(data.error).toBe('User not found');
 });

 it('should validate query parameters', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk_123' });
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 isActive: true,
 isSuspended: false,
 createdAt: new Date(),
 updatedAt: new Date()
 });

 const mockSelect = jest.fn().mockReturnThis();
 const mockFrom = jest.fn().mockReturnThis();
 const mockInnerJoin = jest.fn().mockReturnThis();
 const mockWhere = jest.fn().mockReturnThis();
 const mockOrderBy = jest.fn().mockReturnThis();
 const mockLimit = jest.fn().mockReturnThis();
 const mockOffset = jest.fn().mockResolvedValue([]);

 mockDb.select = mockSelect;
 mockSelect.mockReturnValue({
 from: mockFrom,
 });
 mockFrom.mockReturnValue({
 innerJoin: mockInnerJoin,
 });
 mockInnerJoin.mockReturnValue({
 where: mockWhere,
 });
 mockWhere.mockReturnValue({
 orderBy: mockOrderBy,
 });
 mockOrderBy.mockReturnValue({
 limit: mockLimit,
 });
 mockLimit.mockReturnValue({
 offset: mockOffset,
 });

 const request = new NextRequest('http://localhost/api/member/profile-visits?limit=50&offset=0');
 const response = await GET(request);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 });

 it('should handle invalid creator ID format', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk_123' });
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 isActive: true,
 isSuspended: false,
 createdAt: new Date(),
 updatedAt: new Date()
 });

 const request = new NextRequest('http://localhost/api/member/profile-visits?creatorId=invalid-id');
 const response = await GET(request);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.error).toBe('Invalid creator ID format');
 });
 });

 describe('POST /api/member/profile-visits', () => {
 it('should handle invalid JSON in request body', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk_123' });
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 isActive: true,
 isSuspended: false,
 createdAt: new Date(),
 updatedAt: new Date()
 });

 const request = new NextRequest('http://localhost/api/member/profile-visits', {
 method: 'POST',
 body: 'invalid json',
 headers: {
 'Content-Type': 'application/json',
 },
 });

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.error).toBe('Invalid request format');
 });

 it('should validate required fields', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk_123' });
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 isActive: true,
 isSuspended: false,
 createdAt: new Date(),
 updatedAt: new Date()
 });

 const request = new NextRequest('http://localhost/api/member/profile-visits', {
 method: 'POST',
 body: JSON.stringify({}),
 headers: {
 'Content-Type': 'application/json',
 },
 });

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.error).toBe('Creator ID is required');
 });

 it('should validate creator ID format', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk_123' });
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 isActive: true,
 isSuspended: false,
 createdAt: new Date(),
 updatedAt: new Date()
 });

 const request = new NextRequest('http://localhost/api/member/profile-visits', {
 method: 'POST',
 body: JSON.stringify({ creatorId: 'invalid-id' }),
 headers: {
 'Content-Type': 'application/json',
 },
 });

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.error).toBe('Invalid creator ID format');
 });

 it('should validate source parameter', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk_123' });
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 isActive: true,
 isSuspended: false,
 createdAt: new Date(),
 updatedAt: new Date()
 });

 const request = new NextRequest('http://localhost/api/member/profile-visits', {
 method: 'POST',
 body: JSON.stringify({ 
 creatorId: '12345678-1234-1234-1234-123456789012',
 source: 'invalid-source'
 }),
 headers: {
 'Content-Type': 'application/json',
 },
 });

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.error).toBe('Invalid source');
 });

 it('should handle creator not found', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk_123' });
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 isActive: true,
 isSuspended: false,
 createdAt: new Date(),
 updatedAt: new Date()
 });
 mockUserRepository.findById.mockResolvedValue(null);

 const request = new NextRequest('http://localhost/api/member/profile-visits', {
 method: 'POST',
 body: JSON.stringify({ 
 creatorId: '12345678-1234-1234-1234-123456789012',
 source: 'dashboard'
 }),
 headers: {
 'Content-Type': 'application/json',
 },
 });

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(404);
 expect(data.error).toBe('Creator not found');
 });

 it('should handle inactive or suspended creators', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk_123' });
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 isActive: true,
 isSuspended: false,
 createdAt: new Date(),
 updatedAt: new Date()
 });
 mockUserRepository.findById.mockResolvedValue({
 id: 'creator_123',
 clerkId: 'clerk_creator',
 email: 'creator@example.com',
 username: 'creator',
 role: 'creator',
 isActive: false,
 isSuspended: true,
 createdAt: new Date(),
 updatedAt: new Date()
 });

 const request = new NextRequest('http://localhost/api/member/profile-visits', {
 method: 'POST',
 body: JSON.stringify({ 
 creatorId: 'creator_123',
 source: 'dashboard'
 }),
 headers: {
 'Content-Type': 'application/json',
 },
 });

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(404);
 expect(data.error).toBe('Creator unavailable');
 });

 it('should not track self-visits', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk_123' });
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 isActive: true,
 isSuspended: false,
 createdAt: new Date(),
 updatedAt: new Date()
 });
 mockUserRepository.findById.mockResolvedValue({
 id: 'user_123', // Same as the user making the request
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'creator',
 isActive: true,
 isSuspended: false,
 createdAt: new Date(),
 updatedAt: new Date()
 });

 const request = new NextRequest('http://localhost/api/member/profile-visits', {
 method: 'POST',
 body: JSON.stringify({ 
 creatorId: 'user_123',
 source: 'dashboard'
 }),
 headers: {
 'Content-Type': 'application/json',
 },
 });

 const response = await POST(request);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.message).toBe('Self-visit not tracked');
 });
 });

 describe('PATCH /api/member/profile-visits', () => {
 it('should validate duration parameter', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk_123' });
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 isActive: true,
 isSuspended: false,
 createdAt: new Date(),
 updatedAt: new Date()
 });

 const request = new NextRequest('http://localhost/api/member/profile-visits', {
 method: 'PATCH',
 body: JSON.stringify({ 
 visitId: '12345678-1234-1234-1234-123456789012',
 duration: -1 // Invalid negative duration
 }),
 headers: {
 'Content-Type': 'application/json',
 },
 });

 const response = await PATCH(request);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.error).toBe('Invalid duration');
 });

 it('should validate maximum duration', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk_123' });
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 isActive: true,
 isSuspended: false,
 createdAt: new Date(),
 updatedAt: new Date()
 });

 const request = new NextRequest('http://localhost/api/member/profile-visits', {
 method: 'PATCH',
 body: JSON.stringify({ 
 visitId: '12345678-1234-1234-1234-123456789012',
 duration: 90000 // More than 24 hours
 }),
 headers: {
 'Content-Type': 'application/json',
 },
 });

 const response = await PATCH(request);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.error).toBe('Invalid duration');
 expect(data.message).toBe('Duration cannot exceed 24 hours');
 });

 it('should validate visit ID format', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk_123' });
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 isActive: true,
 isSuspended: false,
 createdAt: new Date(),
 updatedAt: new Date()
 });

 const request = new NextRequest('http://localhost/api/member/profile-visits', {
 method: 'PATCH',
 body: JSON.stringify({ 
 visitId: 'invalid-id',
 duration: 300
 }),
 headers: {
 'Content-Type': 'application/json',
 },
 });

 const response = await PATCH(request);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.error).toBe('Invalid visit ID format');
 });
 });
});