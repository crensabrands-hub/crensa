import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchResults, { SearchResult } from '@/components/search/SearchResults';

jest.mock('next/link', () => {
 return function MockLink({ children, href, ...props }: any) {
 return <a href={href} {...props}>{children}</a>;
 };
});

const mockResults: SearchResult[] = [
 {
 id: '1',
 title: 'Test Video 1',
 type: 'video',
 thumbnail: '/test-thumbnail.jpg',
 url: '/watch/1',
 creator: {
 username: 'testcreator',
 displayName: 'Test Creator',
 avatar: '/test-avatar.jpg',
 },
 creditCost: 5,
 duration: 120,
 },
 {
 id: '2',
 title: 'Test Video 2',
 type: 'video',
 thumbnail: '/test-thumbnail2.jpg',
 url: '/watch/2',
 creator: {
 username: 'creator2',
 displayName: 'Creator Two',
 },
 creditCost: 3,
 duration: 90,
 },
];

const defaultProps = {
 results: [],
 loading: false,
 error: null,
 query: '',
 isOpen: false,
 onClose: jest.fn(),
 onResultClick: jest.fn(),
 selectedIndex: -1,
 onKeyboardNavigation: jest.fn(),
};

describe('SearchResults Component', () => {
 beforeEach(() => {
 jest.clearAllMocks();

 Element.prototype.scrollIntoView = jest.fn();
 });

 it('renders nothing when not open', () => {
 const { container } = render(<SearchResults {...defaultProps} />);
 expect(container.firstChild).toBeNull();
 });

 it('displays loading state correctly', () => {
 render(
 <SearchResults
 {...defaultProps}
 isOpen={true}
 loading={true}
 />
 );

 expect(screen.getByText('Searching...')).toBeInTheDocument();

 const spinner = document.querySelector('.animate-spin');
 expect(spinner).toBeInTheDocument();
 });

 it('displays error state correctly', () => {
 const errorMessage = 'Search failed';
 render(
 <SearchResults
 {...defaultProps}
 isOpen={true}
 error={errorMessage}
 />
 );

 expect(screen.getByText('Search Error')).toBeInTheDocument();
 expect(screen.getByText(errorMessage)).toBeInTheDocument();
 expect(screen.getByText('Try again')).toBeInTheDocument();
 });

 it('displays no results message when query exists but no results', () => {
 render(
 <SearchResults
 {...defaultProps}
 isOpen={true}
 query="test query"
 results={[]}
 />
 );

 expect(screen.getByText('No results found')).toBeInTheDocument();
 expect(screen.getByText(/No videos or creators match "test query"/)).toBeInTheDocument();
 expect(screen.getByText('Browse all videos')).toBeInTheDocument();
 });

 it('displays search results correctly', () => {
 render(
 <SearchResults
 {...defaultProps}
 isOpen={true}
 query="test"
 results={mockResults}
 />
 );

 expect(screen.getByText('2 results for "test"')).toBeInTheDocument();
 expect(screen.getByText('Test Video 1')).toBeInTheDocument();
 expect(screen.getByText('Test Video 2')).toBeInTheDocument();
 expect(screen.getByText('by Test Creator')).toBeInTheDocument();
 expect(screen.getByText('by Creator Two')).toBeInTheDocument();
 expect(screen.getByText('5 credits')).toBeInTheDocument();
 expect(screen.getByText('3 credits')).toBeInTheDocument();
 });

 it('formats duration correctly', () => {
 render(
 <SearchResults
 {...defaultProps}
 isOpen={true}
 query="test"
 results={mockResults}
 />
 );

 expect(screen.getByText('2:00')).toBeInTheDocument(); // 120 seconds
 expect(screen.getByText('1:30')).toBeInTheDocument(); // 90 seconds
 });

 it('handles result clicks correctly', () => {
 const onResultClick = jest.fn();
 const onClose = jest.fn();

 render(
 <SearchResults
 {...defaultProps}
 isOpen={true}
 query="test"
 results={mockResults}
 onResultClick={onResultClick}
 onClose={onClose}
 />
 );

 const firstResult = screen.getByText('Test Video 1').closest('a');
 fireEvent.click(firstResult!);

 expect(onResultClick).toHaveBeenCalledWith(mockResults[0]);
 expect(onClose).toHaveBeenCalled();
 });

 it('highlights selected result correctly', () => {
 render(
 <SearchResults
 {...defaultProps}
 isOpen={true}
 query="test"
 results={mockResults}
 selectedIndex={0}
 />
 );

 const firstResult = screen.getByText('Test Video 1').closest('a');
 expect(firstResult).toHaveClass('bg-primary-neon-yellow/20');
 expect(firstResult).toHaveAttribute('aria-selected', 'true');
 });

 it('handles keyboard navigation events', async () => {
 const onKeyboardNavigation = jest.fn();

 render(
 <SearchResults
 {...defaultProps}
 isOpen={true}
 query="test"
 results={mockResults}
 onKeyboardNavigation={onKeyboardNavigation}
 />
 );

 fireEvent.keyDown(document, { key: 'ArrowDown' });
 expect(onKeyboardNavigation).toHaveBeenCalledWith('down');

 fireEvent.keyDown(document, { key: 'ArrowUp' });
 expect(onKeyboardNavigation).toHaveBeenCalledWith('up');

 fireEvent.keyDown(document, { key: 'Enter' });
 expect(onKeyboardNavigation).toHaveBeenCalledWith('enter');

 fireEvent.keyDown(document, { key: 'Escape' });
 expect(onKeyboardNavigation).toHaveBeenCalledWith('escape');
 });

 it('displays video type badge correctly', () => {
 render(
 <SearchResults
 {...defaultProps}
 isOpen={true}
 query="test"
 results={mockResults}
 />
 );

 const videoBadges = screen.getAllByText('Video');
 expect(videoBadges).toHaveLength(2);
 videoBadges.forEach(badge => {
 expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
 });
 });

 it('handles missing thumbnail gracefully', () => {
 const resultWithoutThumbnail: SearchResult = {
 ...mockResults[0],
 thumbnail: undefined,
 };

 render(
 <SearchResults
 {...defaultProps}
 isOpen={true}
 query="test"
 results={[resultWithoutThumbnail]}
 />
 );

 const videoIcon = document.querySelector('svg[viewBox="0 0 24 24"]');
 expect(videoIcon).toBeInTheDocument();
 });

 it('handles creator without avatar gracefully', () => {
 const creatorResult: SearchResult = {
 id: '3',
 title: 'Creator Profile',
 type: 'creator',
 url: '/creator/test',
 creator: {
 username: 'testcreator',
 displayName: 'Test Creator',
 },
 };

 render(
 <SearchResults
 {...defaultProps}
 isOpen={true}
 query="test"
 results={[creatorResult]}
 />
 );

 const userIcon = document.querySelector('svg[viewBox="0 0 24 24"]');
 expect(userIcon).toBeInTheDocument();
 expect(screen.getByText('Creator')).toBeInTheDocument();
 });
});