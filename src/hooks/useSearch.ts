"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SearchResult } from "@/components/search/SearchResults";

interface UseSearchOptions {
 debounceMs?: number;
 minQueryLength?: number;
 maxResults?: number;
}

interface SearchState {
 query: string;
 results: SearchResult[];
 loading: boolean;
 error: string | null;
 isOpen: boolean;
 selectedIndex: number;
}

interface UseSearchReturn extends SearchState {
 setQuery: (query: string) => void;
 setIsOpen: (isOpen: boolean) => void;
 clearResults: () => void;
 handleKeyboardNavigation: (
 direction: "up" | "down" | "enter" | "escape"
 ) => void;
 handleResultClick: (result: SearchResult) => void;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
 const { debounceMs = 300, minQueryLength = 2, maxResults = 10 } = options;

 const [state, setState] = useState<SearchState>({
 query: "",
 results: [],
 loading: false,
 error: null,
 isOpen: false,
 selectedIndex: -1,
 });

 const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
 const abortControllerRef = useRef<AbortController | null>(null);

 const transformVideoToSearchResult = useCallback(
 (video: any): SearchResult => ({
 id: video.id,
 title: video.title,
 type: "video" as const,
 thumbnail: video.thumbnailUrl,
 url: `/watch/${video.id}`,
 creator: video.creator,
 creditCost: video.creditCost,
 duration: video.duration,
 }),
 []
 );

 const performSearch = useCallback(
 async (query: string) => {
 if (query.length < minQueryLength) {
 setState((prev) => ({
 ...prev,
 results: [],
 loading: false,
 error: null,
 }));
 return;
 }

 if (abortControllerRef.current) {
 abortControllerRef.current.abort();
 }

 abortControllerRef.current = new AbortController();

 setState((prev) => ({
 ...prev,
 loading: true,
 error: null,
 }));

 try {
 const searchParams = new URLSearchParams({
 search: query,
 limit: maxResults.toString(),
 page: "1",
 });

 const response = await fetch(`/api/discover/videos?${searchParams}`, {
 signal: abortControllerRef.current.signal,
 });

 if (!response.ok) {
 throw new Error(
 `Search failed: ${response.status} ${response.statusText}`
 );
 }

 const data = await response.json();

 if (!data.success) {
 throw new Error(data.error || "Search failed");
 }

 const searchResults: SearchResult[] = (data.videos || []).map(
 transformVideoToSearchResult
 );

 setState((prev) => ({
 ...prev,
 results: searchResults,
 loading: false,
 error: null,
 selectedIndex: -1,
 }));
 } catch (error) {

 if (error instanceof Error && error.name === "AbortError") {
 return;
 }

 console.error("Search error:", error);
 setState((prev) => ({
 ...prev,
 results: [],
 loading: false,
 error:
 error instanceof Error
 ? error.message
 : "Search failed. Please try again.",
 selectedIndex: -1,
 }));
 }
 },
 [minQueryLength, maxResults, transformVideoToSearchResult]
 );

 useEffect(() => {
 if (debounceTimeoutRef.current) {
 clearTimeout(debounceTimeoutRef.current);
 }

 if (state.query.trim()) {
 debounceTimeoutRef.current = setTimeout(() => {
 performSearch(state.query.trim());
 }, debounceMs);
 } else {
 setState((prev) => ({
 ...prev,
 results: [],
 loading: false,
 error: null,
 selectedIndex: -1,
 }));
 }

 return () => {
 if (debounceTimeoutRef.current) {
 clearTimeout(debounceTimeoutRef.current);
 }
 };
 }, [state.query, debounceMs, performSearch]);

 useEffect(() => {
 return () => {
 if (abortControllerRef.current) {
 abortControllerRef.current.abort();
 }
 if (debounceTimeoutRef.current) {
 clearTimeout(debounceTimeoutRef.current);
 }
 };
 }, []);

 const setQuery = useCallback(
 (query: string) => {
 setState((prev) => ({
 ...prev,
 query,
 isOpen: query.length >= minQueryLength,
 }));
 },
 [minQueryLength]
 );

 const setIsOpen = useCallback((isOpen: boolean) => {
 setState((prev) => ({
 ...prev,
 isOpen,
 selectedIndex: isOpen ? prev.selectedIndex : -1,
 }));
 }, []);

 const clearResults = useCallback(() => {
 setState((prev) => ({
 ...prev,
 query: "",
 results: [],
 loading: false,
 error: null,
 isOpen: false,
 selectedIndex: -1,
 }));
 }, []);

 const handleKeyboardNavigation = useCallback(
 (direction: "up" | "down" | "enter" | "escape") => {
 setState((prev) => {
 switch (direction) {
 case "up":
 return {
 ...prev,
 selectedIndex:
 prev.selectedIndex > 0
 ? prev.selectedIndex - 1
 : prev.results.length - 1,
 };

 case "down":
 return {
 ...prev,
 selectedIndex:
 prev.selectedIndex < prev.results.length - 1
 ? prev.selectedIndex + 1
 : 0,
 };

 case "enter":
 if (prev.selectedIndex >= 0 && prev.results[prev.selectedIndex]) {
 const selectedResult = prev.results[prev.selectedIndex];

 window.location.href = selectedResult.url;
 }
 return prev;

 case "escape":
 return {
 ...prev,
 isOpen: false,
 selectedIndex: -1,
 };

 default:
 return prev;
 }
 });
 },
 []
 );

 const handleResultClick = useCallback((result: SearchResult) => {

 console.log("Search result clicked:", result);
 }, []);

 return {
 ...state,
 setQuery,
 setIsOpen,
 clearResults,
 handleKeyboardNavigation,
 handleResultClick,
 };
}
