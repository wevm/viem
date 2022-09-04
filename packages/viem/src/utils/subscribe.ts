const listenersCache = new Map<
  string,
  { id: number; fn: (data: any) => any }[]
>()
const cleanupCache = new Map<string, () => void>()

type EmitFunction<TData> = ({
  emit,
}: {
  emit: (data: TData) => void
}) => () => void

let callbackCount = 0

export function subscribe<TCallback extends (data: TData) => any, TData>(
  id: string,
  callback: TCallback,
) {
  const callbackId = ++callbackCount

  const getListeners = () => listenersCache.get(id) || []

  const emit = (data: TData) => {
    const listeners = getListeners()
    if (listeners.length === 0) return
    listeners.forEach((listener) => listener.fn(data))
  }

  const unsubscribe = () => {
    const listeners = getListeners()
    listenersCache.set(
      id,
      listeners.filter((cb: any) => cb.id !== callbackId),
    )
  }

  return (fn: EmitFunction<TData>) => {
    const listeners = getListeners()
    listenersCache.set(id, [...listeners, { id: callbackId, fn: callback }])

    const unwatch = () => {
      const cleanup = cleanupCache.get(id)
      if (getListeners().length === 1 && cleanup) cleanup()
      unsubscribe()
    }

    if (listeners && listeners.length > 0) return unwatch

    cleanupCache.set(id, fn({ emit }))
    return unwatch
  }
}
