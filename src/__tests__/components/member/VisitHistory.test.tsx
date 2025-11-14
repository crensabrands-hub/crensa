

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VisitHistory, VisitHistoryCompact } from '@/components/member/VisitHistory';
import { useVisitHistory } from '@/hooks/useProfileVisitTracking';

jest.mock('@/hooks/useProfileVisitTracking');

const mockUseVisitHistory = useVisitHistory as jest.MockedFunction<typeof useVisitHistory>;

describe('VisitHistory Component', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('Loading State', () => {
 it('should show loading skeleton when loading', () => {
 mockUseVisitHistory.mockReturnValue({
 visits: [],
 total: 0,
 loading: true,
 error: undefined,
 retryable: false,
 hasMore: false,
 refetch: jest.fn(),
 retry: jest.fn(),
 isRetrying: false
 });

 render(<VisitHistory />);

 expect(screen.getByText('Recently Visited Profiles')).toBeInTheDocument();
 expect(screen.getAllByRole('generic')).toHaveLength(3); // 3 skeleton items
 });
 });

 describe('Error States', () => {
 it('should show retryable error with retry button', () => {
 const mockRetry = jest.fn();
 mockUseVisitHistory.mockReturnValue({
 visits: [],
 total: 0,
 loading: false,
 error: 'Connection timeout. Please try again.',
 retryable: true,
 hasMore: false,
 refetch: jest.fn(),
 retry: mockRetry,
 isRetrying: false
 });

 render(<VisitHistory />);

 expect(screen.getByText('Connection Issue')).toBeInTheDocument();
 expect(screen.getByText('Connection timeout. Please try again.')).toBeInTheDocument();
 
 const retryButton = screen.getByText('Try Again');
 expect(retryButton).toBeInTheDocument();
 expect(retryButton).not.toBeDisabled();

 fireEvent.click(retryButton);
 expect(mockRetry).toHaveBeenCalledTimes(1);
 });

 it('should show non-retryable error without retry option', () => {
 mockUseVisitHistory.mockReturnValue({
 visits: [],
 total: 0,
 loading: false,
 error: 'Access denied',
 retryable: false,
 hasMore: false,
 refetch: jest.fn(),
 retry: jest.fn(),
 isRetrying: false
 });

 render(<VisitHistory />);

 expect(screen.getByText('Unable to Load Visit History')).toBeInTheDocument();
 expect(screen.getByText('Access denied')).toBeInTheDocument();
 expect(screen.getByText('Try Again')).toBeInTheDocument();
 });

 it('should show retrying state', () => {
 mockUseVisitHistory.mockReturnValue({
 visits: [],
 total: 0,
 loading: false,
 error: 'Connection timeout',
 retryable: true,
 hasMore: false,
 refetch: jest.fn(),
 retry: jest.fn(),
 isRetrying: true
 });

 render(<VisitHistory />);

 const retryButton = screen.getByText('Retrying...');
 expect(retryButton).toBeInTheDocument();
 expect(retryButton).toBeDisabled();
 });
 });

 describe('Empty State', () => {
 it('should show empty state when no visits', () => {
 mockUseVisitHistory.mockReturnValue({
 visits: [],
 total: 0,
 loading: false,
 error: undefined,
 retryable: false,
 hasMore: false,
 refetch: jest.fn(),
 retry: jest.fn(),
 isRetrying: false
 });

 render(<VisitHistory />);

 expect(screen.getByText('No profile visits yet')).toBeInTheDocument();
 expect(screen.getByText('Start exploring creators to see your visit history here')).toBeInTheDocument();
 });
 });

 describe('Success State', () => {
 const mockVisits = [
 {
 id: 'visit_1',
 visitedAt: new Date('2024-01-01T10:00:00Z'),
 source: 'dashboard',
 duration: 300,
 creator: {
 id: 'creator_1',
 username: 'testcreator',
 avatar: 'https://example.com/avatar.jpg'
 }
 },
 {
 id: 'visit_2',
 visitedAt: new Date('2024-01-01T09:00:00Z'),
 source: 'search',
 duration: 150,
 creator: {
 id: 'creator_2',
 username: 'anothercreator',
 avatar: null
 }
 }
 ];

 it('should display visits correctly', () => {
 mockUseVisitHistory.mockReturnValue({
 visits: mockVisits,
 total: 2,
 loading: false,
 error: undefined,
 retryable: false,
 hasMore: false,
 refetch: jest.fn(),
 retry: jest.fn(),
 isRetrying: false
 });

 render(<VisitHistory />);

 expect(screen.getByText('Recently Visited Profiles')).toBeInTheDocument();
 expect(screen.getByText('2 total visits')).toBeInTheDocument();
 expect(screen.getByText('@testcreator')).toBeInTheDocument();
 expect(screen.getByText('@anothercreator')).toBeInTheDocument();
 });

 it('should show load more button when hasMore is true', () => {
 mockUseVisitHistory.mockReturnValue({
 visits: mockVisits,
 total: 10,
 loading: false,
 error: undefined,
 retryable: false,
 hasMore: true,
 refetch: jest.fn(),
 retry: jest.fn(),
 isRetrying: false
 });

 render(<VisitHistory />);

 expect(screen.getByText('Load More')).toBeInTheDocument();
 });

 it('should not show load more button when hasMore is false', () => {
 mockUseVisitHistory.mockReturnValue({
 visits: mockVisits,
 total: 2,
 loading: false,
 error: undefined,
 retryable: false,
 hasMore: false,
 refetch: jest.fn(),
 retry: jest.fn(),
 isRetrying: false
 });

 render(<VisitHistory />);

 expect(screen.queryByText('Load More')).not.toBeInTheDocument();
 });

 it('should handle creator click navigation', () => {

 delete (window as any).location;
 window.location = { href: '' } as any;

 mockUseVisitHistory.mockReturnValue({
 visits: mockVisits,
 total: 2,
 loading: false,
 error: undefined,
 retryable: false,
 hasMore: false,
 refetch: jest.fn(),
 retry: jest.fn(),
 isRetrying: false
 });

 render(<VisitHistory />);

 const creatorElement = screen.getByText('@testcreator');
 fireEvent.click(creatorElement.closest('[role="button"]') || creatorElement);

 expect(window.location.href).toBe('/creator/testcreator');
 });
 });

 describe('Refresh Functionality', () => {
 it('should call retry when refresh button is clicked', () => {
 const mockRetry = jest.fn();
 mockUseVisitHistory.mockReturnValue({
 visits: [],
 total: 0,
 loading: false,
 error: undefined,
 retryable: false,
 hasMore: false,
 refetch: jest.fn(),
 retry: mockRetry,
 isRetrying: false
 });

 render(<VisitHistory />);

 const refreshButton = screen.getByText('Refresh');
 fireEvent.click(refreshButton);

 expect(mockRetry).toHaveBeenCalledTimes(1);
 });

 it('should disable refresh button when loading', () => {
 mockUseVisitHistory.mockReturnValue({
 visits: [],
 total: 0,
 loading: true,
 error: undefined,
 retryable: false,
 hasMore: false,
 refetch: jest.fn(),
 retry: jest.fn(),
 isRetrying: false
 });

 render(<VisitHistory />);

 const refreshButton = screen.getByText('Refresh');
 expect(refreshButton).toBeDisabled();
 });
 });
});

