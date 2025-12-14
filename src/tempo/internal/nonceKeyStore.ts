import type { Address } from 'abitype'
import * as Hex from 'ox/Hex'

export type Parameters = { address: Address; chainId: number }

export type Store = Map<string, { counter: number; resetScheduled: boolean }>

export const store = /*#__PURE__*/ create()

export function create(): Store {
  return new Map()
}

export function getCacheKey(parameters: Parameters) {
  return `${parameters.address.toLowerCase()}-${parameters.chainId}`
}

export function getEntry(store: Store, parameters: Parameters) {
  const key = getCacheKey(parameters)
  let entry = store.get(key)
  if (!entry) {
    entry = { counter: 0, resetScheduled: false }
    store.set(key, entry)
  }
  return entry
}

export function reset(store: Store, parameters: Parameters) {
  const entry = getEntry(store, parameters)
  entry.counter = 0
  entry.resetScheduled = false
}

export function getNonceKey(store: Store, parameters: Parameters) {
  const entry = getEntry(store, parameters)
  if (!entry.resetScheduled) {
    entry.resetScheduled = true
    queueMicrotask(() => reset(store, parameters))
  }
  const count = entry.counter
  entry.counter++
  if (count === 0) return 0n
  return Hex.toBigInt(Hex.random(6))
}
