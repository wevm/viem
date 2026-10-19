import { withTimeout } from '../../../utils/promise/withTimeout.js'
import type * as Store_ from '../../Store.js'

export type Store = Store_.Store

// Scope in-flight work to one request so Workers never share request-owned I/O.
const flights = new WeakMap<Store, Map<string, Promise<unknown>>>()
const prefix = 'viem:relay:cache:'

export function scoped(store: Store | undefined): Store | undefined {
  if (!store) return undefined
  return {
    getItem: (key) => store.getItem(key),
    setItem: (key, value) => store.setItem(key, value),
    removeItem: (key) => store.removeItem(key),
  }
}

export async function memoize<value>(
  fetch: () => Promise<value>,
  options: { key: string; store: Store; ttl: number },
): Promise<value> {
  const { store, ttl } = options
  const key = `${prefix}${options.key}`
  let active = true
  const timeoutError = new Error('Relay cache operation timed out.')
  return withTimeout(
    async () => {
      const raw = await store.getItem(key)
      if (!active) throw timeoutError
      if (raw) {
        try {
          const entry = JSON.parse(raw, (_key, item) => {
            if (typeof item !== 'string' || !item.startsWith(prefix))
              return item
            if (item.startsWith(`${prefix}string:`))
              return item.slice(`${prefix}string:`.length)
            if (item.startsWith(`${prefix}bigint:`))
              return BigInt(item.slice(`${prefix}bigint:`.length))
            throw new TypeError('Invalid relay cache value.')
          }) as { value: value; expiresAt: number }
          if (entry.expiresAt > Date.now()) return entry.value
        } catch {
          // Refresh malformed or older entries.
        }
      }
      let pending = flights.get(store)
      if (!pending) {
        pending = new Map()
        flights.set(store, pending)
      }
      const existing = pending.get(key)
      if (existing) return existing as Promise<value>
      const result = (async () => {
        const value = await fetch()
        if (!active) throw timeoutError
        if (value !== undefined)
          await store.setItem(
            key,
            JSON.stringify(
              { value, expiresAt: Date.now() + ttl },
              (_key, item) => {
                if (typeof item === 'bigint') return `${prefix}bigint:${item}`
                if (typeof item === 'string' && item.startsWith(prefix))
                  return `${prefix}string:${item}`
                return item
              },
            ),
          )
        return value
      })().finally(() => pending.delete(key))
      pending.set(key, result)
      return result
    },
    {
      timeout: 30_000,
      errorInstance: timeoutError,
    },
  ).finally(() => {
    active = false
  })
}
