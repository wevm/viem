import { RpcResponse } from 'ox'
import type * as Relay from '../../Relay.js'

/** Bounds the complete fill, including callbacks that do not observe abort signals. */
export async function run(
  handler: Relay.handleRequest.Handler,
  request: Relay.handleRequest.Request,
  options: Relay.handleRequest.RequestOptions,
  config: Relay.handleRequest.Options,
) {
  const controller = new AbortController()
  const abort = () => controller.abort(options.signal?.reason)
  options.signal?.addEventListener('abort', abort, { once: true })
  if (options.signal?.aborted) abort()
  const timeout = setTimeout(
    () =>
      controller.abort(
        new RpcResponse.LimitExceededError({
          message: 'Relay fill exceeded its deadline.',
        }),
      ),
    config.timeout ?? 10_000,
  )
  const signal = controller.signal

  let rejectAbort!: (reason: unknown) => void
  const aborted = new Promise<never>((_, reject) => {
    rejectAbort = reject
  })
  const onAbort = () => rejectAbort(signal.reason)
  signal.addEventListener('abort', onAbort, { once: true })
  try {
    signal.throwIfAborted()
    return await Promise.race([
      handler(request, { ...options, signal }),
      aborted,
    ])
  } finally {
    clearTimeout(timeout)
    options.signal?.removeEventListener('abort', abort)
    signal.removeEventListener('abort', onAbort)
    // Prevent timed-out hooks from dispatching additional I/O after the response completes.
    controller.abort()
  }
}
