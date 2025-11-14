import { render, screen } from '@testing-library/react';
import MemberHomePage from '../MemberHomePage';

jest.mock('../FeaturedShowsSection', () => {
 return function MockFeaturedShowsSection() {
 return <div data-testid="featured-shows-section">Featured Shows Section</div>;
 };
});

jest.mock('../TrendingCreatorsCarousel', () => {
 return function MockTrendingCreatorsCarousel() {
 return <div data-testid="trending-creators-carousel">Trending Creators Carousel</div>;
 };
});

jest.mock('../UpcomingShowsSection', () => {
 return function MockUpcomingShowsSection() {
 return <div data-testid="upcoming-shows-section">Upcoming Shows Section</div>;
 };
});

jest.mock('../CategoryCarousel', () => {
 return function MockCategoryCarousel() {
 return <div data-testid="category-carousel">Category Carousel</div>;
 };
});

jest.mock('../HighlightedOffersSection', () => {
 return function MockHighlightedOffersSection() {
 return <div data-testid="highlighted-offers-section">Highlighted Offers Section</div>;
 };
});

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
 },
}));

describe('MemberHomePage', () => {
 const mockUserId = 'user123';

 beforeEach(() => {
 jest.spyOn(console, 'log').mockImplementation(() => {});
 jest.spyOn(console, 'error').mockImplementation(() => {});
 });

 afterEach(() => {
 jest.restoreAllMocks();
 });

 it('shows loading state initially', () => {
 render(<MemberHomePage userId={mockUserId} />);
 
 expect(screen.getByText('Loading your personalized content...')).toBeInTheDocument();
 });

 it('renders component without crashing', () => {
 render(<MemberHomePage userId={mockUserId} />);

 expect(screen.getByText('Loading your personalized content...')).toBeInTheDocument();
 });

 it('accepts userId prop', () => {
 const { rerender } = render(<MemberHomePage userId={mockUserId} />);
 
 expect(screen.getByText('Loading your personalized content...')).toBeInTheDocument();

 rerender(<MemberHomePage userId="different-user" />);
 expect(screen.getByText('Loading your personalized content...')).toBeInTheDocument();
 });
});