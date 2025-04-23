import React from 'react'
import { createLazyComponent } from '../lazy-component'

// Lazy load Select components
export const Select = createLazyComponent(
  () => import('@radix-ui/react-select').then(mod => ({ default: mod.Root })),
  undefined,
  'Select'
)

export const SelectTrigger = createLazyComponent(
  () => import('@radix-ui/react-select').then(mod => ({ default: mod.Trigger })),
  undefined,
  'SelectTrigger'
)

export const SelectValue = createLazyComponent(
  () => import('@radix-ui/react-select').then(mod => ({ default: mod.Value })),
  undefined,
  'SelectValue'
)

export const SelectContent = createLazyComponent(
  () => import('@radix-ui/react-select').then(mod => ({ default: mod.Content })),
  undefined,
  'SelectContent'
)

export const SelectViewport = createLazyComponent(
  () => import('@radix-ui/react-select').then(mod => ({ default: mod.Viewport })),
  undefined,
  'SelectViewport'
)

export const SelectGroup = createLazyComponent(
  () => import('@radix-ui/react-select').then(mod => ({ default: mod.Group })),
  undefined,
  'SelectGroup'
)

export const SelectItem = createLazyComponent(
  () => import('@radix-ui/react-select').then(mod => ({ default: mod.Item })),
  undefined,
  'SelectItem'
)

export const SelectItemText = createLazyComponent(
  () => import('@radix-ui/react-select').then(mod => ({ default: mod.ItemText })),
  undefined,
  'SelectItemText'
)

export const SelectItemIndicator = createLazyComponent(
  () => import('@radix-ui/react-select').then(mod => ({ default: mod.ItemIndicator })),
  undefined,
  'SelectItemIndicator'
)

export const SelectLabel = createLazyComponent(
  () => import('@radix-ui/react-select').then(mod => ({ default: mod.Label })),
  undefined,
  'SelectLabel'
)

