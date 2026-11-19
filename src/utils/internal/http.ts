import { ResponseBodyTooLargeError } from '../../errors/request.js'

/**
 * Returns a signal that aborts as soon as any of `signals` aborts, and a
 * `cleanup` function that detaches the listeners added to `signals`.
 */
export function anySignal(
  signals: readonly (AbortSignal | null | undefined)[],
) {
  const signals_ = signals.filter((signal) => !!signal)
  if (signals_.length < 2)
    return { signal: signals_[0] ?? null, cleanup: () => {} }

  const controller = new AbortController()
  const onAbort = () => {
    cleanup()
    controller.abort(signals_.find((signal) => signal.aborted)?.reason)
  }
  const cleanup = () => {
    for (const signal of signals_) signal.removeEventListener('abort', onAbort)
  }

  for (const signal of signals_) {
    if (signal.aborted) {
      cleanup()
      controller.abort(signal.reason)
      break
    }
    signal.addEventListener('abort', onAbort)
  }

  return { signal: controller.signal, cleanup }
}

/**
 * Reads a response body as text, throwing once it exceeds
 * `maxResponseBodySize` bytes (`false` reads it whole).
 */
export async function readResponseBody(
  response: Response,
  { maxResponseBodySize }: { maxResponseBodySize: number | false },
): Promise<string> {
  if (maxResponseBodySize === false) return response.text()

  const contentLength = response.headers.get('Content-Length')
  if (contentLength) {
    const size = Number(contentLength)
    if (size > maxResponseBodySize) {
      await response.body?.cancel()
      throw new ResponseBodyTooLargeError({
        maxSize: maxResponseBodySize,
        size,
      })
    }
  }

  if (!response.body) {
    const body = await response.text()
    const size = new TextEncoder().encode(body).length
    if (size > maxResponseBodySize)
      throw new ResponseBodyTooLargeError({
        maxSize: maxResponseBodySize,
        size,
      })
    return body
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let body = ''
  let size = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxResponseBodySize) {
        await reader.cancel()
        throw new ResponseBodyTooLargeError({
          maxSize: maxResponseBodySize,
          size,
        })
      }
      body += decoder.decode(value, { stream: true })
    }
    body += decoder.decode()
    return body
  } finally {
    reader.releaseLock()
  }
}
