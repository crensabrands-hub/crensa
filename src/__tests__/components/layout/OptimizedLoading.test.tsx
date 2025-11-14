import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { 
 LayoutLoading, 
 ProgressiveLayoutLoader, 
 FastLoadingIndicator,
 CreatorLayoutSkeleton,
 MemberLayoutSkeleton
} from '@/components/layout/LayoutUtils';

jest.mock('next/navigation', () => ({
 useRouter: () => ({
 push: jest.fn(),
 replace: jest.fn(),
 back: jest.fn(),
 }),
 usePathname: () => '/',
}));

describe('Optimized Loading Components', () => {
 describe('LayoutLoading', () => {
 it('should not render anything for initial load of public layout with minimal flag', () => {
 const { container } = render(
 <LayoutLoading 
 layoutType="public" 
 showMinimal={true} 
 isInitialLoad={true} 
 />
 );
 
 expect(container.firstChild).toBeNull();
 });

 it('should render minimal loading for non-initial loads', () => {
 render(
 <LayoutLoading 
 layoutType="public" 
 showMinimal={true} 
 isInitialLoad={false} 
 />
 );
 
 expect(screen.getByText('Loading...')).toBeInTheDocument();
 });

 it('should render full skeleton for authenticated layouts', () => {
 render(
 <LayoutLoading 
 layoutType="creator" 
 showMinimal={false} 
 />
 );

 expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
 });
 });

 describe('ProgressiveLayoutLoader', () => {
 it('should skip progressive loading for unauthenticated users', () => {
 render(
 <ProgressiveLayoutLoader 
 layoutType="public" 
 isAuthenticated={false}
 >
 <div data-testid="content">Content</div>
 </ProgressiveLayoutLoader>
 );
 
 expect(screen.getByTestId('content')).toBeInTheDocument();
 expect(screen.getByTestId('content')).toBeVisible();
 });

 it('should show progressive loading for authenticated users', async () => {
 render(
 <ProgressiveLayoutLoader 
 layoutType="creator" 
 isAuthenticated={true}
 userRole="creator"
 >
 <div data-testid="content">Content</div>
 </ProgressiveLayoutLoader>
 );

 expect(document.querySelector('.animate-pulse')).toBeInTheDocument();

 await waitFor(() => {
 expect(screen.getByTestId('content')).toBeVisible();
 }, { timeout: 1000 });
 });
 });

 describe('FastLoadingIndicator', () => {
 it('should render fast loading indicator with custom message', () => {
 render(<FastLoadingIndicator message="Redirecting..." />);
 
 expect(screen.getByText('Redirecting...')).toBeInTheDocument();
 expect(document.querySelector('.animate-spin')).toBeInTheDocument();
 });

 it('should render with default message', () => {
 render(<FastLoadingIndicator />);
 
 expect(screen.getByText('Loading...')).toBeInTheDocument();
 });
 });

 describe('Layout Skeletons', () => {
 it('should render creator layout skeleton', () => {
 render(<CreatorLayoutSkeleton />);

 expect(document.querySelector('.w-64')).toBeInTheDocument(); // Sidebar
 expect(document.querySelector('.flex-1')).toBeInTheDocument(); // Main content
 expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
 });

 it('should render member layout skeleton', () => {
 render(<MemberLayoutSkeleton />);

 expect(document.querySelector('.h-16')).toBeInTheDocument(); // Header
 expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
 });
 });
});

describe('Loading Performance Optimization', () => {
 it('should eliminate loading for first-time visitors', () => {
 const { container } = render(
 <LayoutLoading 
 layoutType="public" 
 showMinimal={true} 
 isInitialLoad={true} 
 />
 );

 expect(container.firstChild).toBeNull();
 });

 it('should show fast loading for authenticated redirects', () => {
 render(<FastLoadingIndicator message="Redirecting to dashboard..." />);

 expect(screen.getByText('Redirecting to dashboard...')).toBeInTheDocument();
 expect(document.querySelector('.fixed.top-0')).toBeInTheDocument();
 });

 it('should use progressive loading for authenticated users', async () => {
 const { rerender } = render(
 <ProgressiveLayoutLoader 
 layoutType="member" 
 isAuthenticated={true}
 userRole="member"
 >
 <div data-testid="dashboard">Dashboard Content</div>
 </ProgressiveLayoutLoader>
 );

 expect(document.querySelector('.absolute.inset-0')).toBeInTheDocument();

 await waitFor(() => {
 const content = screen.getByTestId('dashboard');
 expect(content).toBeVisible();
 }, { timeout: 1000 });
 });
});

describe('Accessibility and UX', () => {
 it('should have proper ARIA attributes for loading states', () => {
 render(<FastLoadingIndicator message="Loading content..." />);

 expect(screen.getByText('Loading content...')).toBeInTheDocument();
 });

 it('should provide smooth transitions between loading states', () => {
 render(
 <ProgressiveLayoutLoader 
 layoutType="creator" 
 isAuthenticated={true}
 userRole="creator"
 >
 <div>Content</div>
 </ProgressiveLayoutLoader>
 );

 expect(document.querySelector('.transition-opacity')).toBeInTheDocument();
 });

 it('should handle loading states gracefully without layout shift', () => {
 const { container } = render(
 <LayoutLoading 
 layoutType="creator" 
 showMinimal={false} 
 />
 );

 expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
 });
});