import { useState, useEffect } from 'react';
import { Category } from '@/types';

interface UseCategoriesReturn {
 categories: Category[];
 loading: boolean;
 error: string | null;
 refetch: () => void;
}

export function useCategories(): UseCategoriesReturn {
 const [categories, setCategories] = useState<Category[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const fetchCategories = async () => {
 try {
 setLoading(true);
 setError(null);

 const response = await fetch('/api/landing/categories');
 
 if (!response.ok) {
 throw new Error(`Failed to fetch categories: ${response.status}`);
 }

 const data = await response.json();
 
 if (!data.success) {
 throw new Error(data.error || 'Failed to fetch categories');
 }

 setCategories(data.data || []);
 } catch (err) {
 const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
 setError(errorMessage);
 console.error('Error fetching categories:', err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchCategories();
 }, []);

 const refetch = () => {
 fetchCategories();
 };

 return {
 categories,
 loading,
 error,
 refetch
 };
}