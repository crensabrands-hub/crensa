import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';
import CreatorLayout from '../CreatorLayout';

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: jest.fn(),
}));

jest.mock('@/hooks/useResponsive', () => ({
 useResponsive: jest.fn(),
}));

jest.mock('next/navigation', () => ({
 usePathname: () => '/creator/dashboard',
}));

jest.mock('next/link', () => {
 return function MockLink({ children, href, onClick, ...props }: any) {
 return (
 <a href={href} onClick={onClick} {...props}>
 {children}
 </a>
 );
 };
});

jest.mock('../CreatorHeader', () => {
 return function MockCreatorHeader({ onSidebarToggle, sidebarOpen }: any) {
 return (
 <div data-testid="creator-header">
 <button onClick={onSidebarToggle} data-testid="sidebar-toggle">
 {sidebarOpen ? 'Close' : 'Open'} Sidebar
 </button>
 </div>
 );
 };
});

jest.mock('../LayoutErrorBoundary', () => ({
 LayoutErrorBoundary: ({ children }: any) => <div>{children}</div>,
}));

const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;
const mockUseResponsive = useResponsive as jest.MockedFunction<typeof useResponsive>;

describe('CreatorSidebar Integration', () => {
 beforeEach(() => {
 mockUseAuthContext.mockReturnValue({
 userProfile: { username: 'testcreator' },
 user: { publicMetadata: { role: 'creator' } },
 isLoading: false,
 error: null,
 });
 
 mockUseResponsive.mockReturnValue({
 isMobile: false,
 isTouchDevice: false,
 isTablet: false,
 isDesktop: true,
 width: 1024,
 height: 768,
 isMobileDevice: false,
 orientation: 'landscape',
 });

 Object.defineProperty(window, 'localStorage', {
 value: {
 getItem: jest.fn(),
 setItem: jest.fn(),
 removeItem: jest.fn(),
 },
 writable: true,
 });

 Object.defineProperty(window, 'sessionStorage', {
 value: {
 getItem: jest.fn(),
 setItem: jest.fn(),
 removeItem: jest.fn(),
 },
 writable: true,
 });
 });

 afterEach(() => {
 jest.clearAllMocks();
 });

 it('integrates sidebar with layout context', () => {
 render(
 <LayoutProvider>
 <CreatorLayout>
 <div>Test Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 expect(screen.getByText('Crensa')).toBeInTheDocument();
 expect(screen.getByText('Dashboard')).toBeInTheDocument();
 expect(screen.getByText('Test Content')).toBeInTheDocument();
 });

 it('toggles sidebar collapse state', () => {
 render(
 <LayoutProvider>
 <CreatorLayout>
 <div>Test Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 expect(screen.getByText('Crensa')).toBeInTheDocument();
 expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();

 const collapseButton = screen.getByLabelText('Collapse sidebar');
 fireEvent.click(collapseButton);

 expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();

 expect(screen.queryByText('Crensa')).not.toBeInTheDocument();
 });

 it('handles mobile sidebar toggle', () => {
 mockUseResponsive.mockReturnValue({
 isMobile: true,
 isTouchDevice: true,
 isTablet: false,
 isDesktop: false,
 width: 375,
 height: 667,
 isMobileDevice: true,
 orientation: 'portrait',
 });

 render(
 <LayoutProvider>
 <CreatorLayout>
 <div>Test Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 const sidebar = screen.getByText('Crensa').closest('aside');
 expect(sidebar).toHaveClass('-translate-x-full');

 const toggleButton = screen.getByTestId('sidebar-toggle');
 fireEvent.click(toggleButton);

 expect(screen.getByText('Crensa')).toBeInTheDocument();
 });

 it('persists sidebar state', () => {
 const mockSetItem = jest.fn();
 Object.defineProperty(window, 'localStorage', {
 value: {
 getItem: jest.fn(),
 setItem: mockSetItem,
 removeItem: jest.fn(),
 },
 writable: true,
 });

 render(
 <LayoutProvider>
 <CreatorLayout>
 <div>Test Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 const collapseButton = screen.getByLabelText('Collapse sidebar');
 fireEvent.click(collapseButton);

 expect(mockSetItem).toHaveBeenCalledWith(
 'layout_preferences',
 expect.stringContaining('sidebarCollapsed')
 );
 });
});