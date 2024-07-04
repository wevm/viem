import { LruMap } from '../lru.js'

/** @internal */
export const promiseCache = /*#__PURE__*/ new LruMap<Promise<any>>(8192)

type WithDedupeOptions = {
  enabled?: boolean | undefined
  id?: string | undefined
}

/** Deduplicates in-flight promises. */
export function withDedupe<data>(
  fn: () => Promise<data>,
  { enabled = true, id }: WithDedupeOptions,
): Promise<data> {
  if (!enabled || !id) return fn()
  if (promiseCache.get(id)) return promiseCache.get(id)!
  const promise = fn().finally(() => promiseCache.delete(id))
  promiseCache.set(id, promise)
  return promise
}
