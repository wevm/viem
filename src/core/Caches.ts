import { LruMap } from './internal/lru.js'
import type { SchedulerItem } from './internal/promise.js'

const caches = {
  dedupe: /*#__PURE__*/ new LruMap<Promise<any>>(8192),
  scheduler: /*#__PURE__*/ new Map<number | string, SchedulerItem[]>(),
}

export const dedupe = caches.dedupe
export const scheduler = caches.scheduler

/**
 * Clears all global caches.
 *
 * @example
 * ```ts
 * import { Caches } from 'ox'
 * Caches.clear()
 * ```
 */
export function clear() {
  for (const cache of Object.values(caches)) cache.clear()
}
