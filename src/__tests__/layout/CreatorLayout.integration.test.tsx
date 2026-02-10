

import React from 'react';
import Link from 'next/link';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { AuthProvider } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useAuthContext: jest.fn(),
}));

jest.mock('@/hooks/useResponsive', () => ({
    useResponsive: jest.fn(),
    useSidebarTouch: jest.fn(() => ({ sidebarTouchHandlers: {} })),
}));

jest.mock('next/navigation', () => ({
    usePathname: jest.fn(() => '/creator/dashboard'),
}));

jest.mock('next/link', () => {
    return function MockLink({ children, href, onClick, ...props }: any) {
        return (
            <a href={href} onClick={onClick} {...props}>
                {children}
            </a>
        );
    };
});

jest.mock('@/lib/layout-persistence', () => ({
    layoutPersistence: {
        loadPreferences: jest.fn(() => ({
            sidebarCollapsed: false,
            theme: 'light' as const,
            compactMode: false,
        })),
        loadNavigation: jest.fn(() => ({
            activeRoute: '/creator/dashboard',
            breadcrumbs: [],
            sidebarOpen: true,
            mobileMenuOpen: false,
        })),
        savePreferences: jest.fn(() => true),
        saveNavigation: jest.fn(() => true),
        isStorageAvailable: jest.fn(() => true),
        addSyncListener: jest.fn(() => () => { }),
        clearAll: jest.fn(),
        getStorageInfo: jest.fn(() => ({
            preferences: 100,
            navigation: 50,
            available: true,
        })),
    },
}));

jest.mock('@/lib/mobile-optimization', () => ({
    getSidebarWidth: jest.fn(() => 'w-64'),
    getTouchOptimizedSpacing: jest.fn(() => ({
        buttonPadding: 'p-3',
        listItemPadding: 'p-3',
        minTouchTarget: 'min-h-[44px]',
        iconSize: 'w-6 h-6',
    })),
    getOptimizedAnimationClasses: jest.fn(() => 'transition-all duration-300'),
    prefersReducedMotion: jest.fn(() => false),
}));

const { useAuthContext } = require('@/contexts/AuthContext');
const { useResponsive } = require('@/hooks/useResponsive');
const { layoutPersistence: mockPersistence } = require('@/lib/layout-persistence');

function MockCreatorLayout({ children }: { children: React.ReactNode }) {
    const { useLayout } = require('@/contexts/LayoutContext');
    const layout = useLayout();

    return (
        <div data-testid="creator-layout" className="min-h-screen bg-neutral-gray">
            { }
            <header data-testid="creator-header" className="bg-neutral-white shadow-sm">
                <div className="flex items-center justify-between p-4">
                    <button
                        data-testid="sidebar-toggle"
                        onClick={() => layout.setSidebarOpen(!layout.navigation.sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-neutral-gray"
                    >
                        {layout.navigation.sidebarOpen ? 'Close' : 'Open'} Sidebar
                    </button>
                    <div data-testid="layout-info">
                        Layout: {layout.currentLayout} | Loading: {layout.isLayoutLoading.toString()}
                    </div>
                </div>
            </header>

            { }
            <aside
                data-testid="creator-sidebar"
                className={`fixed top-0 left-0 z-50 h-full bg-neutral-white shadow-xl transition-transform duration-300 ${layout.navigation.sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } w-64`}
            >
                <div className="p-4">
                    <h2 className="text-xl font-bold text-primary-navy">Creator Studio</h2>
                    <nav className="mt-4">
                        <ul className="space-y-2">
                            <li>
                                <Link href="/creator/dashboard" className="block p-2 rounded hover:bg-neutral-gray">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/creator/upload" className="block p-2 rounded hover:bg-neutral-gray">
                                    Upload Video
                                </Link>
                            </li>
                            <li>
                                <Link href="/creator/analytics" className="block p-2 rounded hover:bg-neutral-gray">
                                    Analytics
                                </Link>
                            </li>
                        </ul>
                    </nav>
                    <button
                        data-testid="close-sidebar"
                        onClick={() => layout.setSidebarOpen(false)}
                        className="mt-4 p-2 bg-accent-pink text-white rounded"
                    >
                        Close
                    </button>
                </div>
            </aside>

            { }
            <main
                data-testid="creator-main"
                className={`transition-all duration-300 ${layout.navigation.sidebarOpen ? 'ml-64' : 'ml-0'
                    } pt-16`}
            >
                <div className="p-6">
                    {children}
                </div>
            </main>

            { }
            <div data-testid="debug-info" className="fixed bottom-0 right-0 p-2 bg-black text-white text-xs">
                <div>Sidebar: {layout.navigation.sidebarOpen ? 'open' : 'closed'}</div>
                <div>Theme: {layout.preferences.theme}</div>
                <div>Collapsed: {layout.preferences.sidebarCollapsed ? 'yes' : 'no'}</div>
            </div>
        </div>
    );
}

function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <LayoutProvider>
                {children}
            </LayoutProvider>
        </AuthProvider>
    );
}

