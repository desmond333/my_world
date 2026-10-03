import { createContext, forwardRef, useContext, useId, useState, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { motion } from 'motion/react'
import { EASE } from '../../../lib/motion'
import './Tabs.css'

const TabsValueContext = createContext<string | undefined>(undefined)
const TabsListContext = createContext<string | undefined>(undefined)

export const Tabs = ({ value, defaultValue, onValueChange, children, ...props }: ComponentPropsWithoutRef<typeof TabsPrimitive.Root>) => {
  const [inner, setInner] = useState(defaultValue)
  const current = value ?? inner

  const handleChange = (next: string) => {
    setInner(next)
    onValueChange?.(next)
  }

  return (
    <TabsValueContext.Provider value={current}>
      <TabsPrimitive.Root value={value} defaultValue={defaultValue} onValueChange={handleChange} {...props}>
        {children}
      </TabsPrimitive.Root>
    </TabsValueContext.Provider>
  )
}

export const TabsList = forwardRef<ElementRef<typeof TabsPrimitive.List>, ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
  ({ className = '', children, ...props }, ref) => {
    const layoutId = useId()

    return (
      <TabsListContext.Provider value={layoutId}>
        <TabsPrimitive.List ref={ref} className={`ui-tabs-list ${className}`.trim()} {...props}>
          {children}
        </TabsPrimitive.List>
      </TabsListContext.Provider>
    )
  },
)
TabsList.displayName = TabsPrimitive.List.displayName

export const TabsTrigger = forwardRef<ElementRef<typeof TabsPrimitive.Trigger>, ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
  ({ className = '', value, children, ...props }, ref) => {
    const current = useContext(TabsValueContext)
    const layoutId = useContext(TabsListContext)
    const active = current !== undefined && current === value

    return (
      <TabsPrimitive.Trigger ref={ref} value={value} className={`ui-tabs-trigger ${className}`.trim()} {...props}>
        {active && layoutId && (
          <motion.span
            layoutId={`tab-indicator-${layoutId}`}
            className="ui-tabs-indicator"
            transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7, ease: EASE.out }}
          />
        )}
        <span className="ui-tabs-trigger-content">{children}</span>
      </TabsPrimitive.Trigger>
    )
  },
)
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

export const TabsContent = forwardRef<ElementRef<typeof TabsPrimitive.Content>, ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(
  ({ className = '', ...props }, ref) => <TabsPrimitive.Content ref={ref} className={`ui-tabs-content ${className}`.trim()} {...props} />,
)
TabsContent.displayName = TabsPrimitive.Content.displayName
