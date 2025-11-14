import { render, screen, fireEvent } from '@testing-library/react';
import TrendingCreatorsCarousel from '../TrendingCreatorsCarousel';

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
 },
}));

jest.mock('next/image', () => ({
 __esModule: true,
 default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

interface Creator {
 id: string;
 username: string;
 displayName: string;
 avatar?: string;
 videoCount: number;
 totalViews: number;
 category: string;
 isFollowing?: boolean;
}

const mockCreators: Creator[] = [
 {
 id: 'creator1',
 username: 'dancequeen',
 displayName: 'Sarah Martinez',
 avatar: '/images/creators/sarah.jpg',
 videoCount: 24,
 totalViews: 156000,
 category: 'Dance',
 isFollowing: false
 },
 {
 id: 'creator2',
 username: 'comedyking',
 displayName: 'Mike Johnson',
 avatar: '/images/creators/mike.jpg',
 videoCount: 18,
 totalViews: 203000,
 category: 'Comedy',
 isFollowing: true
 },
 {
 id: 'creator3',
 username: 'chefemma',
 displayName: 'Emma Wilson',
 videoCount: 31,
 totalViews: 89000,
 category: 'Cooking',
 isFollowing: false
 }
];

describe('TrendingCreatorsCarousel', () => {
 const mockOnCreatorClick = jest.fn();
 const mockOnFollowToggle = jest.fn();

 beforeEach(() => {
 mockOnCreatorClick.mockClear();
 mockOnFollowToggle.mockClear();
 });

 it('renders trending creators carousel with title', () => {
 render(
 <TrendingCreatorsCarousel 
 creators={mockCreators}
 onCreatorClick={mockOnCreatorClick}
 onFollowToggle={mockOnFollowToggle}
 />
 );
 
 expect(screen.getByText('Trending Creators')).toBeInTheDocument();
 });

 it('displays all creator information correctly', () => {
 render(
 <TrendingCreatorsCarousel 
 creators={mockCreators}
 onCreatorClick={mockOnCreatorClick}
 onFollowToggle={mockOnFollowToggle}
 />
 );

 expect(screen.getByText('Sarah Martinez')).toBeInTheDocument();
 expect(screen.getByText('Mike Johnson')).toBeInTheDocument();
 expect(screen.getByText('Emma Wilson')).toBeInTheDocument();

 expect(screen.getByText('@dancequeen')).toBeInTheDocument();
 expect(screen.getByText('@comedyking')).toBeInTheDocument();
 expect(screen.getByText('@chefemma')).toBeInTheDocument();

 expect(screen.getByText('Dance')).toBeInTheDocument();
 expect(screen.getByText('Comedy')).toBeInTheDocument();
 expect(screen.getByText('Cooking')).toBeInTheDocument();
 });

 it('shows correct video counts and view counts', () => {
 render(
 <TrendingCreatorsCarousel 
 creators={mockCreators}
 onCreatorClick={mockOnCreatorClick}
 onFollowToggle={mockOnFollowToggle}
 />
 );

 expect(screen.getByText('24')).toBeInTheDocument();
 expect(screen.getByText('18')).toBeInTheDocument();
 expect(screen.getByText('31')).toBeInTheDocument();

 expect(screen.getByText('156,000')).toBeInTheDocument();
 expect(screen.getByText('203,000')).toBeInTheDocument();
 expect(screen.getByText('89,000')).toBeInTheDocument();
 });

 it('displays follow status correctly', () => {
 render(
 <TrendingCreatorsCarousel 
 creators={mockCreators}
 onCreatorClick={mockOnCreatorClick}
 onFollowToggle={mockOnFollowToggle}
 />
 );
 
 const followButtons = screen.getAllByText('Follow');
 const followingButtons = screen.getAllByText('Following');
 
 expect(followButtons).toHaveLength(2); // Sarah and Emma are not followed
 expect(followingButtons).toHaveLength(1); // Mike is followed
 });

 it('calls onCreatorClick when View Profile is clicked', () => {
 render(
 <TrendingCreatorsCarousel 
 creators={mockCreators}
 onCreatorClick={mockOnCreatorClick}
 onFollowToggle={mockOnFollowToggle}
 />
 );
 
 const viewProfileButtons = screen.getAllByText('View Profile');
 fireEvent.click(viewProfileButtons[0]);
 
 expect(mockOnCreatorClick).toHaveBeenCalledWith(mockCreators[0]);
 });

 it('calls onFollowToggle when follow button is clicked', () => {
 render(
 <TrendingCreatorsCarousel 
 creators={mockCreators}
 onCreatorClick={mockOnCreatorClick}
 onFollowToggle={mockOnFollowToggle}
 />
 );
 
 const followButtons = screen.getAllByText('Follow');
 fireEvent.click(followButtons[0]);
 
 expect(mockOnFollowToggle).toHaveBeenCalledWith('creator1');
 });

 it('shows navigation buttons when there are many creators', () => {
 const manyCreators = Array.from({ length: 10 }, (_, i) => ({
 ...mockCreators[0],
 id: `creator${i}`,
 displayName: `Creator ${i}`
 }));

 render(
 <TrendingCreatorsCarousel 
 creators={manyCreators}
 onCreatorClick={mockOnCreatorClick}
 onFollowToggle={mockOnFollowToggle}
 />
 );

 const buttons = screen.getAllByRole('button');
 const navButtons = buttons.filter(button => 
 button.querySelector('svg') && 
 (button.querySelector('svg')?.classList.contains('lucide-chevron-left') ||
 button.querySelector('svg')?.classList.contains('lucide-chevron-right'))
 );
 
 expect(navButtons.length).toBe(2); // Previous and Next buttons
 });

 it('handles creators without avatars', () => {
 const creatorsWithoutAvatars: Creator[] = [
 {
 ...mockCreators[0],
 avatar: undefined
 }
 ];

 render(
 <TrendingCreatorsCarousel 
 creators={creatorsWithoutAvatars}
 onCreatorClick={mockOnCreatorClick}
 onFollowToggle={mockOnFollowToggle}
 />
 );

 expect(screen.getByText('S')).toBeInTheDocument(); // First letter of Sarah
 });

 it('handles empty creators list', () => {
 render(
 <TrendingCreatorsCarousel 
 creators={[]}
 onCreatorClick={mockOnCreatorClick}
 onFollowToggle={mockOnFollowToggle}
 />
 );
 
 expect(screen.getByText('Trending Creators')).toBeInTheDocument();

 });

 it('shows pagination dots for large creator lists', () => {
 const manyCreators = Array.from({ length: 10 }, (_, i) => ({
 ...mockCreators[0],
 id: `creator${i}`,
 displayName: `Creator ${i}`
 }));

 render(
 <TrendingCreatorsCarousel 
 creators={manyCreators}
 onCreatorClick={mockOnCreatorClick}
 onFollowToggle={mockOnFollowToggle}
 />
 );

 const buttons = screen.getAllByRole('button');
 const paginationDots = buttons.filter(button => 
 button.className.includes('w-2 h-2 rounded-full')
 );
 
 expect(paginationDots.length).toBeGreaterThan(0);
 });
});