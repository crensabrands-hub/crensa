import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthPageLayout, { crensaAuthTheme } from '../AuthPageLayout';

describe('AuthPageLayout', () => {
 it('should render with title and subtitle', () => {
 render(
 <AuthPageLayout title="Test Title" subtitle="Test Subtitle">
 <div>Test Content</div>
 </AuthPageLayout>
 );

 expect(screen.getByText('Test Title')).toBeInTheDocument();
 expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
 expect(screen.getByText('Test Content')).toBeInTheDocument();
 });

 it('should apply correct CSS classes for Crensa branding', () => {
 render(
 <AuthPageLayout title="Test Title" subtitle="Test Subtitle">
 <div>Test Content</div>
 </AuthPageLayout>
 );

 const container = screen.getByText('Test Title').closest('div');
 expect(container).toHaveClass('text-center');
 
 const title = screen.getByText('Test Title');
 expect(title).toHaveClass('text-3xl', 'font-bold', 'text-neutral-white');
 
 const subtitle = screen.getByText('Test Subtitle');
 expect(subtitle).toHaveClass('text-neutral-white/80');
 });

 it('should have proper background gradient', () => {
 const { container } = render(
 <AuthPageLayout title="Test Title" subtitle="Test Subtitle">
 <div>Test Content</div>
 </AuthPageLayout>
 );

 const backgroundDiv = container.firstChild as HTMLElement;
 expect(backgroundDiv).toHaveClass(
 'min-h-screen',
 'flex',
 'items-center',
 'justify-center',
 'bg-gradient-to-br',
 'from-primary-navy',
 'via-primary-navy/90',
 'to-primary-navy/80'
 );
 });
});

describe('crensaAuthTheme', () => {
 it('should have correct primary button styling', () => {
 expect(crensaAuthTheme.elements.formButtonPrimary).toContain('bg-primary-neon-yellow');
 expect(crensaAuthTheme.elements.formButtonPrimary).toContain('hover:bg-primary-light-yellow');
 expect(crensaAuthTheme.elements.formButtonPrimary).toContain('text-primary-navy');
 });

 it('should have correct card styling', () => {
 expect(crensaAuthTheme.elements.card).toContain('bg-neutral-white/95');
 expect(crensaAuthTheme.elements.card).toContain('backdrop-blur-sm');
 expect(crensaAuthTheme.elements.card).toContain('shadow-2xl');
 });

 it('should have correct form input styling', () => {
 expect(crensaAuthTheme.elements.formFieldInput).toContain('border-neutral-gray');
 expect(crensaAuthTheme.elements.formFieldInput).toContain('focus:border-primary-navy');
 expect(crensaAuthTheme.elements.formFieldInput).toContain('bg-neutral-white');
 });

 it('should have correct color variables', () => {
 expect(crensaAuthTheme.variables.colorPrimary).toBe('#CCE53F');
 expect(crensaAuthTheme.variables.colorText).toBe('#01164D');
 expect(crensaAuthTheme.variables.colorBackground).toBe('#FFFFFF');
 });
});