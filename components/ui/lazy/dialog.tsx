/**
 * Lazy-loaded Dialog Components
 * 
 * This module provides optimized Dialog components that are loaded on-demand
 * using code splitting and lazy loading techniques. This approach reduces
 * initial bundle size while maintaining a seamless user experience through
 * proper loading states, error handling, and strategic preloading.
 * 
 * Features:
 * - Lazy loading with code splitting
 * - Suspense integration for loading states
 * - Error boundary integration for error handling
 * - Preloading strategies (hover, priority-based, batch)
 * - Full TypeScript type safety
 * - SSR compatibility
 * 
 * @module components/ui/lazy/dialog
 */
import * as React from "react"
import { createLazyComponentBatch } from "../lazy-component"
import { getOptimizedLazyOptions } from "../lazy-component-analyzer"
import { cn } from "@/lib/utils"

/**
 * Type definitions for Dialog components
 */
export interface DialogProps {
  /**
   * The controlled open state of the dialog
   */
  open?: boolean;
  /**
   * Event handler called when the open state changes
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * The default open state when uncontrolled
   */
  defaultOpen?: boolean;
  /**
   * Whether the dialog is modal (prevents interaction outside)
   */
  modal?: boolean;
  /**
   * Children elements
   */
  children?: React.ReactNode;
}

export interface DialogTriggerProps {
  /**
   * Change the component to the HTML tag or custom component of the only child
   */
  asChild?: boolean;
  /**
   * Children elements
   */
  children: React.ReactNode;
}

export interface DialogPortalProps {
  /**
   * Force mounting when more control is needed
   */
  forceMount?: boolean;
  /**
   * Portal container
   */
  container?: HTMLElement;
  /**
   * Children elements
   */
  children: React.ReactNode;
}

export interface DialogOverlayProps extends React.ComponentPropsWithoutRef<"div"> {
  /**
   * Force mounting when more control is needed
   */
  forceMount?: boolean;
}

export interface DialogContentProps extends React.ComponentPropsWithoutRef<"div"> {
  /**
   * Force mounting when more control is needed
   */
  forceMount?: boolean;
  /**
   * Event handler called when focus moves into the component after opening
   */
  onOpenAutoFocus?: (event: Event) => void;
  /**
   * Event handler called when escape key is pressed
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /**
   * Event handler called when a pointer event occurs outside the component
   */
  onPointerDownOutside?: (event: PointerEvent) => void;
  /**
   * Event handler called when an interaction outside the component is detected
   */
  onInteractOutside?: (event: React.SyntheticEvent) => void;
  /**
   * Event handler called when focus moves outside the component
   */
  onFocusOutside?: (event: React.FocusEvent) => void;
  /**
   * Event handler called when focus moves to an element outside the component
   */
  onCloseAutoFocus?: (event: Event) => void;
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Dialog title component or text
   */
  title?: React.ReactNode;
  /**
   * Dialog description component or text
   */
  description?: React.ReactNode;
}

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface DialogTitleProps extends React.ComponentPropsWithoutRef<"h2"> {}

export interface DialogDescriptionProps extends React.ComponentPropsWithoutRef<"p"> {}

export interface DialogCloseProps {
  /**
   * Change the component to the HTML tag or custom component of the only child
   */
  asChild?: boolean;
  /**
   * Component children
   */
  children?: React.ReactNode;
  /**
   * Additional class name for styling
   */
  className?: string;
}

/**
 * Configuration for hover-based preloading
 */
export interface PreloadConfig {
  /**
   * Whether to enable hover-based preloading
   */
  enabled?: boolean;
  /**
   * Delay in milliseconds before preloading starts after hover
   */
  delay?: number;
  /**
   * Components to preload on hover
   */
  components?: string[];
}

/**
 * Lazy loaded Dialog components from @radix-ui/react-dialog
 * 
 * These components are loaded only when they are rendered, improving initial
 * bundle size and performance. They include Suspense boundaries for loading states
 * and Error boundaries for error handling.
 */
const {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose
} = createLazyComponentBatch({
  module: "@radix-ui/react-dialog",
  components: {
    Dialog: "Root",
    DialogTrigger: "Trigger",
    DialogPortal: "Portal",
    DialogOverlay: "Overlay",
    DialogContent: "Content",
    DialogTitle: "Title",
    DialogDescription: "Description",
    DialogClose: "Close"
  },
  defaultOptions: getOptimizedLazyOptions("@radix-ui/react-dialog", "", {
    withErrorBoundary: true,
    fallback: <div className="animate-pulse p-4 rounded-md bg-muted flex items-center justify-center h-40 w-80 mx-auto">
      <div className="text-muted-foreground">Loading dialog component...</div>
    </div>,
    errorFallback: (error) => (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <h3 className="text-red-800 font-semibold">Failed to load Dialog component</h3>
        <p className="text-red-600 text-sm">{error.message}</p>
        <p className="text-red-600 text-xs mt-1">Try refreshing the page</p>
      </div>
    ),
    preload: false // Default to not preload all components
  }),
  componentOptions: {
    // Define component-specific options
    
    // Preload the trigger as it's visible before dialog is opened
    DialogTrigger: {
      preload: true,
      withErrorBoundary: false, // Trigger doesn't need error boundary as it's just a button
      fallback: null // No need for fallback on trigger
    },
    
    // Preload the base Dialog component as it's needed for the trigger
    Dialog: {
      preload: true,
      withErrorBoundary: true
    },
    
    // Content needs special loading state since it's more visually important
    DialogContent: {
      fallback: <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="animate-pulse p-6 rounded-md bg-background flex items-center justify-center h-40 w-80 mx-auto">
          <div className="text-muted-foreground">Loading dialog content...</div>
        </div>
      </div>
    },
    
    // Portal doesn't need error boundaries as it's a simple utility component
    DialogPortal: {
      withErrorBoundary: false
    },
    
    // Overlay is a visual component that doesn't need extensive error handling
    DialogOverlay: {
      withErrorBoundary: false
    }
  }
});

