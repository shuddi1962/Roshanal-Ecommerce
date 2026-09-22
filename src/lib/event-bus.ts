/**
 * Event Bus — Cross-Feature Communication
 *
 * ARCHITECTURE RULE: Feature modules NEVER import from each other directly.
 * All cross-feature communication goes through this Event Bus.
 *
 * Usage:
 *   eventBus.emit('cart:item-added', { productId, quantity })
 *   eventBus.on('cart:item-added', handler)
 *   eventBus.off('cart:item-added', handler)
 */

type EventHandler<T = unknown> = (payload: T) => void | Promise<void>

class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map()

  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler as EventHandler)

    // Return unsubscribe function
    return () => this.off(event, handler)
  }

  off<T = unknown>(event: string, handler: EventHandler<T>): void {
    this.listeners.get(event)?.delete(handler as EventHandler)
  }

  emit<T = unknown>(event: string, payload?: T): void {
    const handlers = this.listeners.get(event)
    if (!handlers) return

    handlers.forEach((handler) => {
      try {
        handler(payload)
      } catch (err) {
        // Errors in event handlers must not crash the emitter
        console.error(`[EventBus] Error in handler for event "${event}":`, err)
      }
    })
  }

  async emitAsync<T = unknown>(event: string, payload?: T): Promise<void> {
    const handlers = this.listeners.get(event)
    if (!handlers) return

    await Promise.allSettled(
      [...handlers].map((handler) =>
        Promise.resolve(handler(payload)).catch((err) => {
          console.error(`[EventBus] Async error in handler for event "${event}":`, err)
        })
      )
    )
  }

  once<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    const wrapped: EventHandler<T> = (payload) => {
      handler(payload)
      this.off(event, wrapped)
    }
    return this.on(event, wrapped)
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}

// Singleton instance
export const eventBus = new EventBus()

// ─── Typed event registry ───────────────────────────────────────────────────

export type RoshanolEvents = {
  // Cart
  'cart:item-added': { productId: string; variantId?: string; quantity: number }
  'cart:item-removed': { productId: string; variantId?: string }
  'cart:cleared': Record<string, never>
  'cart:quantity-updated': { productId: string; variantId?: string; quantity: number }

  // Order
  'order:created': { orderId: string; total: number }
  'order:status-changed': { orderId: string; status: string }
  'order:paid': { orderId: string; reference: string; gateway: string }

  // Auth
  'auth:logged-in': { userId: string; role: string }
  'auth:logged-out': Record<string, never>

  // Wishlist
  'wishlist:item-added': { productId: string }
  'wishlist:item-removed': { productId: string }

  // Loyalty
  'loyalty:points-earned': { userId: string; points: number; reason: string }
  'loyalty:tier-changed': { userId: string; newTier: string }

  // Inventory
  'inventory:low-stock': { productId: string; branchId: string; quantity: number }
  'inventory:out-of-stock': { productId: string; branchId: string }
  'inventory:restocked': { productId: string; branchId: string; quantity: number }

  // Notifications
  'notification:push': { userId: string; title: string; message: string }

  // Feature flags
  'feature-flag:changed': { key: string; enabled: boolean }

  // AI agent
  'ai-agent:message-received': { sessionId: string; message: string; userId?: string }
  'ai-agent:action-triggered': { action: string; params: Record<string, unknown> }

  // Site doctor
  'site-doctor:check-complete': { checkType: string; status: 'ok' | 'warning' | 'error' }
  'site-doctor:auto-fix-applied': { checkType: string; fix: string }

  // Indexing
  'indexing:url-published': { url: string }
  'indexing:batch-submitted': { urls: string[] }
}

// Type-safe emit helper
export function emit<K extends keyof RoshanolEvents>(
  event: K,
  payload: RoshanolEvents[K]
): void {
  eventBus.emit(event, payload)
}

// Type-safe on helper
export function on<K extends keyof RoshanolEvents>(
  event: K,
  handler: (payload: RoshanolEvents[K]) => void | Promise<void>
): () => void {
  return eventBus.on(event, handler as EventHandler)
}
