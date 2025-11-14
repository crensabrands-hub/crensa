import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeatureSection } from '../FeatureSection';
import { FeatureItem } from '@/types';

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, whileHover, variants, initial, animate, transition, ...props }: any) => <div {...props}>{children}</div>,
 section: ({ children, variants, initial, animate, ...props }: any) => <section {...props}>{children}</section>,
 },
 useReducedMotion: () => false,
 useInView: () => true,
}));

const mockFeatures: FeatureItem[] = [
 {
 icon: '💰',
 title: 'Direct Monetization',
 description: 'Earn credits directly from viewers who pay to watch your content. No ads, no middlemen.'
 },
 {
 icon: '🎯',
 title: 'Quality Over Quantity',
 description: 'Focus on creating amazing content instead of chasing algorithm trends.'
 },
 {
 icon: '📈',
 title: 'Transparent Analytics',
 description: 'Track your earnings, viewer engagement, and content performance in real-time.'
 }
];

describe('FeatureSection', () => {
 const defaultProps = {
 title: 'Why Choose Crensa?',
 subtitle: 'The platform built for creators who want to maximize their earning potential',
 features: mockFeatures,
 };

 beforeEach(() => {

 jest.clearAllMocks();
 });

 it('renders the section with title and subtitle', () => {
 render(<FeatureSection {...defaultProps} />);
 
 expect(screen.getByText('Why Choose Crensa?')).toBeInTheDocument();
 expect(screen.getByText('The platform built for creators who want to maximize their earning potential')).toBeInTheDocument();
 });

 it('renders without subtitle when not provided', () => {
 const propsWithoutSubtitle = {
 title: 'Test Title',
 features: mockFeatures,
 };
 
 render(<FeatureSection {...propsWithoutSubtitle} />);
 
 expect(screen.getByText('Test Title')).toBeInTheDocument();
 expect(screen.queryByText('The platform built for creators')).not.toBeInTheDocument();
 });

 it('renders all feature items correctly', () => {
 render(<FeatureSection {...defaultProps} />);

 expect(screen.getByText('Direct Monetization')).toBeInTheDocument();
 expect(screen.getByText('Quality Over Quantity')).toBeInTheDocument();
 expect(screen.getByText('Transparent Analytics')).toBeInTheDocument();

 expect(screen.getByText(/Earn credits directly from viewers/)).toBeInTheDocument();
 expect(screen.getByText(/Focus on creating amazing content/)).toBeInTheDocument();
 expect(screen.getByText(/Track your earnings, viewer engagement/)).toBeInTheDocument();

 expect(screen.getByText('💰')).toBeInTheDocument();
 expect(screen.getByText('🎯')).toBeInTheDocument();
 expect(screen.getByText('📈')).toBeInTheDocument();
 });

 it('applies custom className when provided', () => {
 const customClass = 'custom-test-class';
 render(<FeatureSection {...defaultProps} className={customClass} />);
 
 const section = screen.getByRole('region', { name: 'Why Choose Crensa?' });
 expect(section).toHaveClass(customClass);
 });

 it('has proper accessibility attributes', () => {
 render(<FeatureSection {...defaultProps} />);

 const section = screen.getByRole('region', { name: 'Why Choose Crensa?' });
 expect(section).toBeInTheDocument();

 const icons = screen.getAllByRole('img');
 expect(icons).toHaveLength(3);
 expect(icons[0]).toHaveAttribute('aria-label', 'Direct Monetization icon');
 expect(icons[1]).toHaveAttribute('aria-label', 'Quality Over Quantity icon');
 expect(icons[2]).toHaveAttribute('aria-label', 'Transparent Analytics icon');
 });

 it('renders with responsive grid classes', () => {
 render(<FeatureSection {...defaultProps} />);
 
 const gridContainer = screen.getByText('Direct Monetization').closest('.grid');
 expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
 });

 it('handles empty features array gracefully', () => {
 const propsWithEmptyFeatures = {
 title: 'Test Title',
 features: [],
 };
 
 render(<FeatureSection {...propsWithEmptyFeatures} />);
 
 expect(screen.getByText('Test Title')).toBeInTheDocument();
 expect(screen.queryByText('Direct Monetization')).not.toBeInTheDocument();
 });

 it('renders feature items in correct order', () => {
 render(<FeatureSection {...defaultProps} />);
 
 const featureTitles = screen.getAllByRole('heading', { level: 3 });
 expect(featureTitles[0]).toHaveTextContent('Direct Monetization');
 expect(featureTitles[1]).toHaveTextContent('Quality Over Quantity');
 expect(featureTitles[2]).toHaveTextContent('Transparent Analytics');
 });

 it('has proper semantic structure', () => {
 render(<FeatureSection {...defaultProps} />);

 const mainHeading = screen.getByRole('heading', { level: 2 });
 expect(mainHeading).toHaveTextContent('Why Choose Crensa?');

 const featureHeadings = screen.getAllByRole('heading', { level: 3 });
 expect(featureHeadings).toHaveLength(3);
 });

 it('applies correct styling classes', () => {
 render(<FeatureSection {...defaultProps} />);
 
 const section = screen.getByRole('region');
 expect(section).toHaveClass('section-padding', 'bg-neutral-white');
 
 const container = section.querySelector('.container');
 expect(container).toBeInTheDocument();
 
 const headerDiv = screen.getByText('Why Choose Crensa?').closest('div');
 expect(headerDiv).toHaveClass('text-center', 'mb-12', 'lg:mb-16');
 });

 it('renders icon containers with proper styling', () => {
 render(<FeatureSection {...defaultProps} />);
 
 const iconContainers = screen.getAllByRole('img').map(icon => icon.closest('div'));
 
 iconContainers.forEach(container => {
 expect(container).toHaveClass(
 'inline-flex',
 'items-center',
 'justify-center',
 'w-20',
 'h-20',
 'mb-6',
 'rounded-2xl'
 );
 });
 });
});