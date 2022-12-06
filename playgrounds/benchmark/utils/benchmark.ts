export async function benchmark(fn: () => Promise<void>, { runs = 100 } = {}) {
  const start = performance.now()
  for (let i = 0; i < runs; i++) {
    await fn()
  }
  const end = performance.now()
  return end - start
}
