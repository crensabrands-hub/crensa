import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AdminService } from '@/lib/services/adminService';

jest.mock('@/lib/database/connection', () => ({
 db: {
 select: jest.fn(),
 update: jest.fn(),
 insert: jest.fn(),
 transaction: jest.fn(),
 },
}));

jest.mock('drizzle-orm', () => ({
 eq: jest.fn(),
 desc: jest.fn(),
 count: jest.fn(),
 sql: jest.fn(),
 and: jest.fn(),
 or: jest.fn(),
 like: jest.fn(),
 gte: jest.fn(),
 lte: jest.fn(),
}));

describe('AdminService', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('getAdminStats', () => {
 it('should return admin statistics', async () => {

 const mockDb = require('@/lib/database/connection').db;
 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue([{ count: 100 }]),
 }),
 });

 const stats = await AdminService.getAdminStats();

 expect(stats).toHaveProperty('totalUsers');
 expect(stats).toHaveProperty('totalCreators');
 expect(stats).toHaveProperty('totalMembers');
 expect(stats).toHaveProperty('totalVideos');
 expect(stats).toHaveProperty('totalReports');
 expect(stats).toHaveProperty('pendingReports');
 expect(stats).toHaveProperty('suspendedUsers');
 expect(stats).toHaveProperty('flaggedVideos');
 });

 it('should handle database errors gracefully', async () => {
 const mockDb = require('@/lib/database/connection').db;
 mockDb.select.mockImplementation(() => {
 throw new Error('Database error');
 });

 await expect(AdminService.getAdminStats()).rejects.toThrow('Failed to fetch admin statistics');
 });
 });

 describe('suspendUser', () => {
 it('should suspend a user with reason', async () => {
 const mockDb = require('@/lib/database/connection').db;
 const mockTransaction = jest.fn().mockImplementation((callback) => callback({
 update: jest.fn().mockReturnValue({
 set: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue({}),
 }),
 }),
 insert: jest.fn().mockReturnValue({
 values: jest.fn().mockResolvedValue({}),
 }),
 }));
 mockDb.transaction = mockTransaction;

 await AdminService.suspendUser('user-id', 'admin-id', 'Violation of terms', '127.0.0.1');

 expect(mockTransaction).toHaveBeenCalled();
 });

 it('should handle suspension errors', async () => {
 const mockDb = require('@/lib/database/connection').db;
 mockDb.transaction.mockImplementation(() => {
 throw new Error('Database error');
 });

 await expect(
 AdminService.suspendUser('user-id', 'admin-id', 'Violation of terms')
 ).rejects.toThrow('Failed to suspend user');
 });
 });

 describe('getUsersForManagement', () => {
 it('should return paginated users with filters', async () => {
 const mockDb = require('@/lib/database/connection').db;
 const mockUsers = [
 {
 id: 'user-1',
 username: 'testuser',
 email: 'test@example.com',
 role: 'creator',
 isActive: true,
 isSuspended: false,
 createdAt: '2024-01-01T00:00:00Z',
 },
 ];

 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 orderBy: jest.fn().mockReturnValue({
 limit: jest.fn().mockReturnValue({
 offset: jest.fn().mockResolvedValue(mockUsers),
 }),
 }),
 }),
 }),
 });

 const result = await AdminService.getUsersForManagement(1, 20, 'test', 'creator', 'active');

 expect(result).toHaveProperty('users');
 expect(result).toHaveProperty('total');
 expect(Array.isArray(result.users)).toBe(true);
 });
 });

 describe('moderateVideo', () => {
 it('should moderate a video with status and reason', async () => {
 const mockDb = require('@/lib/database/connection').db;
 const mockTransaction = jest.fn().mockImplementation((callback) => callback({
 update: jest.fn().mockReturnValue({
 set: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue({}),
 }),
 }),
 insert: jest.fn().mockReturnValue({
 values: jest.fn().mockResolvedValue({}),
 }),
 }));
 mockDb.transaction = mockTransaction;

 await AdminService.moderateVideo(
 'video-id',
 'admin-id',
 'rejected',
 'Inappropriate content',
 '127.0.0.1'
 );

 expect(mockTransaction).toHaveBeenCalled();
 });
 });

 describe('reviewReport', () => {
 it('should review and update report status', async () => {
 const mockDb = require('@/lib/database/connection').db;
 const mockTransaction = jest.fn().mockImplementation((callback) => callback({
 update: jest.fn().mockReturnValue({
 set: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue({}),
 }),
 }),
 insert: jest.fn().mockReturnValue({
 values: jest.fn().mockResolvedValue({}),
 }),
 }));
 mockDb.transaction = mockTransaction;

 await AdminService.reviewReport(
 'report-id',
 'admin-id',
 'resolved',
 'Issue resolved',
 '127.0.0.1'
 );

 expect(mockTransaction).toHaveBeenCalled();
 });
 });
});