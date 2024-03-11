import {
  TransactionRejectedRpcError,
  UserRejectedRequestError,
} from '../../errors/rpc.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import { wait } from '../../utils/wait.js'

import {
  type CreateTransportErrorType,
  type Transport,
  type TransportConfig,
  createTransport,
} from './createTransport.js'
// TODO: Narrow `method` & `params` types.
export type OnResponseFn = (
  args: {
    method: string
    params: unknown[]
    transport: ReturnType<Transport>
  } & (
    | {
        error?: never
        response: unknown
        status: 'success'
      }
    | {
        error: Error
        response?: never
        status: 'error'
      }
  ),
) => void

type RankOptions = {
  /**
   * The polling interval (in ms) at which the ranker should ping the RPC URL.
   * @default client.pollingInterval
   */
  interval?: number
  /**
   * The number of previous samples to perform ranking on.
   * @default 10
   */
  sampleCount?: number
  /**
   * Timeout when sampling transports.
   * @default 1_000
   */
  timeout?: number
  /**
   * Weights to apply to the scores. Weight values are proportional.
   */
  weights?: {
    /**
     * The weight to apply to the latency score.
     * @default 0.3
     */
    latency?: number
    /**
     * The weight to apply to the stability score.
     * @default 0.7
     */
    stability?: number
  }
}

export type FallbackTransportConfig = {
  /** The key of the Fallback transport. */
  key?: TransportConfig['key']
  /** The name of the Fallback transport. */
  name?: TransportConfig['name']
  /** Toggle to enable ranking, or rank options. */
  rank?: boolean | RankOptions
  /** The max number of times to retry. */
  retryCount?: TransportConfig['retryCount']
  /** The base delay (in ms) between retries. */
  retryDelay?: TransportConfig['retryDelay']
}

export type FallbackTransport = Transport<
  'fallback',
  {
    onResponse: (fn: OnResponseFn) => void
    transports: ReturnType<Transport>[]
  }
>

export type FallbackTransportErrorType = CreateTransportErrorType | ErrorType

export function fallback(
  transports_: Transport[],
  config: FallbackTransportConfig = {},
): FallbackTransport {
  const {
    key = 'fallback',
    name = 'Fallback',
    rank = false,
    retryCount,
    retryDelay,
  } = config
  return ({ chain, pollingInterval = 4_000, timeout, ...rest }) => {
    let transports = transports_

    let onResponse: OnResponseFn = () => {}

    const transport = createTransport(
      {
        key,
        name,
        async request({ method, params }) {
          const fetch = async (i = 0): Promise<any> => {
            const transport = transports[i]({
              ...rest,
              chain,
              retryCount: 0,
              timeout,
            })
            try {
              const response = await transport.request({
                method,
                params,
              } as any)

              onResponse({
                method,
                params: params as unknown[],
                response,
                transport,
                status: 'success',
              })

              return response
            } catch (err) {
              onResponse({
                error: err as Error,
                method,
                params: params as unknown[],
                transport,
                status: 'error',
              })

              if (shouldThrow(err as Error)) throw err

              // If we've reached the end of the fallbacks, throw the error.
              if (i === transports.length - 1) throw err

              // Otherwise, try the next fallback.
              return fetch(i + 1)
            }
          }
          return fetch()
        },
        retryCount,
        retryDelay,
        type: 'fallback',
      },
      {
        onResponse: (fn: OnResponseFn) => (onResponse = fn),
        transports: transports.map((fn) => fn({ chain, retryCount: 0 })),
      },
    )

    if (rank) {
      const rankOptions = (typeof rank === 'object' ? rank : {}) as RankOptions
      rankTransports({
        chain,
        interval: rankOptions.interval ?? pollingInterval,
        onTransports: (transports_) => (transports = transports_),
        sampleCount: rankOptions.sampleCount,
        timeout: rankOptions.timeout,
        transports,
        weights: rankOptions.weights,
      })
    }
    return transport
  }
}

function shouldThrow(error: Error) {
  if ('code' in error && typeof error.code === 'number') {
    if (
      error.code === TransactionRejectedRpcError.code ||
      error.code === UserRejectedRequestError.code ||
      error.code === 5000 // CAIP UserRejectedRequestError
    )
      return true
  }
  return false
}

export function rankTransports({
  chain,
  interval = 4_000,
  onTransports,
  sampleCount = 10,
  timeout = 1_000,
  transports,
  weights = {},
}: {
  chain?: Chain
  interval: RankOptions['interval']
  onTransports: (transports: Transport[]) => void
  sampleCount?: RankOptions['sampleCount']
  timeout?: RankOptions['timeout']
  transports: Transport[]
  weights?: RankOptions['weights']
}) {
  const { stability: stabilityWeight = 0.7, latency: latencyWeight = 0.3 } =
    weights

  type SampleData = { latency: number; success: number }
  type Sample = SampleData[]
  const samples: Sample[] = []

  const rankTransports_ = async () => {
    // 1. Take a sample from each Transport.
    const sample: Sample = await Promise.all(
      transports.map(async (transport) => {
        const transport_ = transport({ chain, retryCount: 0, timeout })

        const start = Date.now()
        let end: number
        let success: number
        try {
          await transport_.request({ method: 'net_listening' })
          success = 1
        } catch {
          success = 0
        } finally {
          end = Date.now()
        }
        const latency = end - start
        return { latency, success }
      }),
    )

    // 2. Store the sample. If we have more than `sampleCount` samples, remove
    // the oldest sample.
    samples.push(sample)
    if (samples.length > sampleCount) samples.shift()

    // 3. Calculate the max latency from samples.
    const maxLatency = Math.max(
      ...samples.map((sample) =>
        Math.max(...sample.map(({ latency }) => latency)),
      ),
    )

    // 4. Calculate the score for each Transport.
    const scores = transports
      .map((_, i) => {
        const latencies = samples.map((sample) => sample[i].latency)
        const meanLatency =
          latencies.reduce((acc, latency) => acc + latency, 0) /
          latencies.length
        const latencyScore = 1 - meanLatency / maxLatency

        const successes = samples.map((sample) => sample[i].success)
        const stabilityScore =
          successes.reduce((acc, success) => acc + success, 0) /
          successes.length

        if (stabilityScore === 0) return [0, i]
        return [
          latencyWeight * latencyScore + stabilityWeight * stabilityScore,
          i,
        ]
      })
      .sort((a, b) => b[0] - a[0])

    // 5. Sort the Transports by score.
    onTransports(scores.map(([, i]) => transports[i]))

    // 6. Wait, and then rank again.
    await wait(interval)
    rankTransports_()
  }
  rankTransports_()
}
