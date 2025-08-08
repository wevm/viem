import type { ErrorType } from '../errors/utils.js'
import type { MaybePromise } from '../types/utils.js'

type Callback = ((...args: any[]) => any) | undefined
type Callbacks = Record<string, Callback>

export type ObserveErrorType = ErrorType

/** @internal */
export const listenersCache = /*#__PURE__*/ new Map<
  string,
  { id: number; fns: Callbacks }[]
>()
/** @internal */
export const cleanupCache = /*#__PURE__*/ new Map<
  string,
  () => void | Promise<void>
>()

type EmitFunction<callbacks extends Callbacks> = (
  emit: callbacks,
) => MaybePromise<void | (() => void) | (() => Promise<void>)>

let callbackCount = 0

/**
 * @description Sets up an observer for a given function. If another function
 * is set up under the same observer id, the function will only be called once
 * for both instances of the observer.
 */
export function observe<callbacks extends Callbacks>(
  observerId: string,
  callbacks: callbacks,
  fn: EmitFunction<callbacks>,
) {
  const callbackId = ++callbackCount

  const getListeners = () => listenersCache.get(observerId) || []

  const unsubscribe = () => {
    const listeners = getListeners()
    listenersCache.set(
      observerId,
      listeners.filter((cb: any) => cb.id !== callbackId),
    )
  }

  const unwatch = () => {
    const listeners = getListeners()
    if (!listeners.some((cb: any) => cb.id === callbackId)) return
    const cleanup = cleanupCache.get(observerId)
    if (listeners.length === 1 && cleanup) {
      const p = cleanup()
      if (p instanceof Promise) p.catch(() => {})
    }
    unsubscribe()
  }

  const listeners = getListeners()
  listenersCache.set(observerId, [
    ...listeners,
    { id: callbackId, fns: callbacks },
  ])

  if (listeners && listeners.length > 0) return unwatch

  const emit: callbacks = {} as callbacks
  for (const key in callbacks) {
    emit[key] = ((
      ...args: Parameters<NonNullable<callbacks[keyof callbacks]>>
    ) => {
      const listeners = getListeners()
      if (listeners.length === 0) return
      for (const listener of listeners) listener.fns[key]?.(...args)
    }) as callbacks[Extract<keyof callbacks, string>]
  }

  const cleanup = fn(emit)
  if (typeof cleanup === 'function') cleanupCache.set(observerId, cleanup)

  return unwatch
}
