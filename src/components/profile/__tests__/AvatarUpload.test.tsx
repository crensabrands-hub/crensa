import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AvatarUpload from '../AvatarUpload';

describe('AvatarUpload', () => {
 const mockOnAvatarChange = jest.fn();
 const defaultProps = {
 username: 'testuser',
 onAvatarChange: mockOnAvatarChange,
 };

 beforeEach(() => {
 jest.clearAllMocks();

 global.URL.createObjectURL = jest.fn(() => 'mock-url');
 });

 afterEach(() => {
 jest.restoreAllMocks();
 });

 it('renders with username initial when no avatar provided', () => {
 render(<AvatarUpload {...defaultProps} />);
 
 expect(screen.getByText('T')).toBeInTheDocument(); // First letter of "testuser"
 expect(screen.getByText('Upload Avatar')).toBeInTheDocument();
 });

 it('renders with current avatar when provided', () => {
 render(
 <AvatarUpload 
 {...defaultProps} 
 currentAvatar="https://example.com/avatar.jpg" 
 />
 );
 
 const avatarImage = screen.getByAltText("testuser's avatar");
 expect(avatarImage).toBeInTheDocument();
 expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
 expect(screen.getByText('Change Avatar')).toBeInTheDocument();
 });

 it('opens file dialog when upload button is clicked', () => {
 render(<AvatarUpload {...defaultProps} />);
 
 const uploadButton = screen.getByText('Upload Avatar');
 fireEvent.click(uploadButton);

 const fileInput = screen.getByLabelText('Avatar file input');
 expect(fileInput).toBeInTheDocument();
 });

 it('handles valid file upload', async () => {
 render(<AvatarUpload {...defaultProps} />);
 
 const fileInput = screen.getByLabelText('Avatar file input');
 const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
 
 fireEvent.change(fileInput, { target: { files: [file] } });
 
 await waitFor(() => {
 expect(mockOnAvatarChange).toHaveBeenCalledWith(file);
 expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
 });
 });

 it('rejects non-image files', async () => {

 const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
 
 render(<AvatarUpload {...defaultProps} />);
 
 const fileInput = screen.getByLabelText('Avatar file input');
 const file = new File(['test'], 'test.txt', { type: 'text/plain' });
 
 fireEvent.change(fileInput, { target: { files: [file] } });
 
 await waitFor(() => {
 expect(alertSpy).toHaveBeenCalledWith('Please select an image file');
 expect(mockOnAvatarChange).not.toHaveBeenCalled();
 });
 
 alertSpy.mockRestore();
 });

 it('rejects files larger than 5MB', async () => {

 const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
 
 render(<AvatarUpload {...defaultProps} />);
 
 const fileInput = screen.getByLabelText('Avatar file input');

 const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
 
 fireEvent.change(fileInput, { target: { files: [largeFile] } });
 
 await waitFor(() => {
 expect(alertSpy).toHaveBeenCalledWith('File size must be less than 5MB');
 expect(mockOnAvatarChange).not.toHaveBeenCalled();
 });
 
 alertSpy.mockRestore();
 });

 it('removes avatar when remove button is clicked', async () => {
 render(
 <AvatarUpload 
 {...defaultProps} 
 currentAvatar="https://example.com/avatar.jpg" 
 />
 );
 
 const removeButton = screen.getByLabelText('Remove avatar');
 fireEvent.click(removeButton);
 
 await waitFor(() => {
 expect(mockOnAvatarChange).toHaveBeenCalledWith(null);
 });
 });

 it('shows loading state when isLoading is true', () => {
 render(<AvatarUpload {...defaultProps} isLoading={true} />);
 
 const uploadOverlay = screen.getByLabelText('Upload avatar');
 expect(uploadOverlay).toBeDisabled();

 expect(screen.getByRole('status')).toBeInTheDocument();
 });

 it('shows upload instructions', () => {
 render(<AvatarUpload {...defaultProps} />);
 
 expect(screen.getByText('JPG, PNG or GIF. Max size 5MB.')).toBeInTheDocument();
 });

 it('handles camera icon click to open file dialog', () => {
 render(<AvatarUpload {...defaultProps} />);
 
 const cameraButton = screen.getByLabelText('Upload avatar');
 fireEvent.click(cameraButton);
 
 const fileInput = screen.getByLabelText('Avatar file input');
 expect(fileInput).toBeInTheDocument();
 });
});