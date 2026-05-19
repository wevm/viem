import type { MaybePromise } from './types.js'

type Callback = ((...parameters: any[]) => any) | undefined
type Callbacks = Record<string, Callback>

export const listenersCache = new Map<
  string,
  { id: number; fns: Callbacks }[]
>()

export const cleanupCache = new Map<string, () => void | Promise<void>>()

let callbackCount = 0

export function observe<callbacks extends Callbacks>(
  observerId: string,
  callbacks: callbacks,
  fn: observe.Function<callbacks>,
): observe.ReturnType {
  const callbackId = ++callbackCount

  const getListeners = () => listenersCache.get(observerId) ?? []

  const unsubscribe = () => {
    const listeners = getListeners()
    listenersCache.set(
      observerId,
      listeners.filter((callback) => callback.id !== callbackId),
    )
  }

  const unwatch = () => {
    const listeners = getListeners()
    if (!listeners.some((callback) => callback.id === callbackId)) return
    const cleanup = cleanupCache.get(observerId)
    if (listeners.length === 1 && cleanup) {
      const promise = cleanup()
      if (promise instanceof Promise) promise.catch(() => {})
    }
    unsubscribe()
  }

  const listeners = getListeners()
  listenersCache.set(observerId, [
    ...listeners,
    { id: callbackId, fns: callbacks },
  ])

  if (listeners.length > 0) return unwatch

  const emit: callbacks = {} as callbacks
  for (const key in callbacks) {
    emit[key] = ((
      ...parameters: Parameters<NonNullable<callbacks[keyof callbacks]>>
    ) => {
      const listeners = getListeners()
      if (listeners.length === 0) return
      for (const listener of listeners) listener.fns[key]?.(...parameters)
    }) as callbacks[Extract<keyof callbacks, string>]
  }

  const cleanup = fn(emit)
  if (typeof cleanup === 'function') cleanupCache.set(observerId, cleanup)

  return unwatch
}

export declare namespace observe {
  type Function<callbacks extends Callbacks> = (
    emit: callbacks,
  ) => MaybePromise<void | (() => void) | (() => Promise<void>)>

  type ReturnType = () => void
}
