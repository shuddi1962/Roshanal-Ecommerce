'use client'

/**
 * ComponentSlot — Safe Cross-Feature UI Injection
 * Features register components into slots; host pages render slots.
 * Features NEVER import from each other — they inject into slots.
 */

import React, { createContext, useContext, useState, useCallback } from 'react'

interface SlotRegistry {
  [slotName: string]: React.ComponentType[]
}

interface SlotContextValue {
  register: (slotName: string, component: React.ComponentType) => void
  unregister: (slotName: string, component: React.ComponentType) => void
  getSlotComponents: (slotName: string) => React.ComponentType[]
}

const SlotContext = createContext<SlotContextValue | null>(null)

export function SlotProvider({ children }: { children: React.ReactNode }) {
  const [registry, setRegistry] = useState<SlotRegistry>({})

  const register = useCallback((slotName: string, component: React.ComponentType) => {
    setRegistry((prev) => ({
      ...prev,
      [slotName]: [...(prev[slotName] ?? []), component],
    }))
  }, [])

  const unregister = useCallback((slotName: string, component: React.ComponentType) => {
    setRegistry((prev) => ({
      ...prev,
      [slotName]: (prev[slotName] ?? []).filter((c) => c !== component),
    }))
  }, [])

  const getSlotComponents = useCallback(
    (slotName: string) => registry[slotName] ?? [],
    [registry]
  )

  return (
    <SlotContext.Provider value={{ register, unregister, getSlotComponents }}>
      {children}
    </SlotContext.Provider>
  )
}

export function useSlot(): SlotContextValue {
  const ctx = useContext(SlotContext)
  if (!ctx) throw new Error('useSlot must be used inside SlotProvider')
  return ctx
}

interface ComponentSlotProps {
  name: string
  props?: Record<string, unknown>
  fallback?: React.ReactNode
}

/**
 * Render all components registered into a named slot.
 */
export function ComponentSlot({ name, props = {}, fallback = null }: ComponentSlotProps) {
  const { getSlotComponents } = useSlot()
  const components = getSlotComponents(name)

  if (!components.length) return <>{fallback}</>

  return (
    <>
      {components.map((Component, i) => (
        <Component key={`${name}-${i}`} {...props} />
      ))}
    </>
  )
}
