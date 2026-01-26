"use client";

import React, {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useCallback,
    useRef,
} from "react";
import { useAuthContext } from "./AuthContext";
import { cachedFetch, cacheInvalidation } from "@/lib/api-cache";
import { backgroundRefresh, refreshHelpers } from "@/lib/background-refresh";

export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    earnings: boolean;
    newFollowers: boolean;
    videoComments: boolean;
    videoLikes: boolean;
    paymentUpdates: boolean;
    systemUpdates: boolean;
}

export interface PrivacyPreferences {
    profileVisibility: "public" | "private";
    showEarnings: boolean;
    showViewCount: boolean;
}

export interface PlaybackPreferences {
    autoplay: boolean;
    quality: "auto" | "high" | "medium" | "low";
    volume: number;
}

export interface UserPreferences {
    notifications: NotificationPreferences;
    privacy: PrivacyPreferences;
    playback: PlaybackPreferences;
}

export interface UserPreferencesState {
    preferences: UserPreferences;
    isLoading: boolean;
    error: string | null;
    lastFetch: number | null;
    isOptimistic: boolean;
}

export interface UserPreferencesContextType extends UserPreferencesState {
    updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
    updateNotificationPreferences: (
        updates: Partial<NotificationPreferences>
    ) => Promise<void>;
    updatePrivacyPreferences: (
        updates: Partial<PrivacyPreferences>
    ) => Promise<void>;
    updatePlaybackPreferences: (
        updates: Partial<PlaybackPreferences>
    ) => Promise<void>;
    refreshPreferences: (force?: boolean) => Promise<void>;
    clearError: () => void;
    clearCache: () => void;
}

type UserPreferencesAction =
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "SET_PREFERENCES"; payload: UserPreferences }
    | { type: "UPDATE_NOTIFICATIONS"; payload: Partial<NotificationPreferences> }
    | { type: "UPDATE_PRIVACY"; payload: Partial<PrivacyPreferences> }
    | { type: "UPDATE_PLAYBACK"; payload: Partial<PlaybackPreferences> }
    | { type: "SET_LAST_FETCH"; payload: number | null }
    | { type: "SET_OPTIMISTIC"; payload: boolean }
    | { type: "RESET_STATE" };

const defaultPreferences: UserPreferences = {
    notifications: {
        email: true,
        push: true,
        earnings: true,
        newFollowers: true,
        videoComments: true,
        videoLikes: true,
        paymentUpdates: true,
        systemUpdates: true,
    },
    privacy: {
        profileVisibility: "public",
        showEarnings: true,
        showViewCount: true,
    },
    playback: {
        autoplay: true,
        quality: "auto",
        volume: 80,
    },
};

const initialState: UserPreferencesState = {
    preferences: defaultPreferences,
    isLoading: false,
    error: null,
    lastFetch: null,
    isOptimistic: false,
};

function userPreferencesReducer(
    state: UserPreferencesState,
    action: UserPreferencesAction
): UserPreferencesState {
    switch (action.type) {
        case "SET_LOADING":
            return { ...state, isLoading: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload };
        case "SET_PREFERENCES":
            return {
                ...state,
                preferences: action.payload,
                isOptimistic: false,
            };
        case "UPDATE_NOTIFICATIONS":
            return {
                ...state,
                preferences: {
                    ...state.preferences,
                    notifications: {
                        ...state.preferences.notifications,
                        ...action.payload,
                    },
                },
            };
        case "UPDATE_PRIVACY":
            return {
                ...state,
                preferences: {
                    ...state.preferences,
                    privacy: {
                        ...state.preferences.privacy,
                        ...action.payload,
                    },
                },
            };
        case "UPDATE_PLAYBACK":
            return {
                ...state,
                preferences: {
                    ...state.preferences,
                    playback: {
                        ...state.preferences.playback,
                        ...action.payload,
                    },
                },
            };
        case "SET_LAST_FETCH":
            return { ...state, lastFetch: action.payload };
        case "SET_OPTIMISTIC":
            return { ...state, isOptimistic: action.payload };
        case "RESET_STATE":
            return initialState;
        default:
            return state;
    }
}

const UserPreferencesContext = createContext<
    UserPreferencesContextType | undefined
>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const LOCAL_STORAGE_KEY = "user_preferences_cache";
const RETRY_DELAY_BASE = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds
const MAX_RETRIES = 3;

