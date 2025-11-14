import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoUpload from '../VideoUpload';
import { AspectRatio } from '@/types';

global.fetch = jest.fn(() =>
 Promise.resolve({
 ok: true,
 json: () => Promise.resolve({ series: [] }),
 })
) as jest.Mock;

global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

const createMockFile = (name = 'test-video.mp4', type = 'video/mp4', size = 1024 * 1024) => {
 return new File(['mock video content'], name, { type, lastModified: Date.now() });
};

describe('VideoUpload - Aspect Ratio Features', () => {
 const mockOnUploadComplete = jest.fn();

 beforeEach(() => {
 jest.clearAllMocks();
 (fetch as jest.Mock).mockClear();
 });

 it('renders aspect ratio selector when file is uploaded', async () => {
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />);
 
 const file = createMockFile();
 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
 
 fireEvent.change(fileInput, { target: { files: [file] } });
 
 await waitFor(() => {
 expect(screen.getByText('Aspect Ratio')).toBeInTheDocument();
 });
 });

 it('shows video preview with selected aspect ratio', async () => {
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />);
 
 const file = createMockFile();
 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
 
 fireEvent.change(fileInput, { target: { files: [file] } });
 
 await waitFor(() => {
 expect(screen.getByText('Preview')).toBeInTheDocument();

 const videoElement = document.querySelector('video');
 expect(videoElement).toBeInTheDocument();
 });
 });

 it('updates preview when aspect ratio changes', async () => {
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />);
 
 const file = createMockFile();
 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
 
 fireEvent.change(fileInput, { target: { files: [file] } });
 
 await waitFor(() => {
 expect(screen.getByText('Preview')).toBeInTheDocument();
 });

 const portraitButton = screen.getByRole('button', { name: /Portrait 9:16/i });
 fireEvent.click(portraitButton);
 
 await waitFor(() => {
 expect(screen.getByText('📱 Optimized for mobile viewing')).toBeInTheDocument();
 });
 });

 it('shows mobile optimization indicator for vertical ratios', async () => {
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />);
 
 const file = createMockFile();
 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
 
 fireEvent.change(fileInput, { target: { files: [file] } });

 await waitFor(() => {
 const portraitButton = screen.getByRole('button', { name: /Portrait 9:16/i });
 fireEvent.click(portraitButton);
 });
 
 await waitFor(() => {
 expect(screen.getByText('📱')).toBeInTheDocument();
 expect(screen.getByText('📱 Optimized for mobile viewing')).toBeInTheDocument();
 });
 });

 it('includes aspect ratio in upload processing feedback', async () => {
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />);
 
 const file = createMockFile();
 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
 
 fireEvent.change(fileInput, { target: { files: [file] } });

 await waitFor(() => {
 const portraitButton = screen.getByRole('button', { name: /Portrait 9:16/i });
 fireEvent.click(portraitButton);
 });

 await waitFor(() => {
 expect(screen.getByText(/Mobile\/Reel format \(9:16\)/)).toBeInTheDocument();
 });
 });

 it('handles all aspect ratio options correctly', async () => {
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />);
 
 const file = createMockFile();
 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
 
 fireEvent.change(fileInput, { target: { files: [file] } });
 
 await waitFor(() => {
 expect(screen.getByText('Aspect Ratio')).toBeInTheDocument();
 });

 const portraitButton = screen.getByRole('button', { name: /Portrait 9:16/i });
 fireEvent.click(portraitButton);
 
 await waitFor(() => {
 expect(portraitButton).toHaveClass('border-blue-500');
 });

 const squareButton = screen.getByRole('button', { name: /Square 1:1/i });
 fireEvent.click(squareButton);
 
 await waitFor(() => {
 expect(squareButton).toHaveClass('border-blue-500');
 });
 });

 it('preserves aspect ratio selection during form interactions', async () => {
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />);
 
 const file = createMockFile();
 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
 
 fireEvent.change(fileInput, { target: { files: [file] } });

 await waitFor(() => {
 const squareButton = screen.getByRole('button', { name: /Square 1:1/i });
 fireEvent.click(squareButton);
 });

 await waitFor(() => {
 const titleInput = screen.getByLabelText(/Title/);
 fireEvent.change(titleInput, { target: { value: 'Test Video' } });
 });

 await waitFor(() => {
 const squareButton = screen.getByRole('button', { name: /Square 1:1/i });
 expect(squareButton).toHaveClass('border-blue-500');
 });
 });

 it('cleans up video preview URL on unmount', async () => {
 const { unmount } = render(<VideoUpload onUploadComplete={mockOnUploadComplete} />);
 
 const file = createMockFile();
 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
 
 fireEvent.change(fileInput, { target: { files: [file] } });
 
 await waitFor(() => {
 expect(URL.createObjectURL).toHaveBeenCalledWith(file);
 });
 
 unmount();
 
 expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
 });

 it('shows aspect ratio guidance tips', async () => {
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />);
 
 const file = createMockFile();
 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
 
 fireEvent.change(fileInput, { target: { files: [file] } });
 
 await waitFor(() => {
 expect(screen.getByText('💡')).toBeInTheDocument();
 expect(screen.getByText('Tips:')).toBeInTheDocument();
 expect(screen.getByText(/16:9 - Best for desktop viewing/)).toBeInTheDocument();
 expect(screen.getByText(/9:16 - Perfect for mobile/)).toBeInTheDocument();
 });
 });
});