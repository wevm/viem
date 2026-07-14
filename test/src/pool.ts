export async function resetPool(
  groups: readonly (readonly number[])[],
  slot: number,
) {
  const errors: unknown[] = []
  for (const ports of groups) {
    const results = await Promise.allSettled(
      ports.map((port) => destroy(port, slot)),
    )
    errors.push(
      ...results.flatMap((result) =>
        result.status === 'rejected' ? [result.reason] : [],
      ),
    )
  }
  if (errors.length)
    throw new AggregateError(errors, 'Failed to destroy core pool slots.')
}

async function destroy(port: number, slot: number) {
  const response = await fetch(`http://127.0.0.1:${port}/${slot}/destroy`, {
    headers: { Connection: 'close' },
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok)
    throw new Error(
      `Failed to destroy pool slot ${slot} on port ${port}: ${await response.text()}`,
    )
}
