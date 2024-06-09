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
export const cleanupCache = /*#__PURE__*/ new Map<string, () => void>()

type EmitFunction<TCallbacks extends Callbacks> = (
  emit: TCallbacks,
) => MaybePromise<void | (() => void)>

let callbackCount = 0

/**
 * @description Sets up an observer for a given function. If another function
 * is set up under the same observer id, the function will only be called once
 * for both instances of the observer.
 */
export function observe<TCallbacks extends Callbacks>(
  observerId: string,
  callbacks: TCallbacks,
  fn: EmitFunction<TCallbacks>,
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
    const cleanup = cleanupCache.get(observerId)
    if (getListeners().length === 1 && cleanup) cleanup()
    unsubscribe()
  }

  const listeners = getListeners()
  listenersCache.set(observerId, [
    ...listeners,
    { id: callbackId, fns: callbacks },
  ])

  if (listeners && listeners.length > 0) return unwatch

  const emit: TCallbacks = {} as TCallbacks
  for (const key in callbacks) {
    emit[key] = ((
      ...args: Parameters<NonNullable<TCallbacks[keyof TCallbacks]>>
    ) => {
      const listeners = getListeners()
      if (listeners.length === 0) return
      for (const listener of listeners) listener.fns[key]?.(...args)
    }) as TCallbacks[Extract<keyof TCallbacks, string>]
  }

  const cleanup = fn(emit)
  if (typeof cleanup === 'function') cleanupCache.set(observerId, cleanup)

  return unwatch
}
