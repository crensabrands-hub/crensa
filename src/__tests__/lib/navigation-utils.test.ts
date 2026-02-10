import {
    getHomeUrl,
    getDashboardUrl,
    isDashboardRoute,
    isLandingPage,
    shouldHideLandingPage,
} from '../../lib/navigation-utils';

describe('Navigation Utils', () => {
    describe('getHomeUrl', () => {
        it('should return landing page for unauthenticated users', () => {
            expect(getHomeUrl(false)).toBe('/');
            expect(getHomeUrl(false, null)).toBe('/');
            expect(getHomeUrl(false, 'creator')).toBe('/');
        });

        it('should return creator dashboard for authenticated creators', () => {
            expect(getHomeUrl(true, 'creator')).toBe('/creator/dashboard');
        });

        it('should return member dashboard for authenticated members', () => {
            expect(getHomeUrl(true, 'member')).toBe('/dashboard');
        });

        it('should return landing page for authenticated users without role', () => {
            expect(getHomeUrl(true, null)).toBe('/');
            expect(getHomeUrl(true, undefined)).toBe('/');
        });
    });

    describe('getDashboardUrl', () => {
        it('should return creator dashboard for creators', () => {
            expect(getDashboardUrl('creator')).toBe('/creator/dashboard');
        });

        it('should return member dashboard for members', () => {
            expect(getDashboardUrl('member')).toBe('/dashboard');
        });
    });

    describe('isDashboardRoute', () => {
        it('should return true for dashboard routes', () => {
            expect(isDashboardRoute('/dashboard')).toBe(true);
            expect(isDashboardRoute('/creator/dashboard')).toBe(true);
            expect(isDashboardRoute('/creator/analytics')).toBe(true);
            expect(isDashboardRoute('/creator/upload')).toBe(true);
        });

        it('should return false for non-dashboard routes', () => {
            expect(isDashboardRoute('/')).toBe(false);
            expect(isDashboardRoute('/discover')).toBe(false);
            expect(isDashboardRoute('/sign-in')).toBe(false);
            expect(isDashboardRoute('/membership')).toBe(false);
            expect(isDashboardRoute('/creator/jane_doe')).toBe(false);
        });
    });

    describe('isLandingPage', () => {
        it('should return true for landing page', () => {
            expect(isLandingPage('/')).toBe(true);
        });

        it('should return false for other pages', () => {
            expect(isLandingPage('/dashboard')).toBe(false);
            expect(isLandingPage('/creator/dashboard')).toBe(false);
            expect(isLandingPage('/discover')).toBe(false);
        });
    });

    describe('shouldHideLandingPage', () => {
        it('should return true for signed in users on landing page', () => {
            expect(shouldHideLandingPage(true, '/')).toBe(true);
        });

        it('should return false for unauthenticated users on landing page', () => {
            expect(shouldHideLandingPage(false, '/')).toBe(false);
        });

        it('should return false for signed in users on other pages', () => {
            expect(shouldHideLandingPage(true, '/dashboard')).toBe(false);
            expect(shouldHideLandingPage(true, '/creator/dashboard')).toBe(false);
            expect(shouldHideLandingPage(true, '/discover')).toBe(false);
        });

        it('should return false for unauthenticated users on other pages', () => {
            expect(shouldHideLandingPage(false, '/dashboard')).toBe(false);
            expect(shouldHideLandingPage(false, '/discover')).toBe(false);
        });
    });
});