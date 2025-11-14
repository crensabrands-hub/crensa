

import { profileVisitService } from '@/lib/services/profileVisitService';

jest.mock('@/lib/database/connection', () => ({
 db: {
 insert: jest.fn().mockReturnValue({
 values: jest.fn().mockReturnValue({
 returning: jest.fn().mockResolvedValue([{
 id: 'visit-1',
 userId: 'user-1',
 creatorId: 'creator-1',
 source: 'dashboard',
 visitedAt: new Date(),
 duration: null
 }])
 })
 }),
 select: jest.fn().mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([{
 id: 'user-1',
 username: 'testuser',
 avatar: null
 }])
 })
 })
 })
 }
}));

jest.mock('@/lib/database/schema', () => ({
 profileVisits: {
 id: 'id',
 userId: 'userId',
 creatorId: 'creatorId',
 source: 'source',
 visitedAt: 'visitedAt',
 duration: 'duration'
 },
 users: {
 id: 'id',
 username: 'username',
 avatar: 'avatar'
 },
 memberActivities: {
 userId: 'userId',
 activityType: 'activityType',
 title: 'title',
 description: 'description',
 metadata: 'metadata'
 }
}));

describe('ProfileVisitService', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('trackVisit', () => {
 it('should track a profile visit successfully', async () => {
 const visitData = {
 creatorId: 'creator-1',
 source: 'dashboard' as const,
 duration: 120
 };

 const result = await profileVisitService.trackVisit('user-1', visitData);

 expect(result).toEqual({
 id: 'visit-1',
 userId: 'user-1',
 creatorId: 'creator-1',
 source: 'dashboard',
 visitedAt: expect.any(Date),
 duration: null
 });
 });

 it('should throw error for self-visits', async () => {
 const visitData = {
 creatorId: 'user-1',
 source: 'dashboard' as const
 };

 await expect(
 profileVisitService.trackVisit('user-1', visitData)
 ).rejects.toThrow('Cannot track visits to own profile');
 });
 });

 describe('client-side tracking', () => {
 beforeEach(() => {
 global.fetch = jest.fn();
 });

 afterEach(() => {
 jest.restoreAllMocks();
 });

 it('should track visit from client successfully', async () => {
 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: { visitId: 'visit-1' }
 })
 });

 const result = await profileVisitService.trackVisitFromClient('creator-1', 'dashboard');

 expect(result).toEqual({
 success: true,
 visitId: 'visit-1'
 });

 expect(global.fetch).toHaveBeenCalledWith('/api/member/profile-visits', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 creatorId: 'creator-1',
 source: 'dashboard'
 })
 });
 });

 it('should handle client-side tracking errors', async () => {
 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 json: async () => ({
 error: 'Creator not found'
 })
 });

 const result = await profileVisitService.trackVisitFromClient('invalid-creator', 'dashboard');

 expect(result).toEqual({
 success: false,
 error: 'Creator not found'
 });
 });
 });
});