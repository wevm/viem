const concurrentCounts = new Map<string, number>()

/**
 * Detects concurrent tasks for a key within the same event-loop tick.
 * Registers the request, yields so other concurrent calls can register, then
 * reports whether multiple requests were seen.
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
