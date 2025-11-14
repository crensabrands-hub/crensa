import { renderHook } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { useMemberNavigation } from '@/hooks/useMemberNavigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNotificationCount } from '@/hooks/useNotificationCount';

jest.mock('next/navigation', () => ({
 useRouter: jest.fn(),
 usePathname: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: jest.fn(),
}));

jest.mock('@/hooks/useNotificationCount', () => ({
 useNotificationCount: jest.fn(),
}));

const mockRouter = {
 push: jest.fn(),
 back: jest.fn(),
};

const mockAuthContext = {
 userProfile: { role: 'member' },
 hasRole: jest.fn(),
};

const mockNotificationCount = {
 unreadCount: 3,
};

describe('useMemberNavigation', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 (useRouter as jest.Mock).mockReturnValue(mockRouter);
 (useAuthContext as jest.Mock).mockReturnValue(mockAuthContext);
 (useNotificationCount as jest.Mock).mockReturnValue(mockNotificationCount);
 (mockAuthContext.hasRole as jest.Mock).mockImplementation((role: string) => role === 'member');
 });

 it('should return navigation items with correct structure', () => {
 (usePathname as jest.Mock).mockReturnValue('/dashboard');
 
 const { result } = renderHook(() => useMemberNavigation());
 
 expect(result.current.navigationItems).toHaveLength(8);
 expect(result.current.navigationItems[0]).toMatchObject({
 name: 'Dashboard',
 href: '/dashboard',
 icon: 'home',
 isActive: true,
 isAccessible: true,
 });
 });

 it('should mark correct navigation item as active', () => {
 (usePathname as jest.Mock).mockReturnValue('/discover');
 
 const { result } = renderHook(() => useMemberNavigation());
 
 const discoverItem = result.current.navigationItems.find(item => item.name === 'Discover');
 expect(discoverItem?.isActive).toBe(true);
 
 const dashboardItem = result.current.navigationItems.find(item => item.name === 'Dashboard');
 expect(dashboardItem?.isActive).toBe(false);
 });

 it('should include notification badge when there are unread notifications', () => {
 (usePathname as jest.Mock).mockReturnValue('/dashboard');
 
 const { result } = renderHook(() => useMemberNavigation());
 
 const notificationItem = result.current.navigationItems.find(item => item.name === 'Notifications');
 expect(notificationItem?.badge).toBe(3);
 });

 it('should provide correct navigation context for different routes', () => {
 (usePathname as jest.Mock).mockReturnValue('/wallet');
 
 const { result } = renderHook(() => useMemberNavigation());
 
 expect(result.current.navigationContext).toMatchObject({
 section: 'account',
 title: 'Wallet',
 breadcrumbs: [
 { label: 'Dashboard', href: '/dashboard', active: false },
 { label: 'Wallet', href: '/wallet', active: true }
 ]
 });
 });

 it('should provide navigation utility functions', () => {
 (usePathname as jest.Mock).mockReturnValue('/dashboard');
 
 const { result } = renderHook(() => useMemberNavigation());

 result.current.navigateTo('/discover');
 expect(mockRouter.push).toHaveBeenCalledWith('/discover');

 result.current.navigateBack();
 expect(mockRouter.back).toHaveBeenCalled();

 result.current.navigateToDashboard();
 expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
 });

 it('should categorize navigation items by section', () => {
 (usePathname as jest.Mock).mockReturnValue('/dashboard');
 
 const { result } = renderHook(() => useMemberNavigation());
 
 const contentItems = result.current.getNavigationItemsBySection('content');
 expect(contentItems).toHaveLength(3);
 expect(contentItems.map(item => item.name)).toEqual(['Dashboard', 'Discover', 'Reels']);
 
 const accountItems = result.current.getNavigationItemsBySection('account');
 expect(accountItems).toHaveLength(4);
 expect(accountItems.map(item => item.name)).toEqual(['Wallet', 'Membership', 'Profile', 'Settings']);
 });

 it('should detect member access correctly', () => {
 (usePathname as jest.Mock).mockReturnValue('/dashboard');
 
 const { result } = renderHook(() => useMemberNavigation());
 
 expect(result.current.hasMemberAccess).toBe(true);
 });

 it('should handle creator role accessing member features', () => {
 (mockAuthContext.hasRole as jest.Mock).mockImplementation((role: string) => role === 'creator');
 mockAuthContext.userProfile = { role: 'creator' };
 (usePathname as jest.Mock).mockReturnValue('/dashboard');
 
 const { result } = renderHook(() => useMemberNavigation());
 
 expect(result.current.hasMemberAccess).toBe(true);
 expect(result.current.userRole).toBe('creator');
 });

 it('should identify current route accessibility', () => {
 (usePathname as jest.Mock).mockReturnValue('/discover');
 
 const { result } = renderHook(() => useMemberNavigation());
 
 expect(result.current.isCurrentRouteAccessible).toBe(true);
 });

 it('should handle routes without breadcrumbs', () => {
 (usePathname as jest.Mock).mockReturnValue('/dashboard');
 
 const { result } = renderHook(() => useMemberNavigation());
 
 expect(result.current.navigationContext.breadcrumbs).toHaveLength(0);
 expect(result.current.navigationContext.title).toBe('Dashboard');
 });
});