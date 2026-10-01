import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import './ScrollArea.css'

export const ScrollBar = forwardRef<
  ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className = '', orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={`ui-scrollbar ${orientation} ${className}`.trim()}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="ui-scrollbar-thumb" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export const ScrollArea = forwardRef<
  ElementRef<typeof ScrollAreaPrimitive.Root>,
  ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className = '', children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={`ui-scroll-area ${className}`.trim()} {...props}>
    <ScrollAreaPrimitive.Viewport className="ui-scroll-area-viewport">{children}</ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner className="ui-scroll-area-corner" />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName
