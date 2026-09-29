import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import './Slider.css'

export type SliderProps = ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  ariaLabel?: string
}

export const Slider = forwardRef<ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, ariaLabel = 'Slider', ...props }, ref) => (
    <SliderPrimitive.Root ref={ref} className={`ui-slider-root ${className ?? ''}`.trim()} {...props}>
      <SliderPrimitive.Track className="ui-slider-track">
        <SliderPrimitive.Range className="ui-slider-range" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="ui-slider-thumb" aria-label={ariaLabel} />
    </SliderPrimitive.Root>
  ),
)
Slider.displayName = SliderPrimitive.Root.displayName