describe('VisitHistoryCompact Component', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('Error State', () => {
 it('should show compact error with retry button', () => {
 const mockRetry = jest.fn();
 mockUseVisitHistory.mockReturnValue({
 visits: [],
 total: 0,
 loading: false,
 error: 'Network error',
 retryable: true,
 hasMore: false,
 refetch: jest.fn(),
 retry: mockRetry,
 isRetrying: false
 });

 render(<VisitHistoryCompact />);

 expect(screen.getByText('Connection issue')).toBeInTheDocument();
 
 const retryButton = screen.getByText('Try again');
 fireEvent.click(retryButton);
 expect(mockRetry).toHaveBeenCalledTimes(1);
 });

 it('should show retrying state in compact view', () => {
 mockUseVisitHistory.mockReturnValue({
 visits: [],
 total: 0,
 loading: false,
 error: 'Network error',
 retryable: true,
 hasMore: false,
 refetch: jest.fn(),
 retry: jest.fn(),
 isRetrying: true
 });

 render(<VisitHistoryCompact />);

 expect(screen.getByText('Retrying...')).toBeInTheDocument();
 });
 });

 describe('Empty State', () => {
 it('should show helpful empty state message', () => {
 mockUseVisitHistory.mockReturnValue({
 visits: [],
 total: 0,
 loading: false,
 error: undefined,
 retryable: false,
 hasMore: false,
 refetch: jest.fn(),
 retry: jest.fn(),
 isRetrying: false
 });

 render(<VisitHistoryCompact />);

 expect(screen.getByText('No recent visits')).toBeInTheDocument();
 expect(screen.getByText('Visit creator profiles to see them here')).toBeInTheDocument();
 });
 });
});