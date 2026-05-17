const concurrentCounts = new Map<string, number>()

/**
 * Detects if there are concurrent tasks occuring for a given key
 * within the same event loop tick. Registers the request, yields to allow
 * other concurrent calls to register, then returns whether multiple requests
 * were detected.
 *
 * @example
 * ```ts
 * const isConcurrent = await Concurrent.detect(address)
 * ```
 */
export async function detect(key: string): Promise<boolean> {
  concurrentCounts.set(key, (concurrentCounts.get(key) ?? 0) + 1)
  await Promise.resolve()
  const isConcurrent = (concurrentCounts.get(key) ?? 0) > 1
  queueMicrotask(() => {
    const count = concurrentCounts.get(key) ?? 0
    if (count <= 1) concurrentCounts.delete(key)
    else concurrentCounts.set(key, count - 1)
  })
  return isConcurrent
}
