import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import FeaturedHeroCarousel from '../FeaturedHeroCarousel';
import { FeaturedContent } from '@/types';

jest.mock('next/link', () => {
 return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
 return <a href={href}>{children}</a>;
 };
});

jest.mock('next/image', () => {
 return function MockImage({ src, alt, ...props }: any) {
 return <img src={src} alt={alt} {...props} />;
 };
});

const mockFeaturedContent: FeaturedContent[] = [
 {
 id: '1',
 type: 'video',
 title: 'Amazing Video Content',
 description: 'This is an amazing video that you should watch',
 imageUrl: '/test-image-1.jpg',
 creatorName: 'John Creator',
 creatorAvatar: '/creator-1.jpg',
 category: 'Entertainment',
 href: '/watch/1'
 },
 {
 id: '2',
 type: 'series',
 title: 'Fantastic Series',
 description: 'A fantastic series with multiple episodes',
 imageUrl: '/test-image-2.jpg',
 creatorName: 'Jane Producer',
 creatorAvatar: '/creator-2.jpg',
 category: 'Education',
 href: '/series/2'
 },
 {
 id: '3',
 type: 'video',
 title: 'Another Great Video',
 description: 'Another piece of great content',
 imageUrl: '/test-image-3.jpg',
 creatorName: 'Bob Filmmaker',
 creatorAvatar: '/creator-3.jpg',
 category: 'Technology',
 href: '/watch/3'
 }
];

describe('FeaturedHeroCarousel', () => {
 beforeEach(() => {
 jest.clearAllTimers();
 jest.useFakeTimers();
 });

 afterEach(() => {
 jest.runOnlyPendingTimers();
 jest.useRealTimers();
 });

 it('renders featured content correctly', () => {
 render(<FeaturedHeroCarousel featuredContent={mockFeaturedContent} />);

 expect(screen.getByText('Amazing Video Content')).toBeInTheDocument();
 expect(screen.getByText('This is an amazing video that you should watch')).toBeInTheDocument();
 expect(screen.getByText('by John Creator')).toBeInTheDocument();
 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 });

 it('shows correct content type badges', () => {
 render(<FeaturedHeroCarousel featuredContent={mockFeaturedContent} />);
 
 expect(screen.getByText('Video')).toBeInTheDocument();
 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 });

 it('renders navigation controls when multiple items exist', () => {
 render(<FeaturedHeroCarousel featuredContent={mockFeaturedContent} />);
 
 expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
 expect(screen.getByLabelText('Next slide')).toBeInTheDocument();

 const dots = screen.getAllByRole('button').filter(button => 
 button.getAttribute('aria-label')?.startsWith('Go to slide')
 );
 expect(dots).toHaveLength(3);
 });

 it('does not render navigation controls for single item', () => {
 render(<FeaturedHeroCarousel featuredContent={[mockFeaturedContent[0]]} />);
 
 expect(screen.queryByLabelText('Previous slide')).not.toBeInTheDocument();
 expect(screen.queryByLabelText('Next slide')).not.toBeInTheDocument();
 });

 it('navigates to next slide when next button is clicked', () => {
 render(<FeaturedHeroCarousel featuredContent={mockFeaturedContent} />);

 expect(screen.getByText('Amazing Video Content')).toBeInTheDocument();

 fireEvent.click(screen.getByLabelText('Next slide'));

 expect(screen.getByText('Fantastic Series')).toBeInTheDocument();
 expect(screen.getByText('Series')).toBeInTheDocument();
 });

 it('navigates to previous slide when previous button is clicked', () => {
 render(<FeaturedHeroCarousel featuredContent={mockFeaturedContent} />);

 fireEvent.click(screen.getByLabelText('Next slide'));
 expect(screen.getByText('Fantastic Series')).toBeInTheDocument();

 fireEvent.click(screen.getByLabelText('Previous slide'));

 expect(screen.getByText('Amazing Video Content')).toBeInTheDocument();
 });

 it('navigates to specific slide when dot indicator is clicked', () => {
 render(<FeaturedHeroCarousel featuredContent={mockFeaturedContent} />);

 fireEvent.click(screen.getByLabelText('Go to slide 3'));

 expect(screen.getByText('Another Great Video')).toBeInTheDocument();
 expect(screen.getByText('Technology')).toBeInTheDocument();
 });

 it('auto-advances slides after interval', async () => {
 render(<FeaturedHeroCarousel featuredContent={mockFeaturedContent} autoplayInterval={1000} />);

 expect(screen.getByText('Amazing Video Content')).toBeInTheDocument();

 jest.advanceTimersByTime(1000);

 await waitFor(() => {
 expect(screen.getByText('Fantastic Series')).toBeInTheDocument();
 });
 });

 it('pauses autoplay on mouse enter and resumes on mouse leave', async () => {
 render(<FeaturedHeroCarousel featuredContent={mockFeaturedContent} autoplayInterval={1000} />);
 
 const carousel = screen.getByRole('region', { name: 'Featured content carousel' });

 fireEvent.mouseEnter(carousel);
 
 jest.advanceTimersByTime(2000);

 expect(screen.getByText('Amazing Video Content')).toBeInTheDocument();

 fireEvent.mouseLeave(carousel);
 
 jest.advanceTimersByTime(1000);

 await waitFor(() => {
 expect(screen.getByText('Fantastic Series')).toBeInTheDocument();
 });
 });

 it('handles keyboard navigation', () => {
 render(<FeaturedHeroCarousel featuredContent={mockFeaturedContent} />);

 expect(screen.getByText('Amazing Video Content')).toBeInTheDocument();

 fireEvent.keyDown(window, { key: 'ArrowRight' });

 expect(screen.getByText('Fantastic Series')).toBeInTheDocument();

 fireEvent.keyDown(window, { key: 'ArrowLeft' });

 expect(screen.getByText('Amazing Video Content')).toBeInTheDocument();
 });

 it('wraps around when navigating past boundaries', () => {
 render(<FeaturedHeroCarousel featuredContent={mockFeaturedContent} />);

 fireEvent.click(screen.getByLabelText('Go to slide 3'));
 expect(screen.getByText('Another Great Video')).toBeInTheDocument();

 fireEvent.click(screen.getByLabelText('Next slide'));
 expect(screen.getByText('Amazing Video Content')).toBeInTheDocument();

 fireEvent.click(screen.getByLabelText('Previous slide'));
 expect(screen.getByText('Another Great Video')).toBeInTheDocument();
 });

 it('renders empty state when no content provided', () => {
 render(<FeaturedHeroCarousel featuredContent={[]} />);
 
 expect(screen.getByText('No featured content available')).toBeInTheDocument();
 });

 it('renders correct CTA button text based on content type', () => {
 render(<FeaturedHeroCarousel featuredContent={mockFeaturedContent} />);

 expect(screen.getByText('Watch Now')).toBeInTheDocument();

 fireEvent.click(screen.getByLabelText('Next slide'));

 expect(screen.getByText('Watch Series')).toBeInTheDocument();
 });

 it('has proper accessibility attributes', () => {
 render(<FeaturedHeroCarousel featuredContent={mockFeaturedContent} />);
 
 const carousel = screen.getByRole('region', { name: 'Featured content carousel' });
 expect(carousel).toBeInTheDocument();
 
 const prevButton = screen.getByLabelText('Previous slide');
 const nextButton = screen.getByLabelText('Next slide');
 
 expect(prevButton).toHaveAttribute('aria-label', 'Previous slide');
 expect(nextButton).toHaveAttribute('aria-label', 'Next slide');
 });
});