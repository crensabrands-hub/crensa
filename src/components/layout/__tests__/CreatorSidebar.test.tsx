import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';
import CreatorSidebar from '../CreatorSidebar';

jest.mock('next/navigation', () => ({
 usePathname: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: jest.fn(),
}));

jest.mock('@/hooks/useResponsive', () => ({
 useResponsive: jest.fn(),
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

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;
const mockUseResponsive = useResponsive as jest.MockedFunction<typeof useResponsive>;

describe('CreatorSidebar', () => {
 const defaultProps = {
 isOpen: true,
 onClose: jest.fn(),
 isCollapsed: false,
 onToggleCollapse: jest.fn(),
 };

 beforeEach(() => {
 mockUsePathname.mockReturnValue('/creator/dashboard');
 mockUseAuthContext.mockReturnValue({
 userProfile: { username: 'testcreator' },
 user: null,
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
 });

 afterEach(() => {
 jest.clearAllMocks();
 });

 it('renders sidebar with navigation items', () => {
 render(<CreatorSidebar {...defaultProps} />);
 
 expect(screen.getByText('Crensa')).toBeInTheDocument();
 expect(screen.getByText('Creator Studio')).toBeInTheDocument();
 expect(screen.getByText('Dashboard')).toBeInTheDocument();
 expect(screen.getByText('Upload Video')).toBeInTheDocument();
 expect(screen.getByText('Analytics')).toBeInTheDocument();
 expect(screen.getByText('Manage Videos')).toBeInTheDocument();
 expect(screen.getByText('Settings')).toBeInTheDocument();
 });

 it('shows badges for navigation items', () => {
 render(<CreatorSidebar {...defaultProps} />);
 
 expect(screen.getByText('3')).toBeInTheDocument(); // Upload Video badge
 expect(screen.getByText('12')).toBeInTheDocument(); // Manage Videos badge
 });

 it('highlights active navigation item', () => {
 render(<CreatorSidebar {...defaultProps} />);
 
 const dashboardLink = screen.getByText('Dashboard').closest('a');
 expect(dashboardLink).toHaveClass('bg-primary-neon-yellow');
 });

 it('shows collapse button on desktop', () => {
 render(<CreatorSidebar {...defaultProps} />);
 
 const collapseButton = screen.getByLabelText('Collapse sidebar');
 expect(collapseButton).toBeInTheDocument();
 });

 it('calls onToggleCollapse when collapse button is clicked', () => {
 const onToggleCollapse = jest.fn();
 render(<CreatorSidebar {...defaultProps} onToggleCollapse={onToggleCollapse} />);
 
 const collapseButton = screen.getByLabelText('Collapse sidebar');
 fireEvent.click(collapseButton);
 
 expect(onToggleCollapse).toHaveBeenCalledTimes(1);
 });

 it('renders collapsed state correctly', () => {
 render(<CreatorSidebar {...defaultProps} isCollapsed={true} />);

 expect(screen.queryByText('Crensa')).not.toBeInTheDocument();
 expect(screen.queryByText('Creator Studio')).not.toBeInTheDocument();

 const navLinks = screen.getAllByRole('link');
 const dashboardLink = navLinks.find(link => link.getAttribute('href') === '/creator/dashboard');
 expect(dashboardLink).toBeInTheDocument();

 const expandButton = screen.getByLabelText('Expand sidebar');
 expect(expandButton).toBeInTheDocument();

 expect(screen.queryByText('Creator Account')).not.toBeInTheDocument();
 });

 it('shows mobile close button on mobile', () => {
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

 render(<CreatorSidebar {...defaultProps} />);
 
 const closeButton = screen.getByLabelText('Close sidebar');
 expect(closeButton).toBeInTheDocument();
 });

 it('calls onClose when mobile close button is clicked', () => {
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

 const onClose = jest.fn();
 render(<CreatorSidebar {...defaultProps} onClose={onClose} />);
 
 const closeButton = screen.getByLabelText('Close sidebar');
 fireEvent.click(closeButton);
 
 expect(onClose).toHaveBeenCalledTimes(1);
 });

 it('calls onClose when navigation item is clicked on mobile', () => {
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

 const onClose = jest.fn();
 render(<CreatorSidebar {...defaultProps} onClose={onClose} />);
 
 const analyticsLink = screen.getByText('Analytics');
 fireEvent.click(analyticsLink);
 
 expect(onClose).toHaveBeenCalledTimes(1);
 });

 it('displays user profile information', () => {
 render(<CreatorSidebar {...defaultProps} />);
 
 expect(screen.getByText('testcreator')).toBeInTheDocument();
 expect(screen.getByText('Creator Account')).toBeInTheDocument();
 });

 it('shows help section in expanded state', () => {
 render(<CreatorSidebar {...defaultProps} />);
 
 expect(screen.getByText('Need Help?')).toBeInTheDocument();
 expect(screen.getByText('Get Support →')).toBeInTheDocument();
 });

 it('hides help section text in collapsed state', () => {
 render(<CreatorSidebar {...defaultProps} isCollapsed={true} />);
 
 expect(screen.queryByText('Need Help?')).not.toBeInTheDocument();
 expect(screen.queryByText('Get Support →')).not.toBeInTheDocument();
 });
});