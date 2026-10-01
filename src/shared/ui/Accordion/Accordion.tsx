import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import './Accordion.css'

export const Accordion = AccordionPrimitive.Root

export const AccordionItem = forwardRef<
  ElementRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className = '', ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={`ui-accordion-item ${className}`.trim()} {...props} />
))
AccordionItem.displayName = AccordionPrimitive.Item.displayName

export const AccordionTrigger = forwardRef<
  ElementRef<typeof AccordionPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className = '', children, ...props }, ref) => (
  <AccordionPrimitive.Header className="ui-accordion-header">
    <AccordionPrimitive.Trigger ref={ref} className={`ui-accordion-trigger ${className}`.trim()} {...props}>
      <span>{children}</span>
      <ChevronDown size={16} className="ui-accordion-icon" aria-hidden="true" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

export const AccordionContent = forwardRef<
  ElementRef<typeof AccordionPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className = '', children, ...props }, ref) => (
  <AccordionPrimitive.Content ref={ref} className={`ui-accordion-content ${className}`.trim()} {...props}>
    <div className="ui-accordion-content-inner">{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName
