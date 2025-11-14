import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useLayout } from '@/contexts/LayoutContext';
import { useResponsive } from '@/hooks/useResponsive';
import Breadcrumbs, { generateCreatorBreadcrumbs, useBreadcrumbs } from '../Breadcrumbs';

jest.mock('@/contexts/LayoutContext', () => ({
 useLayout: jest.fn(),
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

const mockUseLayout = useLayout as jest.MockedFunction<typeof useLayout>;
const mockUseResponsive = useResponsive as jest.MockedFunction<typeof useResponsive>;

describe('Breadcrumbs', () => {
 const defaultLayoutContext = {
 navigation: {
 breadcrumbs: [
 { label: 'Home', href: '/', active: false },
 { label: 'Creator Studio', href: '/creator', active: false },
 { label: 'Dashboard', href: '/creator/dashboard', active: true },
 ],
 activeRoute: '/creator/dashboard',
 sidebarOpen: true,
 mobileMenuOpen: false,
 },
 setBreadcrumbs: jest.fn(),
 currentLayout: 'creator' as const,
 isLayoutLoading: false,
 error: null,
 preferences: {
 sidebarCollapsed: false,
 theme: 'light' as const,
 compactMode: false,
 },
 setSidebarOpen: jest.fn(),
 setMobileMenuOpen: jest.fn(),
 updateLayoutPreferences: jest.fn(),
 setActiveRoute: jest.fn(),
 clearError: jest.fn(),
 resetLayoutState: jest.fn(),
 getStorageInfo: jest.fn(),
 };

 const defaultResponsiveContext = {
 isMobile: false,
 isTouchDevice: false,
 isTablet: false,
 isDesktop: true,
 width: 1024,
 height: 768,
 isMobileDevice: false,
 isSmallMobile: false,
 orientation: 'landscape' as const,
 };

 beforeEach(() => {
 mockUseLayout.mockReturnValue(defaultLayoutContext);
 mockUseResponsive.mockReturnValue(defaultResponsiveContext);
 });

 afterEach(() => {
 jest.clearAllMocks();
 });

 describe('Basic Rendering', () => {
 it('renders breadcrumbs correctly', () => {
 render(<Breadcrumbs />);

 expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
 expect(screen.getByText('Home')).toBeInTheDocument();
 expect(screen.getByText('Creator Studio')).toBeInTheDocument();
 expect(screen.getByText('Dashboard')).toBeInTheDocument();
 });

 it('renders with custom items', () => {
 const customItems = [
 { label: 'Custom Home', href: '/', active: false },
 { label: 'Custom Page', href: '/custom', active: true },
 ];

 render(<Breadcrumbs items={customItems} />);

 expect(screen.getByText('Custom Home')).toBeInTheDocument();
 expect(screen.getByText('Custom Page')).toBeInTheDocument();
 });

 it('does not render when no breadcrumbs', () => {
 mockUseLayout.mockReturnValue({
 ...defaultLayoutContext,
 navigation: {
 ...defaultLayoutContext.navigation,
 breadcrumbs: [],
 },
 });

 const { container } = render(<Breadcrumbs />);
 expect(container.firstChild).toBeNull();
 });

 it('applies custom className', () => {
 render(<Breadcrumbs className="custom-class" />);
 
 const nav = screen.getByRole('navigation');
 expect(nav).toHaveClass('custom-class');
 });
 });

 describe('Active State Indicators', () => {
 it('marks active breadcrumb with aria-current', () => {
 render(<Breadcrumbs />);

 const activeItem = screen.getByText('Dashboard');
 expect(activeItem).toHaveAttribute('aria-current', 'page');
 });

 it('renders active item as span, not link', () => {
 render(<Breadcrumbs />);

 const activeItem = screen.getByText('Dashboard');
 expect(activeItem.tagName).toBe('SPAN');
 expect(activeItem).toHaveClass('font-medium', 'text-primary-navy');
 });

 it('renders non-active items as links', () => {
 render(<Breadcrumbs />);

 const homeLink = screen.getByText('Home');
 expect(homeLink.tagName).toBe('A');
 expect(homeLink).toHaveAttribute('href', '/');
 expect(homeLink).toHaveClass('text-neutral-dark-gray');
 });
 });

 describe('Responsive Behavior', () => {
 it('truncates breadcrumbs on mobile when too many', () => {
 mockUseResponsive.mockReturnValue({
 ...defaultResponsiveContext,
 isMobile: true,
 isSmallMobile: true,
 width: 375,
 height: 667,
 });

 const longBreadcrumbs = [
 { label: 'Home', href: '/', active: false },
 { label: 'Creator Studio', href: '/creator', active: false },
 { label: 'Videos', href: '/creator/videos', active: false },
 { label: 'Edit', href: '/creator/videos/edit', active: false },
 { label: 'Settings', href: '/creator/videos/edit/settings', active: true },
 ];

 mockUseLayout.mockReturnValue({
 ...defaultLayoutContext,
 navigation: {
 ...defaultLayoutContext.navigation,
 breadcrumbs: longBreadcrumbs,
 },
 });

 render(<Breadcrumbs maxItems={3} />);

 expect(screen.getByText('Home')).toBeInTheDocument();
 expect(screen.getByText('...')).toBeInTheDocument();
 expect(screen.getByText('Settings')).toBeInTheDocument();
 expect(screen.queryByText('Creator Studio')).not.toBeInTheDocument();
 expect(screen.queryByText('Videos')).not.toBeInTheDocument();
 });

 it('uses smaller text on small mobile', () => {
 mockUseResponsive.mockReturnValue({
 ...defaultResponsiveContext,
 isMobile: true,
 isSmallMobile: true,
 width: 320,
 height: 568,
 });

 render(<Breadcrumbs />);

 const homeLink = screen.getByText('Home');
 expect(homeLink).toHaveClass('text-sm');
 });

 it('hides home breadcrumb when showHome is false', () => {
 render(<Breadcrumbs showHome={false} />);

 expect(screen.queryByText('Home')).not.toBeInTheDocument();
 expect(screen.getByText('Creator Studio')).toBeInTheDocument();
 expect(screen.getByText('Dashboard')).toBeInTheDocument();
 });
 });

 describe('Accessibility', () => {
 it('has proper ARIA attributes', () => {
 render(<Breadcrumbs />);

 const nav = screen.getByRole('navigation');
 expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
 expect(nav).toHaveAttribute('role', 'navigation');
 });

 it('has proper focus management', () => {
 render(<Breadcrumbs />);

 const homeLink = screen.getByText('Home');
 expect(homeLink).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-accent-pink');
 });

 it('provides title attributes for truncated items', () => {
 render(<Breadcrumbs />);

 const items = screen.getAllByTitle(/Home|Creator Studio|Dashboard/);
 expect(items.length).toBeGreaterThan(0);
 });

 it('marks ellipsis as aria-hidden', () => {
 mockUseResponsive.mockReturnValue({
 ...defaultResponsiveContext,
 isMobile: true,
 });

 const longBreadcrumbs = [
 { label: 'Home', href: '/', active: false },
 { label: 'Creator Studio', href: '/creator', active: false },
 { label: 'Videos', href: '/creator/videos', active: false },
 { label: 'Edit', href: '/creator/videos/edit', active: false },
 { label: 'Settings', href: '/creator/videos/edit/settings', active: true },
 ];

 mockUseLayout.mockReturnValue({
 ...defaultLayoutContext,
 navigation: {
 ...defaultLayoutContext.navigation,
 breadcrumbs: longBreadcrumbs,
 },
 });

 render(<Breadcrumbs maxItems={3} />);

 const ellipsis = screen.getByText('...');
 expect(ellipsis).toHaveAttribute('aria-hidden', 'true');
 });
 });

 describe('Separators', () => {
 it('renders separators between breadcrumb items', () => {
 render(<Breadcrumbs />);

 const separators = document.querySelectorAll('svg[aria-hidden="true"]');
 expect(separators.length).toBe(2); // One less than the number of breadcrumb items
 });

 it('does not render separator before first item', () => {
 render(<Breadcrumbs />);

 const homeItem = screen.getByText('Home').closest('li');
 const separator = homeItem?.querySelector('svg');
 expect(separator).toBeNull();
 });
 });
});

describe('generateCreatorBreadcrumbs', () => {
 it('generates breadcrumbs for creator dashboard', () => {
 const breadcrumbs = generateCreatorBreadcrumbs('/creator/dashboard');
 
 expect(breadcrumbs).toEqual([
 { label: 'Home', href: '/', active: false },
 { label: 'Creator Studio', href: '/creator', active: false },
 { label: 'Dashboard', href: '/creator/dashboard', active: true },
 ]);
 });

 it('generates breadcrumbs for creator upload', () => {
 const breadcrumbs = generateCreatorBreadcrumbs('/creator/upload');
 
 expect(breadcrumbs).toEqual([
 { label: 'Home', href: '/', active: false },
 { label: 'Creator Studio', href: '/creator', active: false },
 { label: 'Upload Video', href: '/creator/upload', active: true },
 ]);
 });

 it('generates breadcrumbs for nested creator routes', () => {
 const breadcrumbs = generateCreatorBreadcrumbs('/creator/videos/edit');
 
 expect(breadcrumbs).toEqual([
 { label: 'Home', href: '/', active: false },
 { label: 'Creator Studio', href: '/creator', active: false },
 { label: 'Manage Videos', href: '/creator/videos', active: false },
 { label: 'Edit', href: '/creator/videos/edit', active: true },
 ]);
 });

 it('handles root path', () => {
 const breadcrumbs = generateCreatorBreadcrumbs('/');
 
 expect(breadcrumbs).toEqual([
 { label: 'Home', href: '/', active: true },
 ]);
 });

 it('handles unknown segments with capitalized labels', () => {
 const breadcrumbs = generateCreatorBreadcrumbs('/creator/unknown-page');
 
 expect(breadcrumbs).toEqual([
 { label: 'Home', href: '/', active: false },
 { label: 'Creator Studio', href: '/creator', active: false },
 { label: 'Unknown-page', href: '/creator/unknown-page', active: true },
 ]);
 });
});

describe('useBreadcrumbs hook', () => {
 const TestComponent = () => {
 const { updateBreadcrumbs, addBreadcrumb, clearBreadcrumbs } = useBreadcrumbs();
 
 return (
 <div>
 <button 
 onClick={() => updateBreadcrumbs([
 { label: 'Test', href: '/test', active: true }
 ])}
 data-testid="update-breadcrumbs"
 >
 Update
 </button>
 <button 
 onClick={() => addBreadcrumb({ label: 'New', href: '/new' })}
 data-testid="add-breadcrumb"
 >
 Add
 </button>
 <button 
 onClick={() => clearBreadcrumbs()}
 data-testid="clear-breadcrumbs"
 >
 Clear
 </button>
 </div>
 );
 };

 it('provides breadcrumb management functions', () => {
 const setBreadcrumbs = jest.fn();
 mockUseLayout.mockReturnValue({
 navigation: {
 breadcrumbs: [],
 activeRoute: '/test',
 sidebarOpen: true,
 mobileMenuOpen: false,
 },
 setBreadcrumbs,
 currentLayout: 'creator' as const,
 isLayoutLoading: false,
 error: null,
 preferences: {
 sidebarCollapsed: false,
 theme: 'light' as const,
 compactMode: false,
 },
 setSidebarOpen: jest.fn(),
 setMobileMenuOpen: jest.fn(),
 updateLayoutPreferences: jest.fn(),
 setActiveRoute: jest.fn(),
 clearError: jest.fn(),
 resetLayoutState: jest.fn(),
 getStorageInfo: jest.fn(),
 });

 render(<TestComponent />);

 fireEvent.click(screen.getByTestId('update-breadcrumbs'));
 expect(setBreadcrumbs).toHaveBeenCalledWith([
 { label: 'Test', href: '/test', active: true }
 ]);

 fireEvent.click(screen.getByTestId('clear-breadcrumbs'));
 expect(setBreadcrumbs).toHaveBeenCalledWith([]);
 });
});