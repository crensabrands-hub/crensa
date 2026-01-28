'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '@/contexts/AuthContext';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { UserContextProvider } from '@/components/providers/UserContextProvider';
import { PWARegister } from '@/components/PWARegister';

export function ClientProviders({ children }: { children: React.ReactNode }) {
 return (
 <ClerkProvider>
 <PWARegister />
 <UserContextProvider>
 <AuthProvider>
 <LayoutProvider>
 <UserPreferencesProvider>
 <NotificationProvider>
 {children}
 </NotificationProvider>
 </UserPreferencesProvider>
 </LayoutProvider>
 </AuthProvider>
 </UserContextProvider>
 </ClerkProvider>
 );
}