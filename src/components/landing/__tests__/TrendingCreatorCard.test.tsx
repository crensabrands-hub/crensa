import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrendingCreatorCard from '../TrendingCreatorCard';
import { TrendingCreator } from '@/types';

const mockCreator: TrendingCreator = {
 id: '1',
 username: 'testcreator',
 displayName: 'Test Creator',
 avatar: '/images/test-creator.jpg',
 followerCount: 15000,
 videoCount: 45,
 category: 'Entertainment',
 isVerified: true
};

describe('TrendingCreatorCard', () => {
 it('renders creator information correctly', () => {
 render(<TrendingCreatorCard creator={mockCreator} />);
 
 expect(screen.getByText('Test Creator')).toBeInTheDocument();
 expect(screen.getByText('@testcreator')).toBeInTheDocument();
 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 expect(screen.getByText('15.0K')).toBeInTheDocument();
 expect(screen.getByText('45')).toBeInTheDocument();
 expect(screen.getByText('Followers')).toBeInTheDocument();
 expect(screen.getByText('Videos')).toBeInTheDocument();
 });

 it('shows verified badge for verified creators', () => {
 render(<TrendingCreatorCard creator={mockCreator} />);
 
 const verifiedIcon = screen.getByTestId('verified-badge');
 expect(verifiedIcon).toBeInTheDocument();
 });

 it('does not show verified badge for unverified creators', () => {
 const unverifiedCreator = { ...mockCreator, isVerified: false };
 render(<TrendingCreatorCard creator={unverifiedCreator} />);
 
 expect(screen.queryByTestId('verified-badge')).not.toBeInTheDocument();
 });

 it('handles follow button click', async () => {
 const mockOnFollow = jest.fn().mockResolvedValue(undefined);
 
 render(
 <TrendingCreatorCard 
 creator={mockCreator} 
 onFollow={mockOnFollow}
 isFollowing={false}
 />
 );
 
 const followButton = screen.getByText('Follow');
 fireEvent.click(followButton);
 
 expect(mockOnFollow).toHaveBeenCalledWith('1');

 expect(screen.getByRole('button')).toBeDisabled();
 });

 it('shows following state when already following', () => {
 render(
 <TrendingCreatorCard 
 creator={mockCreator} 
 isFollowing={true}
 />
 );
 
 expect(screen.getByText('Following')).toBeInTheDocument();
 expect(screen.queryByText('Follow')).not.toBeInTheDocument();
 });

 it('formats large numbers correctly', () => {
 const creatorWithLargeNumbers = {
 ...mockCreator,
 followerCount: 1500000, // 1.5M
 videoCount: 2300 // 2.3K
 };
 
 render(<TrendingCreatorCard creator={creatorWithLargeNumbers} />);
 
 expect(screen.getByText('1.5M')).toBeInTheDocument();
 expect(screen.getByText('2.3K')).toBeInTheDocument();
 });

 it('formats small numbers correctly', () => {
 const creatorWithSmallNumbers = {
 ...mockCreator,
 followerCount: 500,
 videoCount: 12
 };
 
 render(<TrendingCreatorCard creator={creatorWithSmallNumbers} />);
 
 expect(screen.getByText('500')).toBeInTheDocument();
 expect(screen.getByText('12')).toBeInTheDocument();
 });

 it('handles image load error', () => {
 render(<TrendingCreatorCard creator={mockCreator} />);
 
 const image = screen.getByAltText("Test Creator's avatar");

 fireEvent.error(image);
 
 expect(image).toHaveAttribute('src', '/images/default-avatar.png');
 });

 it('links to creator profile', () => {
 render(<TrendingCreatorCard creator={mockCreator} />);
 
 const link = screen.getByRole('link');
 expect(link).toHaveAttribute('href', '/creator/testcreator');
 });

 it('prevents follow button click from triggering link navigation', () => {
 const mockOnFollow = jest.fn().mockResolvedValue(undefined);
 
 render(
 <TrendingCreatorCard 
 creator={mockCreator} 
 onFollow={mockOnFollow}
 />
 );
 
 const followButton = screen.getByText('Follow');
 const clickEvent = new MouseEvent('click', { bubbles: true });

 const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
 const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
 
 fireEvent(followButton, clickEvent);
 
 expect(preventDefaultSpy).toHaveBeenCalled();
 expect(stopPropagationSpy).toHaveBeenCalled();
 });

 it('disables follow button when loading', async () => {
 const mockOnFollow = jest.fn().mockImplementation(
 () => new Promise(resolve => setTimeout(resolve, 100))
 );
 
 render(
 <TrendingCreatorCard 
 creator={mockCreator} 
 onFollow={mockOnFollow}
 />
 );
 
 const followButton = screen.getByText('Follow');
 fireEvent.click(followButton);
 
 expect(followButton).toBeDisabled();
 expect(followButton).toHaveClass('opacity-50', 'cursor-not-allowed');
 
 await waitFor(() => {
 expect(followButton).not.toBeDisabled();
 });
 });

 it('applies hover effects with CSS classes', () => {
 const { container } = render(<TrendingCreatorCard creator={mockCreator} />);
 
 const card = container.querySelector('.group');
 expect(card).toHaveClass('hover:shadow-xl');
 expect(card).toHaveClass('hover:-translate-y-1');
 
 const title = screen.getByText('Test Creator');
 expect(title).toHaveClass('group-hover:text-accent-pink');
 });
});