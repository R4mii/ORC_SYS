"use client";

import React, { Component, ErrorInfo, ReactNode, Suspense } from "react";
import { RefreshCw, AlertTriangle, Bug } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// ===========================================
// Error Boundary Types
// ===========================================
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  /** Allow retry by resetting the error boundary */
  resetKeys?: Array<any>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ===========================================
// Loading Fallback
// ===========================================
export const DefaultLoadingFallback = () => (
  <div className="p-4 flex flex-col gap-4 w-full animate-pulse">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-20 w-full" />
  </div>
);

// Specialized loading skeletons for different content types
export const CardLoadingFallback = () => (
  <div className="p-4 border rounded-lg animate-pulse">
    <Skeleton className="h-6 w-1/2 mb-4" />
    <Skeleton className="h-24 w-full mb-2" />
    <Skeleton className="h-6 w-1/3" />
  </div>
);

export const TableLoadingFallback = () => (
  <div className="w-full animate-pulse">
    <Skeleton className="h-10 w-full mb-2" />
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-12 w-full mb-2" />
    ))}
  </div>
);

// ===========================================
// Error Boundary Component
// ===========================================
/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree,
 * log those errors, and display a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to console
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Here you could log to an error monitoring service
    // Example: reportToErrorService(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset the error state if resetKeys have changed
    if (this.state.hasError && this.props.resetKeys) {
      if (!prevProps.resetKeys || 
          JSON.stringify(prevProps.resetKeys) !== JSON.stringify(this.props.resetKeys)) {
        this.reset();
      }
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call the onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Otherwise, use the default fallback UI
      return (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Une erreur s'est produite</AlertTitle>
            <AlertDescription>
              <p className="mt-2 mb-4 text-sm text-destructive/90">
                Une erreur est survenue lors du chargement de cette section. Veuillez réessayer ou contacter le support si le problème persiste.
              </p>
              
              {this.state.error && process.env.NODE_ENV !== 'production' && (
                <div className="mt-4 p-3 rounded bg-black/10 overflow-auto text-xs max-h-32">
                  <p className="font-mono">{this.state.error.toString()}</p>
                </div>
              )}
              
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={this.reset} 
                  size="sm" 
                  variant="outline" 
                  className="gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Réessayer
                </Button>
                
                <Button 
                  onClick={() => window.location.reload()} 
                  size="sm" 
                  variant="outline" 
                  className="gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Recharger la page
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-1"
                  onClick={() => window.open('mailto:support@orcsys.com?subject=Erreur Application&body=' + 
                    encodeURIComponent(`Erreur: ${this.state.error?.message || 'Erreur inconnue'}\n\nHeure: ${new Date().toISOString()}`)
                  )}
                >
                  <Bug className="h-3 w-3" />
                  Signaler un problème
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

// ===========================================
// Utility Higher-Order Component
// ===========================================
/**
 * Higher-order component (HOC) to wrap a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.ComponentType<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WithErrorBoundary.displayName = `WithErrorBoundary(${displayName})`;
  
  return WithErrorBoundary;
}

// ===========================================
// Suspense-compatible Error Boundary
// ===========================================
/**
 * Component that combines ErrorBoundary with Suspense for both error handling and loading states
 */
export function ErrorBoundaryWithSuspense({
  children,
  fallback,
  loadingFallback = <DefaultLoadingFallback />,
  ...errorBoundaryProps
}: ErrorBoundaryProps & { loadingFallback?: ReactNode }) {
  return (
    <ErrorBoundary fallback={fallback} {...errorBoundaryProps}>
      <Suspense fallback={loadingFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// ===========================================
// Custom Section Error Boundary
// ===========================================
/**
 * Specialized error boundary for dashboard sections/widgets
 */
export function SectionErrorBoundary({
  children,
  title = "Section",
  ...props
}: ErrorBoundaryProps & { title?: string }) {
  const customFallback = (
    <div className="p-4 bg-background border rounded-lg shadow-sm">
      <div className="text-sm text-muted-foreground mb-2">
        {title}
      </div>
      <Alert variant="destructive" className="bg-destructive/5">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Impossible de charger cette section</AlertTitle>
        <AlertDescription className="text-xs">
          <Button 
            onClick={() => window.location.reload()} 
            size="sm" 
            variant="outline" 
            className="mt-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Recharger
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <ErrorBoundary fallback={customFallback} {...props}>
      {children}
    </ErrorBoundary>
  );
}

// ===========================================
// Error Handling Utilities
// ===========================================
/**
 * Utility to wrap async functions with error handling
 */
export function handleAsyncError<T>(
  promise: Promise<T>,
  errorHandler?: (error: Error) => void
): Promise<[T | null, Error | null]> {
  return promise
    .then((data) => [data, null] as [T, null])
    .catch((error: Error) => {
      if (errorHandler) {
        errorHandler(error);
      }
      return [null, error] as [null, Error];
    });
}

/**
 * Error display component for form errors or API errors
 */
export function ErrorMessage({ error }: { error: string | null | undefined }) {
  if (!error) return null;
  
  return (
    <div className="text-sm text-destructive flex items-center mt-1">
      <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}
