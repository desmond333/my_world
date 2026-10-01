import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import './ToggleGroup.css'

export const ToggleGroup = forwardRef<
  ElementRef<typeof ToggleGroupPrimitive.Root>,
  ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className = '', ...props }, ref) => (
  <ToggleGroupPrimitive.Root ref={ref} className={`ui-toggle-group ${className}`.trim()} {...props} />
))
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

export const ToggleGroupItem = forwardRef<
  ElementRef<typeof ToggleGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className = '', ...props }, ref) => (
  <ToggleGroupPrimitive.Item ref={ref} className={`ui-toggle-group-item ${className}`.trim()} {...props} />
))
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName
