

import {
 transformEarningsData,
 transformViewsData,
 fillMissingDates,
 calculateGrowthRate,
 calculatePerformanceScore,
 analyzeTrends,
 formatCurrency,
 formatNumber,
 formatDate,
 validateAnalyticsData
} from '@/lib/analytics-utils';

describe('Analytics Utils', () => {
 describe('transformEarningsData', () => {
 it('should transform earnings data correctly', () => {
 const input = [
 { date: '2024-01-01', earnings: 100 },
 { date: '2024-01-02', earnings: 150 }
 ];

 const result = transformEarningsData(input);

 expect(result).toHaveLength(2);
 expect(result[0]).toEqual({
 date: '2024-01-01',
 value: 100,
 label: '₹100.00'
 });
 });

 it('should handle empty data', () => {
 const result = transformEarningsData([]);
 expect(result).toEqual([]);
 });

 it('should filter invalid data', () => {
 const input = [
 { date: '2024-01-01', earnings: 100 },
 { date: null, earnings: 150 } as any,
 { date: '2024-01-03', earnings: null } as any
 ];

 const result = transformEarningsData(input);
 expect(result).toHaveLength(1);
 });
 });

 describe('calculateGrowthRate', () => {
 it('should calculate positive growth rate', () => {
 const result = calculateGrowthRate(150, 100);
 expect(result).toBe(50);
 });

 it('should calculate negative growth rate', () => {
 const result = calculateGrowthRate(75, 100);
 expect(result).toBe(-25);
 });

 it('should handle zero previous value', () => {
 const result = calculateGrowthRate(100, 0);
 expect(result).toBe(100);
 });
 });

 describe('calculatePerformanceScore', () => {
 it('should calculate performance score', () => {
 const result = calculatePerformanceScore(1000, 10000, 10, 100, 1000);
 expect(result).toBeGreaterThan(0);
 expect(result).toBeLessThanOrEqual(100);
 });

 it('should return 0 for no videos', () => {
 const result = calculatePerformanceScore(0, 0, 0, 0, 0);
 expect(result).toBe(0);
 });
 });

 describe('formatCurrency', () => {
 it('should format currency correctly', () => {
 const result = formatCurrency(1234.56);
 expect(result).toContain('₹');
 expect(result).toContain('1,234.56');
 });

 it('should handle invalid numbers', () => {
 const result = formatCurrency(NaN);
 expect(result).toBe('₹0.00');
 });
 });

 describe('formatNumber', () => {
 it('should format large numbers with suffixes', () => {
 expect(formatNumber(1500)).toBe('1.5K');
 expect(formatNumber(1500000)).toBe('1.5M');
 expect(formatNumber(500)).toBe('500');
 });
 });

 describe('validateAnalyticsData', () => {
 it('should validate correct analytics data', () => {
 const validData = {
 summary: {
 totalEarnings: 1000,
 totalViews: 5000,
 totalVideos: 10,
 avgEarningsPerVideo: 100,
 avgViewsPerVideo: 500
 },
 charts: {
 earnings: [],
 views: []
 },
 videoPerformance: [],
 transactions: []
 };

 expect(validateAnalyticsData(validData)).toBe(true);
 });

 it('should reject invalid analytics data', () => {
 const invalidData = {
 summary: {
 totalEarnings: 'invalid' // Should be number
 }
 };

 expect(validateAnalyticsData(invalidData)).toBe(false);
 });

 it('should reject null or undefined data', () => {
 expect(validateAnalyticsData(null)).toBe(false);
 expect(validateAnalyticsData(undefined)).toBe(false);
 });
 });
});