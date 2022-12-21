import type { MaybePromise } from '../types/utils'

type Callback<TData> = (data: TData) => any

const listenersCache = new Map<
  string,
  { id: number; fn: (data: any) => any }[]
>()
const cleanupCache = new Map<string, () => void>()

type EmitFunction<TData> = ({
  emit,
}: {
  emit: (data: TData) => void
}) => MaybePromise<void | (() => void)>

let callbackCount = 0

/**
 * @description Sets up an observer for a given function. If another function
 * is set up under the same observer id, the function will only be called once
 * for both instances of the observer.
 */
export function observe<
  TData,
  TCallback extends Callback<TData> = Callback<TData>,
>(observerId: string, callback: TCallback) {
  const callbackId = ++callbackCount

  const getListeners = () => listenersCache.get(observerId) || []

  const emit = (data: TData) => {
    const listeners = getListeners()
    if (listeners.length === 0) return
    listeners.forEach((listener) => listener.fn(data))
  }

  const unsubscribe = () => {
    const listeners = getListeners()
    listenersCache.set(
      observerId,
      listeners.filter((cb: any) => cb.id !== callbackId),
    )
  }

  return (fn: EmitFunction<TData>) => {
    const listeners = getListeners()
    listenersCache.set(observerId, [
      ...listeners,
      { id: callbackId, fn: callback },
    ])

    const unwatch = () => {
      const cleanup = cleanupCache.get(observerId)
      if (getListeners().length === 1 && cleanup) cleanup()
      unsubscribe()
    }

    if (listeners && listeners.length > 0) return unwatch

    const cleanup = fn({ emit })
    if (typeof cleanup === 'function') cleanupCache.set(observerId, cleanup)

    return unwatch
  }
}
