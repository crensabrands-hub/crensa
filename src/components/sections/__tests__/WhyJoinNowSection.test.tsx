import { render, screen, waitFor } from '@testing-library/react';
import { WhyJoinNowSection } from '../WhyJoinNowSection';

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, whileHover, variants, initial, animate, transition, ...props }: any) => <div {...props}>{children}</div>,
 section: ({ children, whileHover, variants, initial, animate, transition, ...props }: any) => <section {...props}>{children}</section>,
 },
 useReducedMotion: () => false,
 useInView: () => true,
}));

const mockProps = {
 title: 'Why Join Now?',
 benefits: [
 'Lock in 50% lower platform fees forever as a founding creator',
 'Get exclusive early access to premium features before anyone else',
 'Receive priority support and direct influence on platform development',
 'Build your audience from day one with zero competition'
 ],
 ctaText: 'Claim Your Spot',
 ctaLink: '/early-access'
};

describe('WhyJoinNowSection', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('renders the section with correct title', () => {
 render(<WhyJoinNowSection {...mockProps} />);
 
 expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Why Join Now?');
 });

 it('renders all benefits with checkmark icons', () => {
 const { container } = render(<WhyJoinNowSection {...mockProps} />);
 
 mockProps.benefits.forEach(benefit => {
 expect(screen.getByText(benefit)).toBeInTheDocument();
 });

 const checkmarks = container.querySelectorAll('svg path[d*="16.707 5.293"]');
 expect(checkmarks).toHaveLength(mockProps.benefits.length);
 });

 it('renders urgency indicators', () => {
 render(<WhyJoinNowSection {...mockProps} />);
 
 expect(screen.getByText('Limited Time Offer')).toBeInTheDocument();
 expect(screen.getByText('Early Adopters')).toBeInTheDocument();
 expect(screen.getByText('Lower Fees')).toBeInTheDocument();
 expect(screen.getByText('50%')).toBeInTheDocument();
 });

 it('renders CTA button with correct link and text', () => {
 render(<WhyJoinNowSection {...mockProps} />);
 
 const ctaButton = screen.getByRole('link', { name: /claim your spot/i });
 expect(ctaButton).toHaveAttribute('href', '/early-access');
 expect(ctaButton).toHaveTextContent('Claim Your Spot');
 });

 it('displays counter animation target value', async () => {
 render(<WhyJoinNowSection {...mockProps} />);

 await waitFor(() => {
 expect(screen.getByText('247')).toBeInTheDocument();
 }, { timeout: 3000 });
 });

 it('renders accessibility features', () => {
 render(<WhyJoinNowSection {...mockProps} />);

 const section = screen.getByRole('region', { name: 'Why Join Now?' });
 expect(section).toBeInTheDocument();

 const ctaButton = screen.getByLabelText(/claim your spot - join as early adopter/i);
 expect(ctaButton).toBeInTheDocument();
 });

 it('renders background decorative elements', () => {
 const { container } = render(<WhyJoinNowSection {...mockProps} />);

 const backgroundElements = container.querySelectorAll('.absolute');
 expect(backgroundElements.length).toBeGreaterThan(0);
 });

 it('renders reassurance text', () => {
 render(<WhyJoinNowSection {...mockProps} />);
 
 expect(screen.getByText('No commitment required')).toBeInTheDocument();
 expect(screen.getByText(/limited spots available/i)).toBeInTheDocument();
 });

 it('applies custom className when provided', () => {
 const customClass = 'custom-test-class';
 const { container } = render(
 <WhyJoinNowSection {...mockProps} className={customClass} />
 );
 
 expect(container.firstChild).toHaveClass(customClass);
 });

 it('renders with proper semantic structure', () => {
 render(<WhyJoinNowSection {...mockProps} />);

 const heading = screen.getByRole('heading', { level: 2 });
 expect(heading).toBeInTheDocument();

 expect(screen.getByText('Lock in 50% lower platform fees forever as a founding creator')).toBeInTheDocument();
 expect(screen.getByText('Get exclusive early access to premium features before anyone else')).toBeInTheDocument();
 expect(screen.getByText('Receive priority support and direct influence on platform development')).toBeInTheDocument();
 expect(screen.getByText('Build your audience from day one with zero competition')).toBeInTheDocument();
 });

 it('renders urgency badge with pulsing indicator', () => {
 const { container } = render(<WhyJoinNowSection {...mockProps} />);

 const pulsingDot = container.querySelector('.animate-pulse');
 expect(pulsingDot).toBeInTheDocument();
 });
});