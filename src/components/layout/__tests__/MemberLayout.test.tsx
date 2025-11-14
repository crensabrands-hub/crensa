import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLayout } from '@/contexts/LayoutContext';
import { useResponsive } from '@/hooks/useResponsive';
import MemberLayout from '../MemberLayout';

jest.mock('@/contexts/AuthContext');
jest.mock('@/contexts/LayoutContext');
jest.mock('@/hooks/useResponsive');
jest.mock('../MemberHeader', () => {
 return function MockMemberHeader({ onSidebarToggle, sidebarOpen }: any) {
 return (
 <div data-testid="member-header">
 Member Header
 {onSidebarToggle && (
 <button onClick={onSidebarToggle} data-testid="sidebar-toggle">
 Toggle Sidebar
 </button>
 )}
 <span data-testid="sidebar-state">{sidebarOpen ? 'open' : 'closed'}</span>
 </div>
 );
 };
});
jest.mock('../MemberSidebar', () => {
 return function MockMemberSidebar({ isOpen, onClose }: any) {
 return (
 <div data-testid="member-sidebar" data-open={isOpen}>
 Member Sidebar
 <button onClick={onClose} data-testid="close-sidebar">
 Close
 </button>
 </div>
 );
 };
});

const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;
const mockUseLayout = useLayout as jest.MockedFunction<typeof useLayout>;
const mockUseResponsive = useResponsive as jest.MockedFunction<typeof useResponsive>;

describe('MemberLayout', () => {
 const mockUserProfile = {
 id: 'user-1',
 username: 'testmember',
 email: 'test@example.com',
 role: 'member' as const,
 };

 const mockNavigation = {
 activeRoute: '/dashboard',
 breadcrumbs: [
 { label: 'Home', href: '/', active: false },
 { label: 'Dashboard', href: '/dashboard', active: true },
 ],
 sidebarOpen: false,
 mobileMenuOpen: false,
 };

 beforeEach(() => {
 mockUseAuthContext.mockReturnValue({
 user: { id: 'user-1' } as any,
 userProfile: mockUserProfile,
 isLoading: false,
 hasRole: jest.fn().mockReturnValue(false),
 } as any);

 mockUseLayout.mockReturnValue({
 navigation: mockNavigation,
 preferences: {
 sidebarCollapsed: false,
 theme: 'light' as const,
 compactMode: false,
 },
 } as any);

 mockUseResponsive.mockReturnValue({
 isMobile: false,
 isTablet: false,
 isDesktop: true,
 isTouchDevice: false,
 });
 });

 afterEach(() => {
 jest.clearAllMocks();
 });

 it('renders member layout with header only by default', () => {
 render(
 <MemberLayout>
 <div data-testid="test-content">Test Content</div>
 </MemberLayout>
 );

 expect(screen.getByTestId('member-header')).toBeInTheDocument();
 expect(screen.getByTestId('test-content')).toBeInTheDocument();
 expect(screen.queryByTestId('member-sidebar')).not.toBeInTheDocument();
 });

 it('renders member layout with sidebar when showSidebar is true', () => {
 render(
 <MemberLayout showSidebar>
 <div data-testid="test-content">Test Content</div>
 </MemberLayout>
 );

 expect(screen.getByTestId('member-header')).toBeInTheDocument();
 expect(screen.getByTestId('member-sidebar')).toBeInTheDocument();
 expect(screen.getByTestId('test-content')).toBeInTheDocument();
 });

 it('displays breadcrumbs when available', () => {
 render(
 <MemberLayout>
 <div data-testid="test-content">Test Content</div>
 </MemberLayout>
 );

 expect(screen.getByText('Home')).toBeInTheDocument();
 expect(screen.getByText('Dashboard')).toBeInTheDocument();
 });

 it('displays quick actions bar for desktop users when sidebar is not shown', () => {
 render(
 <MemberLayout>
 <div data-testid="test-content">Test Content</div>
 </MemberLayout>
 );

 expect(screen.getByText('Welcome back, testmember')).toBeInTheDocument();
 expect(screen.getByText('Discover')).toBeInTheDocument();
 expect(screen.getByText('Wallet')).toBeInTheDocument();
 });

 it('does not display quick actions bar when sidebar is shown', () => {
 render(
 <MemberLayout showSidebar>
 <div data-testid="test-content">Test Content</div>
 </MemberLayout>
 );

 expect(screen.queryByText('Welcome back, testmember')).not.toBeInTheDocument();
 });

 it('handles sidebar toggle functionality', () => {
 render(
 <MemberLayout showSidebar>
 <div data-testid="test-content">Test Content</div>
 </MemberLayout>
 );

 const toggleButton = screen.getByTestId('sidebar-toggle');
 const sidebarState = screen.getByTestId('sidebar-state');
 const sidebar = screen.getByTestId('member-sidebar');

 expect(sidebarState).toHaveTextContent('closed');
 expect(sidebar).toHaveAttribute('data-open', 'false');

 fireEvent.click(toggleButton);
 expect(sidebar).toHaveAttribute('data-open', 'true');
 });

 it('handles mobile layout correctly', () => {
 mockUseResponsive.mockReturnValue({
 isMobile: true,
 isTablet: false,
 isDesktop: false,
 isTouchDevice: true,
 });

 render(
 <MemberLayout>
 <div data-testid="test-content">Test Content</div>
 </MemberLayout>
 );

 expect(screen.queryByText('Welcome back, testmember')).not.toBeInTheDocument();
 });

 it('applies correct styling classes', () => {
 const { container } = render(
 <MemberLayout>
 <div data-testid="test-content">Test Content</div>
 </MemberLayout>
 );

 const mainDiv = container.firstChild as HTMLElement;
 expect(mainDiv).toHaveClass('min-h-screen', 'bg-neutral-gray');
 });
});