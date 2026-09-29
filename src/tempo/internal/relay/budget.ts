import { RpcResponse } from 'ox'
import { HttpRequestError } from '../../../errors/request.js'
import { buildRequest, shouldRetry } from '../../../utils/buildRequest.js'
import { withRetry } from '../../../utils/promise/withRetry.js'
import type * as Relay from '../../Relay.js'

type Budget = { remaining: number }
const budgets = new WeakMap<AbortSignal, readonly Budget[]>()
const handlers = new WeakSet<Relay.handleRequest.Handler>()

/** Marks relay boundaries so only downstream I/O consumes request budgets. */
export function wrap(
  handler: Relay.handleRequest.Handler,
  config: Relay.handleRequest.Options,
): Relay.handleRequest.Handler {
  const wrapped: Relay.handleRequest.Handler = (request, options = {}) =>
    request.method === 'eth_fillTransaction'
      ? run(handler, request, options, config)
      : handler(request, options)
  handlers.add(wrapped)
  return wrapped
}

/** Runs downstream I/O with retries charged to every enclosing fill. */
export function request(
  handler: Relay.handleRequest.Handler,
  request: Relay.handleRequest.Request,
  options: Relay.handleRequest.RequestOptions = {},
) {
  const budget = options.signal && budgets.get(options.signal)
  if (!budget || handlers.has(handler)) return handler(request, options)
  const exhausted = () => budget.some(({ remaining }) => remaining <= 0)
  const error = () =>
    new RpcResponse.LimitExceededError({
      message: 'Relay fill exceeded its RPC request budget.',
    })
  return buildRequest(
    () =>
      withRetry(
        () => {
          options.signal?.throwIfAborted()
          if (exhausted()) throw error()
          for (const entry of budget) entry.remaining--
          return handler(request, { ...options, retryCount: 0 })
        },
        {
          retryCount: options.retryCount ?? 0,
          signal: options.signal,
          delay: ({ count, error }) => {
            if (error instanceof HttpRequestError) {
              const retryAfter = error.headers?.get('Retry-After')
              if (retryAfter?.match(/\d/))
                return Number.parseInt(retryAfter, 10) * 1000
            }
            return ~~(1 << count) * (options.retryDelay ?? 150)
          },
          shouldRetry: ({ error: cause }) => {
            if (!shouldRetry(cause)) return false
            if (exhausted()) throw error()
            return true
          },
        },
      ),
    { retryCount: 0 },
  )(request, { ...options, retryCount: 0 })
}

/** Bounds the complete fill, including callbacks that do not observe abort signals. */
async function run(
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
  budgets.set(signal, [
    ...((options.signal && budgets.get(options.signal)) || []),
    { remaining: config.maxRequests ?? 4 },
  ])
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
