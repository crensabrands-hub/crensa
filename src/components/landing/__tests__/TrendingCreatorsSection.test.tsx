import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrendingCreatorsSection from '../TrendingCreatorsSection';
import { TrendingCreator } from '@/types';

jest.mock('@/hooks/useTrendingCreators', () => ({
 useTrendingCreators: jest.fn()
}));

const mockUseTrendingCreators = require('@/hooks/useTrendingCreators').useTrendingCreators;

const mockCreators: TrendingCreator[] = [
 {
 id: '1',
 username: 'creator1',
 displayName: 'Creator One',
 avatar: '/images/creator1.jpg',
 followerCount: 15000,
 videoCount: 45,
 category: 'Entertainment',
 isVerified: true
 },
 {
 id: '2',
 username: 'creator2',
 displayName: 'Creator Two',
 avatar: '/images/creator2.jpg',
 followerCount: 8500,
 videoCount: 23,
 category: 'Education',
 isVerified: false
 },
 {
 id: '3',
 username: 'creator3',
 displayName: 'Creator Three',
 avatar: '/images/creator3.jpg',
 followerCount: 32000,
 videoCount: 78,
 category: 'Gaming',
 isVerified: true
 }
];

describe('TrendingCreatorsSection', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('renders loading skeleton when loading', () => {
 mockUseTrendingCreators.mockReturnValue({
 creators: [],
 loading: true,
 error: null,
 refetch: jest.fn()
 });

 render(<TrendingCreatorsSection />);

 const skeletons = screen.getAllByRole('generic');
 expect(skeletons.length).toBeGreaterThan(0);
 });

 it('renders creators when data is loaded', () => {
 mockUseTrendingCreators.mockReturnValue({
 creators: mockCreators,
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 render(<TrendingCreatorsSection />);

 expect(screen.getByText('Creator One')).toBeInTheDocument();
 expect(screen.getByText('Creator Two')).toBeInTheDocument();
 expect(screen.getByText('Creator Three')).toBeInTheDocument();

 expect(screen.getByText('@creator1')).toBeInTheDocument();
 expect(screen.getByText('@creator2')).toBeInTheDocument();
 expect(screen.getByText('@creator3')).toBeInTheDocument();

 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 expect(screen.getByText('Education')).toBeInTheDocument();
 expect(screen.getByText('Gaming')).toBeInTheDocument();
 });

 it('renders error state with retry button', () => {
 const mockRefetch = jest.fn();
 mockUseTrendingCreators.mockReturnValue({
 creators: [],
 loading: false,
 error: 'Failed to fetch creators',
 refetch: mockRefetch
 });

 render(<TrendingCreatorsSection />);
 
 expect(screen.getByText('Unable to load trending creators')).toBeInTheDocument();
 expect(screen.getByText('Failed to fetch creators')).toBeInTheDocument();
 
 const retryButton = screen.getByText('Try Again');
 expect(retryButton).toBeInTheDocument();
 
 fireEvent.click(retryButton);
 expect(mockRefetch).toHaveBeenCalledTimes(1);
 });

 it('renders empty state when no creators found', () => {
 mockUseTrendingCreators.mockReturnValue({
 creators: [],
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 render(<TrendingCreatorsSection />);
 
 expect(screen.getByText('No trending creators found')).toBeInTheDocument();
 expect(screen.getByText('Check back later for the latest trending creators')).toBeInTheDocument();
 });

 it('uses prop data when provided', () => {
 mockUseTrendingCreators.mockReturnValue({
 creators: [],
 loading: true,
 error: null,
 refetch: jest.fn()
 });

 render(
 <TrendingCreatorsSection 
 creators={mockCreators} 
 loading={false} 
 />
 );

 expect(screen.getByText('Creator One')).toBeInTheDocument();

 expect(screen.queryByText('Creator One')).toBeInTheDocument();
 });

 it('handles follow button clicks', async () => {
 mockUseTrendingCreators.mockReturnValue({
 creators: mockCreators,
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 render(<TrendingCreatorsSection />);
 
 const followButtons = screen.getAllByText('Follow');
 expect(followButtons.length).toBe(3);

 fireEvent.click(followButtons[0]);

 await waitFor(() => {
 expect(screen.getByText('Following')).toBeInTheDocument();
 });
 });

 it('formats follower and video counts correctly', () => {
 const creatorsWithLargeCounts: TrendingCreator[] = [
 {
 id: '1',
 username: 'bigcreator',
 displayName: 'Big Creator',
 avatar: '/images/big.jpg',
 followerCount: 1500000, // 1.5M
 videoCount: 2300, // 2.3K
 category: 'Entertainment'
 }
 ];

 mockUseTrendingCreators.mockReturnValue({
 creators: creatorsWithLargeCounts,
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 render(<TrendingCreatorsSection />);
 
 expect(screen.getByText('1.5M')).toBeInTheDocument();
 expect(screen.getByText('2.3K')).toBeInTheDocument();
 });

 it('shows verified badge for verified creators', () => {
 mockUseTrendingCreators.mockReturnValue({
 creators: mockCreators,
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 render(<TrendingCreatorsSection />);

 const verifiedBadges = screen.getAllByTestId('verified-badge');
 expect(verifiedBadges).toHaveLength(2);
 });

 it('applies responsive grid classes', () => {
 mockUseTrendingCreators.mockReturnValue({
 creators: mockCreators,
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 const { container } = render(<TrendingCreatorsSection />);
 
 const grid = container.querySelector('.grid');
 expect(grid).toHaveClass('grid-cols-1');
 expect(grid).toHaveClass('sm:grid-cols-2');
 expect(grid).toHaveClass('lg:grid-cols-3');
 expect(grid).toHaveClass('xl:grid-cols-4');
 });
});