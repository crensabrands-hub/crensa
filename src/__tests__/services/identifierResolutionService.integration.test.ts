

import { describe, it, expect } from '@jest/globals';

describe('IdentifierResolutionService Integration', () => {
 it('should be able to import the service', async () => {

 const { IdentifierResolutionService } = await import('@/lib/services/identifierResolutionService');
 
 expect(IdentifierResolutionService).toBeDefined();
 expect(typeof IdentifierResolutionService).toBe('function');
 });

 it('should be able to import convenience functions', async () => {
 const { 
 resolveIdentifier, 
 isShareToken, 
 isVideoId,
 identifierResolutionService 
 } = await import('@/lib/services/identifierResolutionService');
 
 expect(typeof resolveIdentifier).toBe('function');
 expect(typeof isShareToken).toBe('function');
 expect(typeof isVideoId).toBe('function');
 expect(identifierResolutionService).toBeDefined();
 });

 it('should be able to create service instance', async () => {
 const { IdentifierResolutionService } = await import('@/lib/services/identifierResolutionService');
 
 const service = new IdentifierResolutionService();
 expect(service).toBeDefined();
 expect(typeof service.resolveIdentifier).toBe('function');
 expect(typeof service.isShareToken).toBe('function');
 expect(typeof service.isVideoId).toBe('function');
 });

 it('should handle invalid inputs gracefully', async () => {
 const { identifierResolutionService } = await import('@/lib/services/identifierResolutionService');

 const result1 = await identifierResolutionService.resolveIdentifier('');
 expect(result1.success).toBe(false);
 expect(result1.error).toBeDefined();

 const result2 = await identifierResolutionService.resolveIdentifier(null as any);
 expect(result2.success).toBe(false);
 expect(result2.error).toBeDefined();
 });

 it('should export correct TypeScript types', async () => {

 const serviceModule = await import('@/lib/services/identifierResolutionService');

 expect(serviceModule.IdentifierResolutionService).toBeDefined();
 expect(serviceModule.identifierResolutionService).toBeDefined();
 expect(serviceModule.resolveIdentifier).toBeDefined();
 expect(serviceModule.isShareToken).toBeDefined();
 expect(serviceModule.isVideoId).toBeDefined();
 });
});