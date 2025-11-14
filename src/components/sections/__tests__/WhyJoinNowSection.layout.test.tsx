import { render, screen } from '@testing-library/react';
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

describe('WhyJoinNowSection Layout', () => {
 it('renders urgency elements with proper spacing', () => {
 const { container } = render(<WhyJoinNowSection {...mockProps} />);

 const urgencySection = container.querySelector('.space-y-6');
 expect(urgencySection).toBeInTheDocument();

 expect(screen.getByText('Limited Time Offer')).toBeInTheDocument();

 expect(screen.getByText('Early Adopters')).toBeInTheDocument();
 expect(screen.getByText('Lower Fees')).toBeInTheDocument();
 });

 it('has responsive layout for stats block', () => {
 const { container } = render(<WhyJoinNowSection {...mockProps} />);

 const statsBlock = container.querySelector('.flex-col.sm\\:flex-row');
 expect(statsBlock).toBeInTheDocument();

 const statsContainer = container.querySelector('.max-w-sm.sm\\:max-w-none');
 expect(statsContainer).toBeInTheDocument();
 });

 it('has proper separator elements for different screen sizes', () => {
 const { container } = render(<WhyJoinNowSection {...mockProps} />);

 const desktopSeparator = container.querySelector('.hidden.sm\\:block.w-px.h-8');
 expect(desktopSeparator).toBeInTheDocument();

 const mobileSeparator = container.querySelector('.block.sm\\:hidden.w-8.h-px');
 expect(mobileSeparator).toBeInTheDocument();
 });

 it('has proper text sizing for different screen sizes', () => {
 const { container } = render(<WhyJoinNowSection {...mockProps} />);

 const responsiveText = container.querySelectorAll('.text-2xl.sm\\:text-3xl');
 expect(responsiveText.length).toBe(2); // One for counter, one for percentage
 });

 it('maintains proper spacing between urgency elements', () => {
 const { container } = render(<WhyJoinNowSection {...mockProps} />);

 const urgencyContainer = container.querySelector('.mb-12.space-y-6');
 expect(urgencyContainer).toBeInTheDocument();
 });
});