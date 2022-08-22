const listenersCache = new Map<string, ((data: any) => any)[]>()

type EmitFunction<TData> = ({
  emit,
}: {
  emit: (data: TData) => void
}) => () => void

export function subscribe<TCallback extends (data: TData) => any, TData>(
  id: string,
  callback: TCallback,
) {
  const getListeners = () => listenersCache.get(id) || []

  const emit = (data: TData) => {
    const listeners = getListeners()
    if (listeners.length === 0) return
    listeners.forEach((callback) => callback(data))
  }

  const unsubscribe = () => {
    const listeners = getListeners()
    listenersCache.set(
      id,
      listeners.filter((cb: any) => cb !== callback),
    )
  }

  return (fn: EmitFunction<TData>) => {
    const listeners = getListeners()
    listenersCache.set(id, [...listeners, callback])

    if (listeners && listeners.length > 0) return () => unsubscribe()

    const cleanup = fn({ emit })
    return () => {
      cleanup()
      unsubscribe()
    }
  }
}