describe('Creator Layout Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        useAuthContext.mockReturnValue({
            user: { publicMetadata: { role: 'creator' } },
            userProfile: { username: 'testcreator', role: 'creator' },
            isLoading: false,
            hasRole: jest.fn(() => true),
            isSignedIn: true,
            error: null,
            retry: jest.fn(),
            clearError: jest.fn(),
            isOptimistic: false,
            signOut: jest.fn(),
            updateUserProfile: jest.fn(),
            lastFetch: Date.now(),
        });

        useResponsive.mockReturnValue({
            isMobile: false,
            isTablet: false,
            isDesktop: true,
            isTouchDevice: false,
            width: 1024,
            height: 768,
            isMobileDevice: false,
            orientation: 'landscape',
            isSmallMobile: false,
        });
    });

    describe('Layout Initialization', () => {
        it('should initialize creator layout correctly', async () => {
            render(
                <TestWrapper>
                    <MockCreatorLayout>
                        <div data-testid="test-content">Creator Dashboard Content</div>
                    </MockCreatorLayout>
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByTestId('layout-info')).toHaveTextContent('Layout: creator | Loading: false');
            });

            expect(screen.getByTestId('creator-layout')).toBeInTheDocument();
            expect(screen.getByTestId('creator-header')).toBeInTheDocument();
            expect(screen.getByTestId('creator-sidebar')).toBeInTheDocument();
            expect(screen.getByTestId('creator-main')).toBeInTheDocument();
            expect(screen.getByTestId('test-content')).toHaveTextContent('Creator Dashboard Content');
        });

        it('should load persisted layout state', async () => {
            mockPersistence.loadPreferences.mockReturnValue({
                sidebarCollapsed: true,
                theme: 'dark',
                compactMode: true,
            });

            mockPersistence.loadNavigation.mockReturnValue({
                activeRoute: '/creator/analytics',
                breadcrumbs: [],
                sidebarOpen: false,
                mobileMenuOpen: false,
            });

            render(
                <TestWrapper>
                    <MockCreatorLayout>
                        <div>Content</div>
                    </MockCreatorLayout>
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByTestId('debug-info')).toHaveTextContent('Sidebar: closed');
                expect(screen.getByTestId('debug-info')).toHaveTextContent('Theme: dark');
                expect(screen.getByTestId('debug-info')).toHaveTextContent('Collapsed: yes');
            });
        });
    });

    describe('Sidebar Functionality', () => {
        it('should toggle sidebar visibility', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <MockCreatorLayout>
                        <div>Content</div>
                    </MockCreatorLayout>
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByTestId('debug-info')).toHaveTextContent('Sidebar: open');
            });

            const sidebar = screen.getByTestId('creator-sidebar');
            expect(sidebar).toHaveClass('translate-x-0');

            await user.click(screen.getByTestId('sidebar-toggle'));

            await waitFor(() => {
                expect(screen.getByTestId('debug-info')).toHaveTextContent('Sidebar: closed');
            });

            expect(sidebar).toHaveClass('-translate-x-full');

            await user.click(screen.getByTestId('sidebar-toggle'));

            await waitFor(() => {
                expect(screen.getByTestId('debug-info')).toHaveTextContent('Sidebar: open');
            });

            expect(sidebar).toHaveClass('translate-x-0');
        });

        it('should close sidebar from within sidebar', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <MockCreatorLayout>
                        <div>Content</div>
                    </MockCreatorLayout>
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByTestId('debug-info')).toHaveTextContent('Sidebar: open');
            });

            await user.click(screen.getByTestId('close-sidebar'));

            await waitFor(() => {
                expect(screen.getByTestId('debug-info')).toHaveTextContent('Sidebar: closed');
            });
        });

        it('should adjust main content margin based on sidebar state', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <MockCreatorLayout>
                        <div>Content</div>
                    </MockCreatorLayout>
                </TestWrapper>
            );

            const mainContent = screen.getByTestId('creator-main');

            await waitFor(() => {
                expect(mainContent).toHaveClass('ml-64'); // Sidebar open
            });

            await user.click(screen.getByTestId('sidebar-toggle'));

            await waitFor(() => {
                expect(mainContent).toHaveClass('ml-0'); // Sidebar closed
            });
        });
    });

    describe('Mobile Responsiveness', () => {
        it('should handle mobile layout correctly', async () => {
            useResponsive.mockReturnValue({
                isMobile: true,
                isTablet: false,
                isDesktop: false,
                isTouchDevice: true,
                width: 375,
                height: 667,
                isMobileDevice: true,
                orientation: 'portrait',
                isSmallMobile: true,
            });

            render(
                <TestWrapper>
                    <MockCreatorLayout>
                        <div>Mobile Content</div>
                    </MockCreatorLayout>
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByTestId('layout-info')).toHaveTextContent('Layout: creator');
            });

            const mainContent = screen.getByTestId('creator-main');
            expect(mainContent).toHaveClass('ml-0');
        });

        it('should handle tablet layout correctly', async () => {
            useResponsive.mockReturnValue({
                isMobile: false,
                isTablet: true,
                isDesktop: false,
                isTouchDevice: true,
                width: 768,
                height: 1024,
                isMobileDevice: false,
                orientation: 'portrait',
                isSmallMobile: false,
            });

            render(
                <TestWrapper>
                    <MockCreatorLayout>
                        <div>Tablet Content</div>
                    </MockCreatorLayout>
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByTestId('layout-info')).toHaveTextContent('Layout: creator');
            });

            expect(screen.getByTestId('creator-layout')).toBeInTheDocument();
        });
    });

    describe('State Persistence', () => {
        it('should persist sidebar state changes', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <MockCreatorLayout>
                        <div>Content</div>
                    </MockCreatorLayout>
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByTestId('debug-info')).toHaveTextContent('Sidebar: open');
            });

            await user.click(screen.getByTestId('sidebar-toggle'));

            await waitFor(() => {
                expect(mockPersistence.saveNavigation).toHaveBeenCalledWith(
                    expect.objectContaining({
                        sidebarOpen: false,
                    })
                );
            });
        });

        it('should handle persistence failures gracefully', async () => {
            const user = userEvent.setup();
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            mockPersistence.saveNavigation.mockReturnValue(false);

            render(
                <TestWrapper>
                    <MockCreatorLayout>
                        <div>Content</div>
                    </MockCreatorLayout>
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByTestId('debug-info')).toHaveTextContent('Sidebar: open');
            });

            await user.click(screen.getByTestId('sidebar-toggle'));

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith('Failed to persist navigation state');
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Authentication Integration', () => {
        it('should handle authentication loading state', () => {
            useAuthContext.mockReturnValue({
                user: null,
                userProfile: null,
                isLoading: true,
                hasRole: jest.fn(() => false),
                isSignedIn: false,
                error: null,
                retry: jest.fn(),
                clearError: jest.fn(),
                isOptimistic: false,
                signOut: jest.fn(),
                updateUserProfile: jest.fn(),
                lastFetch: null,
            });

            render(
                <TestWrapper>
                    <MockCreatorLayout>
                        <div>Content</div>
                    </MockCreatorLayout>
                </TestWrapper>
            );

            expect(screen.getByTestId('layout-info')).toHaveTextContent('Loading: true');
        });

        it('should handle non-creator users', async () => {
            useAuthContext.mockReturnValue({
                user: { publicMetadata: { role: 'member' } },
                userProfile: { username: 'testmember', role: 'member' },
                isLoading: false,
                hasRole: jest.fn(() => false),
                isSignedIn: true,
                error: null,
                retry: jest.fn(),
                clearError: jest.fn(),
                isOptimistic: false,
                signOut: jest.fn(),
                updateUserProfile: jest.fn(),
                lastFetch: Date.now(),
            });

            render(
                <TestWrapper>
                    <MockCreatorLayout>
                        <div>Content</div>
                    </MockCreatorLayout>
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByTestId('layout-info')).toHaveTextContent('Layout: member');
            });
        });

        it('should handle unauthenticated users', async () => {
            useAuthContext.mockReturnValue({
                user: null,
                userProfile: null,
                isLoading: false,
                hasRole: jest.fn(() => false),
                isSignedIn: false,
                error: null,
                retry: jest.fn(),
                clearError: jest.fn(),
                isOptimistic: false,
                signOut: jest.fn(),
                updateUserProfile: jest.fn(),
                lastFetch: null,
            });

            render(
                <TestWrapper>
                    <MockCreatorLayout>
                        <div>Content</div>
                    </MockCreatorLayout>
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByTestId('layout-info')).toHaveTextContent('Layout: public');
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle layout errors gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            useAuthContext.mockReturnValue({
                user: { publicMetadata: { role: 'creator' } },
                userProfile: null,
                isLoading: false,
                hasRole: jest.fn(() => { throw new Error('Role check failed'); }),
                isSignedIn: true,
                error: null,
                retry: jest.fn(),
                clearError: jest.fn(),
                isOptimistic: false,
                signOut: jest.fn(),
                updateUserProfile: jest.fn(),
                lastFetch: Date.now(),
            });

            render(
                <TestWrapper>
                    <MockCreatorLayout>
                        <div>Content</div>
                    </MockCreatorLayout>
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByTestId('layout-info')).toHaveTextContent('Loading: false');
            });

            expect(consoleSpy).toHaveBeenCalledWith('Layout detection error:', expect.any(Error));

            consoleSpy.mockRestore();
        });

        it('should handle storage errors', async () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            mockPersistence.isStorageAvailable.mockReturnValue(false);

            render(
                <TestWrapper>
                    <MockCreatorLayout>
                        <div>Content</div>
                    </MockCreatorLayout>
                </TestWrapper>
            );

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith('Browser storage is not available, layout state will not persist');
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Cross-tab Synchronization', () => {
        it('should sync layout changes across tabs', async () => {
            let syncListener: (event: any) => void;

            mockPersistence.addSyncListener.mockImplementation((listener) => {
                syncListener = listener;
                return () => { };
            });

            render(
                <TestWrapper>
                    <MockCreatorLayout>
                        <div>Content</div>
                    </MockCreatorLayout>
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByTestId('debug-info')).toHaveTextContent('Theme: light');
            });

            act(() => {
                syncListener({
                    type: 'preferences',
                    data: { theme: 'dark', sidebarCollapsed: false, compactMode: true },
                    timestamp: Date.now(),
                });
            });

            await waitFor(() => {
                expect(screen.getByTestId('debug-info')).toHaveTextContent('Theme: dark');
            });
        });
    });

    describe('Performance', () => {
        it('should not cause excessive re-renders', async () => {
            const renderSpy = jest.fn();

            function TestComponent() {
                renderSpy();
                return <div>Performance Test</div>;
            }

            render(
                <TestWrapper>
                    <MockCreatorLayout>
                        <TestComponent />
                    </MockCreatorLayout>
                </TestWrapper>
            );

            await waitFor(() => {
                expect(screen.getByText('Performance Test')).toBeInTheDocument();
            });

            expect(renderSpy).toHaveBeenCalledTimes(1);

            const user = userEvent.setup();
            await user.click(screen.getByTestId('sidebar-toggle'));

            await waitFor(() => {
                expect(screen.getByTestId('debug-info')).toHaveTextContent('Sidebar: closed');
            });

            expect(renderSpy).toHaveBeenCalledTimes(1);
        });
    });
});