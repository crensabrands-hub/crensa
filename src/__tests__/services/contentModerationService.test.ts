import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ContentModerationService } from '@/lib/services/contentModerationService';

jest.mock('@/lib/database/connection', () => ({
 db: {
 select: jest.fn(),
 update: jest.fn(),
 insert: jest.fn(),
 },
}));

describe('ContentModerationService', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('moderateContent', () => {
 it('should allow clean content', async () => {
 const mockDb = require('@/lib/database/connection').db;
 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue([]),
 }),
 });

 const result = await ContentModerationService.moderateContent('This is a clean video about cooking');

 expect(result.isAllowed).toBe(true);
 expect(result.matchedFilters).toHaveLength(0);
 expect(result.severity).toBe('low');
 });

 it('should flag inappropriate content', async () => {
 const mockDb = require('@/lib/database/connection').db;
 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue([]),
 }),
 });

 const result = await ContentModerationService.moderateContent('This is spam content');

 expect(result.isAllowed).toBe(false);
 expect(result.matchedFilters).toContain('built-in-filter');
 expect(result.severity).toBe('medium');
 expect(result.action).toBe('require_review');
 });

 it('should handle database filters', async () => {
 const mockDb = require('@/lib/database/connection').db;
 const mockFilters = [
 {
 id: 'filter-1',
 type: 'keyword',
 pattern: 'badword',
 severity: 'high',
 action: 'auto_reject',
 isActive: true,
 },
 ];

 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue(mockFilters),
 }),
 });

 const result = await ContentModerationService.moderateContent('This contains badword');

 expect(result.isAllowed).toBe(false);
 expect(result.matchedFilters).toContain('badword');
 expect(result.severity).toBe('high');
 expect(result.action).toBe('auto_reject');
 });

 it('should handle regex filters', async () => {
 const mockDb = require('@/lib/database/connection').db;
 const mockFilters = [
 {
 id: 'filter-1',
 type: 'regex',
 pattern: '\\b\\d{4}-\\d{4}-\\d{4}-\\d{4}\\b', // Credit card pattern
 severity: 'critical',
 action: 'auto_reject',
 isActive: true,
 },
 ];

 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue(mockFilters),
 }),
 });

 const result = await ContentModerationService.moderateContent('My card number is 1234-5678-9012-3456');

 expect(result.isAllowed).toBe(false);
 expect(result.severity).toBe('critical');
 expect(result.action).toBe('auto_reject');
 });

 it('should handle invalid regex gracefully', async () => {
 const mockDb = require('@/lib/database/connection').db;
 const mockFilters = [
 {
 id: 'filter-1',
 type: 'regex',
 pattern: '[invalid regex', // Invalid regex
 severity: 'medium',
 action: 'flag',
 isActive: true,
 },
 ];

 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue(mockFilters),
 }),
 });

 const result = await ContentModerationService.moderateContent('Test content');

 expect(result.isAllowed).toBe(true); // Should not match due to invalid regex
 });

 it('should handle moderation errors gracefully', async () => {
 const mockDb = require('@/lib/database/connection').db;
 mockDb.select.mockImplementation(() => {
 throw new Error('Database error');
 });

 const result = await ContentModerationService.moderateContent('Test content');

 expect(result.isAllowed).toBe(false);
 expect(result.severity).toBe('medium');
 expect(result.action).toBe('require_review');
 expect(result.reason).toContain('moderation system error');
 });
 });

 describe('moderateVideo', () => {
 it('should moderate video content and update status', async () => {
 const mockDb = require('@/lib/database/connection').db;
 const mockVideo = [
 {
 id: 'video-1',
 title: 'Test Video',
 description: 'This is spam content',
 creatorId: 'creator-1',
 },
 ];

 mockDb.select.mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue(mockVideo),
 }),
 }),
 });

 mockDb.select.mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue([]),
 }),
 });

 mockDb.update.mockReturnValue({
 set: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue({}),
 }),
 });

 const result = await ContentModerationService.moderateVideo('video-1');

 expect(result.isAllowed).toBe(false);
 expect(result.matchedFilters).toContain('built-in-filter');
 });

 it('should throw error for non-existent video', async () => {
 const mockDb = require('@/lib/database/connection').db;
 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([]), // No video found
 }),
 }),
 });

 await expect(ContentModerationService.moderateVideo('non-existent')).rejects.toThrow('Video not found');
 });
 });

 describe('batchModerateVideos', () => {
 it('should moderate multiple videos', async () => {
 const mockDb = require('@/lib/database/connection').db;
 const videoIds = ['video-1', 'video-2'];

 mockDb.select
 .mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([
 { id: 'video-1', title: 'Clean Video', description: 'Good content' },
 ]),
 }),
 }),
 })
 .mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue([]),
 }),
 })
 .mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([
 { id: 'video-2', title: 'Spam Video', description: 'This is spam' },
 ]),
 }),
 }),
 })
 .mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue([]),
 }),
 });

 const results = await ContentModerationService.batchModerateVideos(videoIds);

 expect(results.size).toBe(2);
 expect(results.has('video-1')).toBe(true);
 expect(results.has('video-2')).toBe(true);
 });
 });

 describe('getModerationStats', () => {
 it('should return moderation statistics', async () => {
 const mockDb = require('@/lib/database/connection').db;
 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue([{ id: '1' }, { id: '2' }]),
 }),
 });

 const stats = await ContentModerationService.getModerationStats();

 expect(stats).toHaveProperty('totalFiltered');
 expect(stats).toHaveProperty('autoRejected');
 expect(stats).toHaveProperty('flagged');
 expect(stats).toHaveProperty('pendingReview');
 expect(typeof stats.totalFiltered).toBe('number');
 });

 it('should handle stats errors gracefully', async () => {
 const mockDb = require('@/lib/database/connection').db;
 mockDb.select.mockImplementation(() => {
 throw new Error('Database error');
 });

 const stats = await ContentModerationService.getModerationStats();

 expect(stats.totalFiltered).toBe(0);
 expect(stats.autoRejected).toBe(0);
 expect(stats.flagged).toBe(0);
 expect(stats.pendingReview).toBe(0);
 });
 });
});