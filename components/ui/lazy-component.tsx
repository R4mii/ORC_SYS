import * as React from "react"
import { lazy, Suspense, ComponentType, forwardRef } from "react"
import { Loading } from "./loading"
import { ErrorBoundary } from "./error-boundary"

// Track preloaded modules to avoid duplicate preloading
const preloadedModules = new Set<string>()

/**
 * Options for creating a lazy-loaded component
 */
export interface LazyComponentOptions<T = any> {
  /**
   * Custom loading component to show while the component is loading
   */
  fallback?: React.ReactNode
  
  /**
   * Component display name for debugging
   */
  displayName?: string
  
  /**
   * Whether to wrap the component in an error boundary
   */
  withErrorBoundary?: boolean
  
  /**
   * Custom error fallback UI or render function
   */
  errorFallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode)
  
  /**
   * Error callback function
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  
  /**
   * Whether to preload the component immediately
   */
  preload?: boolean
  
  /**
   * Chunk name for webpack
   */
  chunkName?: string
  
  /**
   * Component-specific props transformer
   */
  propsTransformer?: (props: React.ComponentProps<ComponentType<T>>) => React.ComponentProps<ComponentType<T>>
}

/**
 * Type for a component that can be lazy-loaded
 */
export type LazyComponentType<T = any> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<T> & React.RefAttributes<unknown>
> & {
  /**
   * Preload the component manually
   */
  preload: () => Promise<void>
  
  /**
   * Original import function
   */
  importFn: () => Promise<{ default: ComponentType<any> }>
}

/**
 * Create a lazy-loaded component with Suspense and ErrorBoundary integration
 * 
 * @param importFn - Dynamic import function that returns the component
 * @param options - Options for lazy loading behavior
 * @returns A lazy-loaded component with preload capability
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions<React.ComponentProps<T>> = {}
): LazyComponentType<React.ComponentProps<T>> {
  const {
    fallback = <Loading />,
    displayName,
    withErrorBoundary = true,
    errorFallback,
    onError,
    preload = false,
    chunkName,
    propsTransformer = (props) => props as any
  } = options
  
  // Generate a unique ID for this component for preloading tracking
  const componentId = displayName || chunkName || Math.random().toString(36).substring(2, 9)
  
  // Create the lazy component
  const LazyComponent = lazy(importFn)
  
  // Create a preload function that triggers the import
  const preloadFn = async (): Promise<void> => {
    // Skip if already preloaded
    if (preloadedModules.has(componentId)) return
    
    try {
      await importFn()
      preloadedModules.add(componentId)
    } catch (err) {
      console.error(`Failed to preload component ${componentId}:`, err)
      // Don't add to preloaded set if it failed, so it can try again
    }
  }
  
  // If preload is true, start loading the component immediately
  if (preload && !preloadedModules.has(componentId)) {
    // Use requestIdleCallback if available, otherwise use setTimeout
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => preloadFn())
    } else {
      setTimeout(preloadFn, 0)
    }
  }
  
  // Create a wrapped component with ref forwarding
  const WrappedComponent = forwardRef<unknown, React.ComponentProps<T>>((props, ref) => {
    // Transform props if a transformer is provided
    const transformedProps = propsTransformer(props)
    
    // Create the Suspense-wrapped component
    const suspenseContent = (
      <Suspense fallback={fallback}>
        <LazyComponent {...transformedProps} ref={ref} />
      </Suspense>
    )
    
    // Optionally wrap in an error boundary
    if (withErrorBoundary) {
      return (
        <ErrorBoundary 
          fallback={errorFallback}
          onError={onError}
        >
          {suspenseContent}
        </ErrorBoundary>
      )
    }
    
    return suspenseContent
  })
  
  // Set component display name
  if (displayName) {
    WrappedComponent.displayName = displayName
  }
  
  // Attach the preload function and import function to the component
  const component = WrappedComponent as LazyComponentType<React.ComponentProps<T>>
  component.preload = preloadFn
  component.importFn = importFn
  
  return component
}

/**
 * Configuration for batch component creation
 */
export interface BatchComponentsConfig {
  /**
   * Module path to import components from
   */
  module: string
  
  /**
   * Map of component names to their export names
   */
  components: Record<string, string>
  
  /**
   * Default options for all components
   */
  defaultOptions?: LazyComponentOptions
  
  /**
   * Component-specific options
   */
  componentOptions?: Record<string, LazyComponentOptions>
}

/**
 * Create multiple lazy-loaded components from a single module
 * 
 * @param config - Configuration for batch component creation
 * @returns Record of lazy-loaded components
 */
export function createLazyComponentBatch<T extends Record<string, string>>(
  config: BatchComponentsConfig
): Record<keyof T, LazyComponentType> {
  const { module, components, defaultOptions = {}, componentOptions = {} } = config
  
  const result: Record<string, LazyComponentType> = {}
  
  // Create a unique identifier for the entire batch
  const batchId = `batch-${Math.random().toString(36).substring(2, 9)}`
  
  // Create a shared preload function for the whole module
  const preloadModule = async (): Promise<void> => {
    if (preloadedModules.has(batchId)) return
    
    try {
      await import(/* webpackChunkName: "[request]" */ `${module}`)
      preloadedModules.add(batchId)
    } catch (err) {
      console.error(`Failed to preload module ${module}:`, err)
    }
  }
  
  // Preload the entire module if any component has preload=true
  const shouldPreloadModule = Object.entries(components).some(([name]) => {
    const compOptions = { ...defaultOptions, ...componentOptions[name] }
    return compOptions.preload === true
  })
  
  if (shouldPreloadModule) {
    // Use requestIdleCallback if available, otherwise use setTimeout
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => preloadModule())
    } else {
      setTimeout(preloadModule, 0)
    }
  }
  
  // Create each component
  Object.entries(components).forEach(([componentName, exportName]) => {
    // Merge default options with component-specific options
    const options = {
      ...defaultOptions,
      ...componentOptions[componentName],
      displayName: componentOptions[componentName]?.displayName || componentName,
      ch

