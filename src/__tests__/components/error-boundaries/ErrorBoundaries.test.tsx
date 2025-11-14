import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary'
import { ApiErrorBoundary } from '@/components/ApiErrorBoundary'
import { GracefulDegradation } from '@/components/GracefulDegradation'
import { ErrorBoundaryLayout } from '@/components/layout/ErrorBoundaryLayout'
import { errorReportingService } from '@/lib/services/errorReportingService'

jest.mock('@/lib/services/errorReportingService', () => ({
 errorReportingService: {
 captureException: jest.fn(),
 captureMessage: jest.fn(),
 setUserContext: jest.fn(),
 }
}))

jest.mock('@clerk/nextjs', () => ({
 useAuth: () => ({
 userId: 'test-user-id',
 user: { publicMetadata: { role: 'member' } }
 })
}))

jest.mock('@/components/providers/UserContextProvider', () => ({
 UserContextProvider: ({ children }: { children: React.ReactNode }) => children
}))

const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
 if (shouldThrow) {
 throw new Error('Test error')
 }
 return <div>No error</div>
}

const ApiErrorComponent = ({ shouldFail = false }: { shouldFail?: boolean }) => {
 if (shouldFail) {
 throw new Error('API connection failed')
 }
 return <div>API success</div>
}

describe('Error Boundaries', () => {
 beforeEach(() => {
 jest.clearAllMocks()

 jest.spyOn(console, 'error').mockImplementation(() => {})
 })

 afterEach(() => {
 jest.restoreAllMocks()
 })

 describe('GlobalErrorBoundary', () => {
 it('should catch and display component-level errors', () => {
 render(
 <GlobalErrorBoundary level="component" componentName="test-component">
 <ThrowError shouldThrow={true} />
 </GlobalErrorBoundary>
 )

 expect(screen.getByText(/test-component error/i)).toBeInTheDocument()
 expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument()
 })

 it('should catch and display page-level errors', () => {
 render(
 <GlobalErrorBoundary level="page" componentName="test-page">
 <ThrowError shouldThrow={true} />
 </GlobalErrorBoundary>
 )

 expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
 expect(screen.getByText(/try again/i)).toBeInTheDocument()
 })

 it('should allow retry functionality', async () => {
 const { rerender } = render(
 <GlobalErrorBoundary level="component" enableRetry={true}>
 <ThrowError shouldThrow={true} />
 </GlobalErrorBoundary>
 )

 const retryButton = screen.getByRole('button', { name: /try again/i })
 fireEvent.click(retryButton)

 await waitFor(() => {
 expect(screen.getByText(/retrying/i)).toBeInTheDocument()
 })

 rerender(
 <GlobalErrorBoundary level="component" enableRetry={true}>
 <ThrowError shouldThrow={false} />
 </GlobalErrorBoundary>
 )

 await waitFor(() => {
 expect(screen.getByText('No error')).toBeInTheDocument()
 })
 })

 it('should report errors to error reporting service', () => {
 render(
 <GlobalErrorBoundary level="component" enableReporting={true}>
 <ThrowError shouldThrow={true} />
 </GlobalErrorBoundary>
 )

 expect(errorReportingService.captureException).toHaveBeenCalledWith(
 expect.any(Error),
 expect.objectContaining({
 component: 'unknown',
 action: 'component-error'
 })
 )
 })

 it('should limit retry attempts', () => {
 render(
 <GlobalErrorBoundary level="component" enableRetry={true}>
 <ThrowError shouldThrow={true} />
 </GlobalErrorBoundary>
 )

 const retryButton = screen.getByRole('button', { name: /try again/i })

 fireEvent.click(retryButton)
 fireEvent.click(retryButton)
 fireEvent.click(retryButton)

 expect(screen.getByRole('button')).toBeInTheDocument()
 })
 })

 describe('ApiErrorBoundary', () => {
 it('should catch and display API errors', () => {
 render(
 <ApiErrorBoundary apiEndpoint="/api/test">
 <ApiErrorComponent shouldFail={true} />
 </ApiErrorBoundary>
 )

 expect(screen.getByText(/connection problem|service temporarily unavailable/i)).toBeInTheDocument()
 })

 it('should provide retry functionality for API errors', async () => {
 const mockRetry = jest.fn()
 
 render(
 <ApiErrorBoundary apiEndpoint="/api/test" onRetry={mockRetry}>
 <ApiErrorComponent shouldFail={true} />
 </ApiErrorBoundary>
 )

 const retryButton = screen.getByRole('button', { name: /try again/i })
 fireEvent.click(retryButton)

 expect(mockRetry).toHaveBeenCalled()
 })

 it('should show endpoint information in development', () => {
 const originalEnv = process.env.NODE_ENV
 process.env.NODE_ENV = 'development'

 render(
 <ApiErrorBoundary apiEndpoint="/api/test">
 <ApiErrorComponent shouldFail={true} />
 </ApiErrorBoundary>
 )

 expect(screen.getByText(/endpoint.*\/api\/test/i)).toBeInTheDocument()

 process.env.NODE_ENV = originalEnv
 })
 })

 describe('GracefulDegradation', () => {
 it('should render children when no error occurs', () => {
 render(
 <GracefulDegradation
 featureName="test-feature"
 fallback={<div>Fallback content</div>}
 >
 <div>Feature content</div>
 </GracefulDegradation>
 )

 expect(screen.getByText('Feature content')).toBeInTheDocument()
 expect(screen.queryByText('Fallback content')).not.toBeInTheDocument()
 })

 it('should handle feature availability state', () => {
 const { rerender } = render(
 <GracefulDegradation
 featureName="test-feature"
 fallback={<div>Fallback content</div>}
 >
 <div>Feature content</div>
 </GracefulDegradation>
 )

 expect(screen.getByText('Feature content')).toBeInTheDocument()

 })
 })

 describe('ErrorBoundaryLayout', () => {
 it('should wrap children with multiple error boundaries', () => {
 render(
 <ErrorBoundaryLayout
 level="page"
 sectionName="test-section"
 enableApiErrorBoundary={true}
 enableContentErrorBoundary={true}
 >
 <div>Test content</div>
 </ErrorBoundaryLayout>
 )

 expect(screen.getByText('Test content')).toBeInTheDocument()
 })

 it('should set user context for error reporting', () => {
 render(
 <ErrorBoundaryLayout level="page" sectionName="test-section">
 <div>Test content</div>
 </ErrorBoundaryLayout>
 )

 expect(errorReportingService.setUserContext).toHaveBeenCalledWith(
 'test-user-id',
 'member'
 )
 })

 it('should handle errors at different levels', () => {
 render(
 <ErrorBoundaryLayout level="component" sectionName="test-component">
 <ThrowError shouldThrow={true} />
 </ErrorBoundaryLayout>
 )

 expect(screen.getByText(/test-component error/i)).toBeInTheDocument()
 })
 })

 describe('Error Recovery', () => {
 it('should clear error state after successful retry', async () => {
 let shouldThrow = true
 
 const TestComponent = () => {
 if (shouldThrow) {
 throw new Error('Test error')
 }
 return <div>Success</div>
 }

 const { rerender } = render(
 <GlobalErrorBoundary level="component" enableRetry={true}>
 <TestComponent />
 </GlobalErrorBoundary>
 )

 expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument()

 shouldThrow = false
 const retryButton = screen.getByRole('button', { name: /try again/i })
 fireEvent.click(retryButton)

 await waitFor(() => {
 rerender(
 <GlobalErrorBoundary level="component" enableRetry={true}>
 <TestComponent />
 </GlobalErrorBoundary>
 )
 })

 await waitFor(() => {
 expect(screen.getByText('Success')).toBeInTheDocument()
 })
 })
 })

 describe('Error Reporting Integration', () => {
 it('should capture error context correctly', () => {
 render(
 <GlobalErrorBoundary 
 level="component" 
 componentName="test-component"
 enableReporting={true}
 >
 <ThrowError shouldThrow={true} />
 </GlobalErrorBoundary>
 )

 expect(errorReportingService.captureException).toHaveBeenCalledWith(
 expect.any(Error),
 expect.objectContaining({
 component: 'test-component',
 action: 'component-error'
 })
 )
 })

 it('should not report errors when reporting is disabled', () => {
 render(
 <GlobalErrorBoundary 
 level="component" 
 enableReporting={false}
 >
 <ThrowError shouldThrow={true} />
 </GlobalErrorBoundary>
 )

 expect(errorReportingService.captureException).not.toHaveBeenCalled()
 })
 })
})