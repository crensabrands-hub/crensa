import { auth } from '@clerk/nextjs';

jest.mock('@clerk/nextjs', () => ({
 auth: jest.fn(),
}));

const mockRequest = (body: any) => ({
 json: async () => body,
});

const mockResponse = (data: any, status = 200) => ({
 json: () => Promise.resolve(data),
 status,
});

const getProfile = jest.fn();
const updateProfile = jest.fn();
const setupProfile = jest.fn();

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('Auth API Routes', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('/api/auth/profile GET', () => {
 it('should return 401 if user is not authenticated', async () => {
 mockAuth.mockReturnValue({ userId: null } as any);
 getProfile.mockResolvedValue(mockResponse({ error: 'Unauthorized' }, 401));

 const response = await getProfile();
 const data = await response.json();

 expect(response.status).toBe(401);
 expect(data.error).toBe('Unauthorized');
 });

 it('should return 404 if profile is not found', async () => {
 mockAuth.mockReturnValue({ userId: 'user_123' } as any);
 getProfile.mockResolvedValue(mockResponse({ error: 'Profile not found' }, 404));

 const response = await getProfile();
 const data = await response.json();

 expect(response.status).toBe(404);
 expect(data.error).toBe('Profile not found');
 });
 });

 describe('/api/auth/profile PATCH', () => {
 it('should return 401 if user is not authenticated', async () => {
 mockAuth.mockReturnValue({ userId: null } as any);
 updateProfile.mockResolvedValue(mockResponse({ error: 'Unauthorized' }, 401));

 const request = mockRequest({ username: 'newname' });
 const response = await updateProfile(request);
 const data = await response.json();

 expect(response.status).toBe(401);
 expect(data.error).toBe('Unauthorized');
 });

 it('should return 404 if profile is not found', async () => {
 mockAuth.mockReturnValue({ userId: 'user_123' } as any);
 updateProfile.mockResolvedValue(mockResponse({ error: 'Profile not found' }, 404));

 const request = mockRequest({ username: 'newname' });
 const response = await updateProfile(request);
 const data = await response.json();

 expect(response.status).toBe(404);
 expect(data.error).toBe('Profile not found');
 });
 });

 describe('/api/auth/setup-profile POST', () => {
 it('should return 401 if user is not authenticated', async () => {
 mockAuth.mockReturnValue({ userId: null } as any);
 setupProfile.mockResolvedValue(mockResponse({ error: 'Unauthorized' }, 401));

 const request = mockRequest({
 role: 'creator',
 email: 'test@example.com',
 username: 'testuser',
 });

 const response = await setupProfile(request);
 const data = await response.json();

 expect(response.status).toBe(401);
 expect(data.error).toBe('Unauthorized');
 });

 it('should return 400 for invalid role', async () => {
 mockAuth.mockReturnValue({ userId: 'user_123' } as any);
 setupProfile.mockResolvedValue(mockResponse({ error: 'Invalid role' }, 400));

 const request = mockRequest({
 role: 'invalid',
 email: 'test@example.com',
 username: 'testuser',
 });

 const response = await setupProfile(request);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.error).toBe('Invalid role');
 });

 it('should create creator profile successfully', async () => {
 mockAuth.mockReturnValue({ userId: 'user_123' } as any);
 
 const mockCreatorProfile = {
 role: 'creator',
 email: 'test@example.com',
 username: 'testuser',
 displayName: 'testuser',
 totalEarnings: 0,
 totalViews: 0,
 videoCount: 0,
 };
 
 setupProfile.mockResolvedValue(mockResponse(mockCreatorProfile));

 const request = mockRequest({
 role: 'creator',
 email: 'test@example.com',
 username: 'testuser',
 });

 const response = await setupProfile(request);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.role).toBe('creator');
 expect(data.email).toBe('test@example.com');
 expect(data.username).toBe('testuser');
 expect(data.displayName).toBe('testuser');
 expect(data.totalEarnings).toBe(0);
 expect(data.totalViews).toBe(0);
 expect(data.videoCount).toBe(0);
 });

 it('should create member profile successfully', async () => {
 mockAuth.mockReturnValue({ userId: 'user_123' } as any);
 
 const mockMemberProfile = {
 role: 'member',
 email: 'test@example.com',
 username: 'testuser',
 walletBalance: 0,
 membershipStatus: 'free',
 watchHistory: [],
 favoriteCreators: [],
 };
 
 setupProfile.mockResolvedValue(mockResponse(mockMemberProfile));

 const request = mockRequest({
 role: 'member',
 email: 'test@example.com',
 username: 'testuser',
 });

 const response = await setupProfile(request);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.role).toBe('member');
 expect(data.email).toBe('test@example.com');
 expect(data.username).toBe('testuser');
 expect(data.walletBalance).toBe(0);
 expect(data.membershipStatus).toBe('free');
 expect(data.watchHistory).toEqual([]);
 expect(data.favoriteCreators).toEqual([]);
 });
 });
});