export function UserPreferencesProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [state, dispatch] = useReducer(
        userPreferencesReducer,
        initialState,
        (initial) => {

            if (typeof window !== "undefined") {
                try {
                    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
                    if (cached) {
                        const { preferences, timestamp } = JSON.parse(cached);

                        if (Date.now() - timestamp < CACHE_DURATION) {
                            return {
                                ...initial,
                                preferences: { ...defaultPreferences, ...preferences },
                                lastFetch: timestamp,
                            };
                        }
                    }
                } catch (error) {
                    console.warn("Failed to parse cached user preferences:", error);
                }
            }
            return initial;
        }
    );

    const { userProfile, isLoading: authLoading } = useAuthContext();
    const abortControllerRef = useRef<AbortController | null>(null);
    const retryCountRef = useRef<number>(0);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const cachePreferences = useCallback((preferences: UserPreferences) => {
        if (typeof window !== "undefined") {
            try {
                localStorage.setItem(
                    LOCAL_STORAGE_KEY,
                    JSON.stringify({
                        preferences,
                        timestamp: Date.now(),
                    })
                );
            } catch (error) {
                console.warn("Failed to cache user preferences:", error);
            }
        }
    }, []);

    const clearCache = useCallback(() => {
        if (typeof window !== "undefined") {
            try {
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            } catch (error) {
                console.warn("Failed to clear preferences cache:", error);
            }
        }
        dispatch({ type: "SET_LAST_FETCH", payload: null });
    }, []);

    const getRetryDelay = useCallback((attempt: number): number => {
        return Math.min(RETRY_DELAY_BASE * Math.pow(2, attempt), MAX_RETRY_DELAY);
    }, []);

    const fetchPreferences = useCallback(
        async (force = false) => {
            if (!userProfile || authLoading) return;

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();

            try {
                dispatch({ type: "SET_LOADING", payload: true });
                dispatch({ type: "SET_ERROR", payload: null });

                const fetchedPreferences = await cachedFetch("/api/user/preferences", {
                    signal: abortControllerRef.current.signal,
                    cacheConfig: {
                        maxAge: CACHE_DURATION,
                        staleWhileRevalidate: true,
                        dedupe: true,
                    },
                    headers: {
                        "Cache-Control": force ? "no-cache" : "max-age=300",
                    },
                });

                const mergedPreferences: UserPreferences = {
                    notifications: {
                        ...defaultPreferences.notifications,
                        ...fetchedPreferences.notifications,
                    },
                    privacy: {
                        ...defaultPreferences.privacy,
                        ...fetchedPreferences.privacy,
                    },
                    playback: {
                        ...defaultPreferences.playback,
                        ...fetchedPreferences.playback,
                    },
                };

                dispatch({ type: "SET_PREFERENCES", payload: mergedPreferences });
                dispatch({ type: "SET_LAST_FETCH", payload: Date.now() });

                cachePreferences(mergedPreferences);
                retryCountRef.current = 0; // Reset retry count on success
            } catch (error: any) {
                if (error.name === "AbortError") {
                    return; // Request was cancelled, ignore
                }

                console.error("Failed to fetch user preferences:", error);

                const errorMessage = error.message || "Failed to load preferences";
                dispatch({ type: "SET_ERROR", payload: errorMessage });

                if (
                    retryCountRef.current < MAX_RETRIES &&
                    error.message.includes("fetch")
                ) {
                    retryCountRef.current += 1;
                    const delay = getRetryDelay(retryCountRef.current - 1);

                    retryTimeoutRef.current = setTimeout(() => {
                        fetchPreferences(force);
                    }, delay);
                }
            } finally {
                dispatch({ type: "SET_LOADING", payload: false });
            }
        },
        [userProfile, authLoading, cachePreferences, getRetryDelay]
    );

    const updatePreferences = useCallback(
        async (updates: Partial<UserPreferences>) => {
            if (!userProfile) {
                dispatch({ type: "SET_ERROR", payload: "User not authenticated" });
                return;
            }

            const originalPreferences = state.preferences;

            try {

                if (updates.notifications) {
                    dispatch({
                        type: "UPDATE_NOTIFICATIONS",
                        payload: updates.notifications,
                    });
                }
                if (updates.privacy) {
                    dispatch({ type: "UPDATE_PRIVACY", payload: updates.privacy });
                }
                if (updates.playback) {
                    dispatch({ type: "UPDATE_PLAYBACK", payload: updates.playback });
                }

                dispatch({ type: "SET_OPTIMISTIC", payload: true });
                dispatch({ type: "SET_ERROR", payload: null });

                const response = await fetch("/api/user/preferences", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updates),
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const updatedPreferences = await response.json();

                const mergedPreferences: UserPreferences = {
                    notifications: {
                        ...defaultPreferences.notifications,
                        ...updatedPreferences.notifications,
                    },
                    privacy: {
                        ...defaultPreferences.privacy,
                        ...updatedPreferences.privacy,
                    },
                    playback: {
                        ...defaultPreferences.playback,
                        ...updatedPreferences.playback,
                    },
                };

                dispatch({ type: "SET_PREFERENCES", payload: mergedPreferences });
                dispatch({ type: "SET_LAST_FETCH", payload: Date.now() });

                cachePreferences(mergedPreferences);

                cacheInvalidation.preferences();
            } catch (error: any) {
                console.error("Failed to update user preferences:", error);

                dispatch({ type: "SET_PREFERENCES", payload: originalPreferences });
                dispatch({
                    type: "SET_ERROR",
                    payload: error.message || "Failed to update preferences",
                });
            } finally {
                dispatch({ type: "SET_OPTIMISTIC", payload: false });
            }
        },
        [userProfile, state.preferences, cachePreferences]
    );

    const updateNotificationPreferences = useCallback(
        async (updates: Partial<NotificationPreferences>) => {
            if (!userProfile) {
                dispatch({ type: "SET_ERROR", payload: "User not authenticated" });
                return;
            }

            const originalNotifications = state.preferences.notifications;

            try {

                dispatch({ type: "UPDATE_NOTIFICATIONS", payload: updates });
                dispatch({ type: "SET_OPTIMISTIC", payload: true });
                dispatch({ type: "SET_ERROR", payload: null });

                const response = await fetch("/api/user/preferences", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ notifications: updates }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const updatedPreferences = await response.json();

                const mergedPreferences: UserPreferences = {
                    notifications: {
                        ...defaultPreferences.notifications,
                        ...updatedPreferences.notifications,
                    },
                    privacy: {
                        ...defaultPreferences.privacy,
                        ...updatedPreferences.privacy,
                    },
                    playback: {
                        ...defaultPreferences.playback,
                        ...updatedPreferences.playback,
                    },
                };

                dispatch({ type: "SET_PREFERENCES", payload: mergedPreferences });
                dispatch({ type: "SET_LAST_FETCH", payload: Date.now() });

                cachePreferences(mergedPreferences);

                cacheInvalidation.preferences();
            } catch (error: any) {
                console.error("Failed to update notification preferences:", error);

                dispatch({
                    type: "UPDATE_NOTIFICATIONS",
                    payload: originalNotifications,
                });
                dispatch({
                    type: "SET_ERROR",
                    payload: error.message || "Failed to update notification preferences",
                });
            } finally {
                dispatch({ type: "SET_OPTIMISTIC", payload: false });
            }
        },
        [userProfile, state.preferences.notifications, cachePreferences]
    );

    const updatePrivacyPreferences = useCallback(
        async (updates: Partial<PrivacyPreferences>) => {
            if (!userProfile) {
                dispatch({ type: "SET_ERROR", payload: "User not authenticated" });
                return;
            }

            const originalPrivacy = state.preferences.privacy;

            try {

                dispatch({ type: "UPDATE_PRIVACY", payload: updates });
                dispatch({ type: "SET_OPTIMISTIC", payload: true });
                dispatch({ type: "SET_ERROR", payload: null });

                const response = await fetch("/api/user/preferences", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ privacy: updates }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const updatedPreferences = await response.json();

                const mergedPreferences: UserPreferences = {
                    notifications: {
                        ...defaultPreferences.notifications,
                        ...updatedPreferences.notifications,
                    },
                    privacy: {
                        ...defaultPreferences.privacy,
                        ...updatedPreferences.privacy,
                    },
                    playback: {
                        ...defaultPreferences.playback,
                        ...updatedPreferences.playback,
                    },
                };

                dispatch({ type: "SET_PREFERENCES", payload: mergedPreferences });
                dispatch({ type: "SET_LAST_FETCH", payload: Date.now() });

                cachePreferences(mergedPreferences);

                cacheInvalidation.preferences();
            } catch (error: any) {
                console.error("Failed to update privacy preferences:", error);

                dispatch({ type: "UPDATE_PRIVACY", payload: originalPrivacy });
                dispatch({
                    type: "SET_ERROR",
                    payload: error.message || "Failed to update privacy preferences",
                });
            } finally {
                dispatch({ type: "SET_OPTIMISTIC", payload: false });
            }
        },
        [userProfile, state.preferences.privacy, cachePreferences]
    );

    const updatePlaybackPreferences = useCallback(
        async (updates: Partial<PlaybackPreferences>) => {
            if (!userProfile) {
                dispatch({ type: "SET_ERROR", payload: "User not authenticated" });
                return;
            }

            const originalPlayback = state.preferences.playback;

            try {

                dispatch({ type: "UPDATE_PLAYBACK", payload: updates });
                dispatch({ type: "SET_OPTIMISTIC", payload: true });
                dispatch({ type: "SET_ERROR", payload: null });

                const response = await fetch("/api/user/preferences", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ playback: updates }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const updatedPreferences = await response.json();

                const mergedPreferences: UserPreferences = {
                    notifications: {
                        ...defaultPreferences.notifications,
                        ...updatedPreferences.notifications,
                    },
                    privacy: {
                        ...defaultPreferences.privacy,
                        ...updatedPreferences.privacy,
                    },
                    playback: {
                        ...defaultPreferences.playback,
                        ...updatedPreferences.playback,
                    },
                };

                dispatch({ type: "SET_PREFERENCES", payload: mergedPreferences });
                dispatch({ type: "SET_LAST_FETCH", payload: Date.now() });

                cachePreferences(mergedPreferences);

                cacheInvalidation.preferences();
            } catch (error: any) {
                console.error("Failed to update playback preferences:", error);

                dispatch({ type: "UPDATE_PLAYBACK", payload: originalPlayback });
                dispatch({
                    type: "SET_ERROR",
                    payload: error.message || "Failed to update playback preferences",
                });
            } finally {
                dispatch({ type: "SET_OPTIMISTIC", payload: false });
            }
        },
        [userProfile, state.preferences.playback, cachePreferences]
    );

    const refreshPreferences = useCallback(
        async (force = false) => {
            await fetchPreferences(force);
        },
        [fetchPreferences]
    );

    const clearError = useCallback(() => {
        dispatch({ type: "SET_ERROR", payload: null });
    }, []);

    useEffect(() => {
        if (userProfile && !authLoading) {
            fetchPreferences();

            refreshHelpers.preferences(
                (preferences: UserPreferences) => {

                    const mergedPreferences: UserPreferences = {
                        notifications: {
                            ...defaultPreferences.notifications,
                            ...preferences.notifications,
                        },
                        privacy: {
                            ...defaultPreferences.privacy,
                            ...preferences.privacy,
                        },
                        playback: {
                            ...defaultPreferences.playback,
                            ...preferences.playback,
                        },
                    };

                    dispatch({ type: "SET_PREFERENCES", payload: mergedPreferences });
                    dispatch({ type: "SET_LAST_FETCH", payload: Date.now() });
                    cachePreferences(mergedPreferences);
                },
                (error: Error) => {
                    console.warn('Background preferences refresh failed:', error);

                }
            );
        } else if (!userProfile) {
            dispatch({ type: "RESET_STATE" });
            clearCache();

            backgroundRefresh.unregister('/api/user/preferences');
        }
    }, [userProfile, authLoading, cachePreferences, clearCache, fetchPreferences]);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }

            backgroundRefresh.unregister('/api/user/preferences');
        };
    }, []);

    const contextValue: UserPreferencesContextType = {
        ...state,
        updatePreferences,
        updateNotificationPreferences,
        updatePrivacyPreferences,
        updatePlaybackPreferences,
        refreshPreferences,
        clearError,
        clearCache,
    };

    return (
        <UserPreferencesContext.Provider value={contextValue}>
            {children}
        </UserPreferencesContext.Provider>
    );
}

export function useUserPreferences() {
    const context = useContext(UserPreferencesContext);
    if (context === undefined) {
        throw new Error(
            "useUserPreferences must be used within a UserPreferencesProvider"
        );
    }
    return context;
}
