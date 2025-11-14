import { render, screen } from '@testing-library/react';
import { AuthLoading, AuthLoadingOverlay, OptimisticLoadingIndicator } from '../AuthLoading';

describe('AuthLoading', () => {
 it('should render minimal loading state by default', () => {
 render(<AuthLoading />);
 
 expect(screen.getByText('Loading...')).toBeInTheDocument();
 expect(document.querySelector('.animate-spin')).toBeInTheDocument();
 });

 it('should render custom message', () => {
 render(<AuthLoading message="Authenticating..." />);
 
 expect(screen.getByText('Authenticating...')).toBeInTheDocument();
 });

 it('should render profile variant', () => {
 render(<AuthLoading variant="profile" />);

 expect(document.querySelectorAll('.animate-pulse')).toHaveLength(3);
 });

 it('should render dashboard variant', () => {
 render(<AuthLoading variant="dashboard" />);

 expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(5);
 });

 it('should render layout variant', () => {
 render(<AuthLoading variant="layout" />);

 expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
 expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(10);
 });

 it('should apply custom className', () => {
 const { container } = render(<AuthLoading className="custom-class" />);
 expect(container.firstChild).toHaveClass('custom-class');
 });
});

describe('AuthLoadingOverlay', () => {
 it('should render when visible', () => {
 render(<AuthLoadingOverlay isVisible={true} />);
 
 expect(screen.getByText('Authenticating...')).toBeInTheDocument();
 expect(screen.getByText('Please wait while we verify your session')).toBeInTheDocument();
 });

 it('should not render when not visible', () => {
 render(<AuthLoadingOverlay isVisible={false} />);
 
 expect(screen.queryByText('Authenticating...')).not.toBeInTheDocument();
 });

 it('should render custom message', () => {
 render(<AuthLoadingOverlay isVisible={true} message="Signing in..." />);
 
 expect(screen.getByText('Signing in...')).toBeInTheDocument();
 });

 it('should have fixed positioning and backdrop', () => {
 const { container } = render(<AuthLoadingOverlay isVisible={true} />);
 const overlay = container.firstChild as HTMLElement;
 
 expect(overlay).toHaveClass('fixed', 'inset-0', 'backdrop-blur-sm', 'z-50');
 });
});

describe('OptimisticLoadingIndicator', () => {
 it('should render when optimistic', () => {
 render(<OptimisticLoadingIndicator isOptimistic={true} />);
 
 expect(screen.getByText('Updating...')).toBeInTheDocument();
 expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
 });

 it('should not render when not optimistic', () => {
 render(<OptimisticLoadingIndicator isOptimistic={false} />);
 
 expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
 });

 it('should apply custom className', () => {
 const { container } = render(
 <OptimisticLoadingIndicator isOptimistic={true} className="custom-class" />
 );
 expect(container.firstChild).toHaveClass('custom-class');
 });
});