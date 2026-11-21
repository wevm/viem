import * as Gateway from '../Gateway.js'

/**
 * Reads a Gateway NDJSON stream, one event per line. An `error` event throws a
 * {@link Gateway.RequestError}. Stopping early cancels the response body, so
 * the Gateway stops the upstream work.
 */
export async function* read<event extends { type: string }>(
  response: Response,
): AsyncGenerator<event> {
  if (!response.body) return

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let done = false

  try {
    for (;;) {
      const result = await reader.read()
      done = result.done
      const value = result.value
      buffer += decoder.decode(value, { stream: !done })

      const lines = buffer.split('\n')
      buffer = done ? '' : (lines.pop() ?? '')

      for (const line of lines) {
        if (!line.trim()) continue

        const event = JSON.parse(line) as event & {
          code?: string
          detail?: string
        }
        if (event.type === 'error')
          throw new Gateway.RequestError({
            code: event.code ?? 'upstream_failed',
            detail: event.detail ?? '',
            status: 502,
            url: response.url,
          })
        yield event
      }

      if (done) return
    }
  } finally {
    if (!done) await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}