/**
 * Enhanced Dialog Header component with styling
 * 
 * Provides a standardized header layout with title and description support.
 * Automatically preloads title and description components when rendered.
 */
export const DialogHeader = React.forwardRef<
  HTMLDivElement,
  DialogHeaderProps
>(({ className, title, description, children, ...props }, ref) => {
  // Preload other dialog components when header is rendered
  React.useEffect(() => {
    DialogTitle.preload();
    DialogDescription.preload();
  }, []);

  return (
    <div 
      ref={ref}
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left p-4", className)} 
      {...props}
    >
      {title && <DialogTitle>{title}</DialogTitle>}
      {description && <DialogDescription>{description}</DialogDescription>}
      {children}
    </div>
  );
});
DialogHeader.displayName = "DialogHeader";

/**
 * Enhanced Dialog Footer component with styling
 * 
 * Provides a standardized footer layout with responsive button alignment.
 */
export const DialogFooter = React.forwardRef<
  HTMLDivElement,
  DialogFooterProps
>(({ className, ...props }, ref) => {
  return (
    <div 
      ref={ref}
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-4 pt-0", className)}
      {...props}
    />
  );
});
DialogFooter.displayName = "DialogFooter";

/**
 * Enhanced DialogContent with standardized close button and styling
 * 
 * Provides a complete dialog content implementation with overlay, animations,
 * and a standardized close button. Automatically preloads the close button.
 */
export const DialogContentWithClose = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ children, className, ...props }, ref) => {
  // Preload the close button when content is rendered
  React.useEffect(() => {
    DialogClose.preload();
  }, []);

  return (
    <DialogPortal>
      <DialogOverlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  );
});
DialogContentWithClose.displayName = "DialogContentWithClose";

/**
 * Client-side only wrapper for Dialog components
 * 
 * Ensures Dialog components are only loaded in the browser, not during SSR.
 * Accepts a fallback component to show during SSR and initial hydration.
 */
export const ClientOnlyDialog: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Hook for implementing hover-based preloading
 * 
 * @param config - Configuration for hover-based preloading
 * @returns Props to spread onto the element that should trigger preloading on hover
 */
export function useHoverPreload(config: PreloadConfig = { enabled: true, delay: 100 }) {
  const { enabled = true, delay = 100, components = [] } = config;
  
  const preloadComponents = React.useCallback(() => {
    if (!enabled) return;
    
    const timer = setTimeout(() => {
      // Preload specified components
      if (components.includes('all')) {
        preloadDialogComponents();
      } else {
        if (components.includes('content') || components.length === 0) {
          DialogContent.preload();
        }
        if (components.includes('close') || components.length === 0) {
          DialogClose.preload();
        }
        if (components.includes('header') || components.length === 0) {
          DialogHeader.preload();
        }
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [enabled, delay, components]);
  
  return {
    onMouseEnter: preloadComponents,
    onFocus: preloadComponents,
    onTouchStart: preloadComponents
  };
}

/**
 * Priority-based preloading of dialog components
 * 
 * @param priority - Priority level for preloading ('high', 'medium', 'low')
 * @returns Promise that resolves when preloading is complete
 */
export function preloadDialogByPriority(priority: 'high' | 'medium' | 'low' = 'medium') {
  switch (priority) {
    case 'high':
      // Preload essential components immediately
      return Promise.all([
        Dialog.preload(),
        DialogTrigger.preload(),
        DialogContent.preload()
      ]);
    
    case 'medium':
      // Preload most commonly used components
      return Promise.all([
        Dialog.preload(),
        DialogTrigger.preload(),
        DialogContent.preload(),
        DialogHeader.preload(),
        DialogFooter.preload()
      ]);
    
    case 'low':
      // Preload all components
      return preloadDialogComponents();
    
    default:
      return Promise.resolve();
  }
}

/**
 * Preload all dialog components
 * 
 * Call this function to eagerly load all dialog components before they're needed.
 * Useful for improving performance on pages where dialogs will likely be used.
 * 
 * @returns Promise that resolves when

