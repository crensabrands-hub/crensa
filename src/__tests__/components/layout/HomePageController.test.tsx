import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import HomePageController from '@/components/layout/HomePageController';

jest.mock('next/navigation', () => ({
 useRouter: jest.fn(),
 usePathname: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;

describe('HomePageController', () => {
 const mockReplace = jest.fn();
 const mockPush = jest.fn();

 beforeEach(() => {
 jest.clearAllMocks();
 mockUseRouter.mockReturnValue({
 replace: mockReplace,
 push: mockPush,
 } as any);
 });

 describe('Landing Page Access Control', () => {
 it('should show landing page for unauthenticated users', () => {
 mockUsePathname.mockReturnValue('/');
 mockUseAuthContext.mockReturnValue({
 isSignedIn: false,
 userProfile: null,
 isLoading: false,
 } as any);

 render(
 <HomePageController>
 <div data-testid="landing-content">Landing Page Content</div>
 </HomePageController>
 );

 expect(screen.getByTestId('landing-content')).toBeInTheDocument();
 expect(mockReplace).not.toHaveBeenCalled();
 });

 it('should redirect creator users to creator dashboard', async () => {
 mockUsePathname.mockReturnValue('/');
 mockUseAuthContext.mockReturnValue({
 isSignedIn: true,
 userProfile: { role: 'creator', id: '1', username: 'creator' },
 isLoading: false,
 } as any);

 render(
 <HomePageController>
 <div data-testid="landing-content">Landing Page Content</div>
 </HomePageController>
 );

 await waitFor(() => {
 expect(mockReplace).toHaveBeenCalledWith('/creator/dashboard');
 });
 });

 it('should redirect member users to member dashboard', async () => {
 mockUsePathname.mockReturnValue('/');
 mockUseAuthContext.mockReturnValue({
 isSignedIn: true,
 userProfile: { role: 'member', id: '1', username: 'member' },
 isLoading: false,
 } as any);

 render(
 <HomePageController>
 <div data-testid="landing-content">Landing Page Content</div>
 </HomePageController>
 );

 await waitFor(() => {
 expect(mockReplace).toHaveBeenCalledWith('/dashboard');
 });
 });

 it('should not redirect when not on landing page', () => {
 mockUsePathname.mockReturnValue('/discover');
 mockUseAuthContext.mockReturnValue({
 isSignedIn: true,
 userProfile: { role: 'creator', id: '1', username: 'creator' },
 isLoading: false,
 } as any);

 render(
 <HomePageController>
 <div data-testid="page-content">Other Page Content</div>
 </HomePageController>
 );

 expect(screen.getByTestId('page-content')).toBeInTheDocument();
 expect(mockReplace).not.toHaveBeenCalled();
 });

 it('should show loading indicator for authenticated users while loading', () => {
 mockUsePathname.mockReturnValue('/');
 mockUseAuthContext.mockReturnValue({
 isSignedIn: true,
 userProfile: null,
 isLoading: true,
 } as any);

 render(
 <HomePageController>
 <div data-testid="landing-content">Landing Page Content</div>
 </HomePageController>
 );

 expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
 expect(screen.queryByTestId('landing-content')).not.toBeInTheDocument();
 });

 it('should show content immediately for unauthenticated users while loading', () => {
 mockUsePathname.mockReturnValue('/');
 mockUseAuthContext.mockReturnValue({
 isSignedIn: false,
 userProfile: null,
 isLoading: true,
 } as any);

 render(
 <HomePageController>
 <div data-testid="landing-content">Landing Page Content</div>
 </HomePageController>
 );

 expect(screen.getByTestId('landing-content')).toBeInTheDocument();
 expect(screen.queryByText('Checking authentication...')).not.toBeInTheDocument();
 });

 it('should show redirect indicator when signed in user is on landing page', () => {
 mockUsePathname.mockReturnValue('/');
 mockUseAuthContext.mockReturnValue({
 isSignedIn: true,
 userProfile: { role: 'member', id: '1', username: 'member' },
 isLoading: false,
 } as any);

 render(
 <HomePageController>
 <div data-testid="landing-content">Landing Page Content</div>
 </HomePageController>
 );

 expect(screen.getByText('Redirecting to dashboard...')).toBeInTheDocument();
 expect(screen.queryByTestId('landing-content')).not.toBeInTheDocument();
 });

 it('should not redirect while still loading', () => {
 mockUsePathname.mockReturnValue('/');
 mockUseAuthContext.mockReturnValue({
 isSignedIn: true,
 userProfile: { role: 'creator', id: '1', username: 'creator' },
 isLoading: true,
 } as any);

 render(
 <HomePageController>
 <div data-testid="landing-content">Landing Page Content</div>
 </HomePageController>
 );

 expect(mockReplace).not.toHaveBeenCalled();
 });
 });
});