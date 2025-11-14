import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AspectRatioSelector } from '../AspectRatioSelector';
import { AspectRatio } from '@/types';

describe('AspectRatioSelector', () => {
 const mockOnChange = jest.fn();

 beforeEach(() => {
 mockOnChange.mockClear();
 });

 it('renders all aspect ratio options', () => {
 render(
 <AspectRatioSelector
 value="16:9"
 onChange={mockOnChange}
 />
 );

 expect(screen.getByText('Landscape')).toBeInTheDocument();
 expect(screen.getByText('Portrait')).toBeInTheDocument();
 expect(screen.getByText('Square')).toBeInTheDocument();
 expect(screen.getByText('Portrait+')).toBeInTheDocument();
 expect(screen.getByText('Photo')).toBeInTheDocument();
 expect(screen.getByText('Photo Portrait')).toBeInTheDocument();
 });

 it('highlights the selected aspect ratio', () => {
 render(
 <AspectRatioSelector
 value="9:16"
 onChange={mockOnChange}
 />
 );

 const portraitButton = screen.getByRole('button', { name: /Portrait 9:16/i });
 expect(portraitButton).toHaveClass('border-blue-500', 'bg-blue-50', 'text-blue-700');
 });

 it('calls onChange when a different ratio is selected', () => {
 render(
 <AspectRatioSelector
 value="16:9"
 onChange={mockOnChange}
 />
 );

 const squareButton = screen.getByRole('button', { name: /Square 1:1/i });
 fireEvent.click(squareButton);

 expect(mockOnChange).toHaveBeenCalledWith('1:1');
 });

 it('does not call onChange when disabled', () => {
 render(
 <AspectRatioSelector
 value="16:9"
 onChange={mockOnChange}
 disabled={true}
 />
 );

 const squareButton = screen.getByRole('button', { name: /Square 1:1/i });
 fireEvent.click(squareButton);

 expect(mockOnChange).not.toHaveBeenCalled();
 });

 it('shows disabled state when disabled prop is true', () => {
 render(
 <AspectRatioSelector
 value="16:9"
 onChange={mockOnChange}
 disabled={true}
 />
 );

 const buttons = screen.getAllByRole('button');
 buttons.forEach(button => {
 expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
 expect(button).toBeDisabled();
 });
 });

 it('displays the selected ratio description', () => {
 render(
 <AspectRatioSelector
 value="9:16"
 onChange={mockOnChange}
 />
 );

 expect(screen.getByText('Selected:')).toBeInTheDocument();
 expect(screen.getByText('Mobile/Reel format (9:16)')).toBeInTheDocument();
 });

 it('shows usage guidance tips', () => {
 render(
 <AspectRatioSelector
 value="16:9"
 onChange={mockOnChange}
 />
 );

 expect(screen.getByText('💡')).toBeInTheDocument();
 expect(screen.getByText('Tips:')).toBeInTheDocument();
 expect(screen.getByText(/16:9 - Best for desktop viewing/)).toBeInTheDocument();
 expect(screen.getByText(/9:16 - Perfect for mobile/)).toBeInTheDocument();
 expect(screen.getByText(/1:1 - Great for social media/)).toBeInTheDocument();
 });

 it('shows vertical indicator for vertical formats', () => {
 render(
 <AspectRatioSelector
 value="9:16"
 onChange={mockOnChange}
 />
 );

 const verticalIndicators = document.querySelectorAll('.bg-purple-500');
 expect(verticalIndicators.length).toBeGreaterThan(0);
 });

 it('applies custom className', () => {
 const { container } = render(
 <AspectRatioSelector
 value="16:9"
 onChange={mockOnChange}
 className="custom-class"
 />
 );

 expect(container.firstChild).toHaveClass('custom-class');
 });

 it('has proper accessibility attributes', () => {
 render(
 <AspectRatioSelector
 value="16:9"
 onChange={mockOnChange}
 />
 );

 const buttons = screen.getAllByRole('button');
 buttons.forEach(button => {
 expect(button).toHaveAttribute('type', 'button');
 });

 const landscapeButton = screen.getByRole('button', { name: /Landscape 16:9/i });
 expect(landscapeButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
 });

 it('handles keyboard navigation', () => {
 render(
 <AspectRatioSelector
 value="16:9"
 onChange={mockOnChange}
 />
 );

 const landscapeButton = screen.getByRole('button', { name: /Landscape 16:9/i });
 landscapeButton.focus();
 
 fireEvent.keyDown(landscapeButton, { key: 'Enter' });

 expect(mockOnChange).not.toHaveBeenCalled();
 });
});