import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import './Tabs.css'

export const Tabs = TabsPrimitive.Root

export const TabsList = forwardRef<ElementRef<typeof TabsPrimitive.List>, ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
  ({ className = '', ...props }, ref) => <TabsPrimitive.List ref={ref} className={`ui-tabs-list ${className}`.trim()} {...props} />,
)
TabsList.displayName = TabsPrimitive.List.displayName

export const TabsTrigger = forwardRef<ElementRef<typeof TabsPrimitive.Trigger>, ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
  ({ className = '', ...props }, ref) => <TabsPrimitive.Trigger ref={ref} className={`ui-tabs-trigger ${className}`.trim()} {...props} />,
)
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

export const TabsContent = forwardRef<ElementRef<typeof TabsPrimitive.Content>, ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(
  ({ className = '', ...props }, ref) => <TabsPrimitive.Content ref={ref} className={`ui-tabs-content ${className}`.trim()} {...props} />,
)
TabsContent.displayName = TabsPrimitive.Content.displayName
