import type * as Chain from '../Chain.js'
import * as Transport from '../Transport.js'
import { wait } from '../internal/wait.js'

/**
 * Creates a Fallback Transport from a list of Transports.
 *
 * @example
 * ```ts twoslash
 * import { fallback, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const transport = fallback([
 *   http('https://1.rpc.thirdweb.com'),
 *   http('https://eth.llamarpc.com')
 * ])
 *
 * // TODO(v3): Replace with Client.create({ chain: mainnet, transport }) once Client lands.
 * const client = transport({})
 * const blockNumber = await client.request({
 *   method: 'eth_blockNumber'
 * })
 * // @log: '0x1a2b3c'
 * ```
 *
 * @param transports - Transports to use for JSON-RPC requests.
 * @param options - Transport options.
 * @returns Fallback Transport.
 */
export function fallback<
  const transports extends readonly Transport.Transport[],
>(
  transports: transports,
  options: fallback.Options = {},
): fallback.Transport<transports> {
  const {
    key = 'fallback',
    name = 'Fallback',
    rank = false,
    retryCount,
    retryDelay,
    shouldThrow = Transport.shouldThrow,
  } = options

  return (({ chain, pollingInterval = 4_000, timeout, ...rest }) => {
    let transports_ = transports
    let onResponse: fallback.OnResponse = () => undefined

    const transport = Transport.create(
      {
        key,
        name,
        async request({ method, params }) {
          let includes: boolean | undefined

          const fetch = async (index = 0): Promise<unknown> => {
            const transport = transports_[index]?.({
              ...rest,
              chain,
              retryCount: 0,
              timeout,
            })
            if (!transport) return undefined

            try {
              const response = await transport.request({
                method,
                params,
              } as Transport.Request)
              onResponse({
                method,
                params: params as unknown[],
                response,
                status: 'success',
                transport,
              })
              return response
            } catch (error) {
              onResponse({
                error: error as Error,
                method,
                params: params as unknown[],
                status: 'error',
                transport,
              })

              if (shouldThrow(error as Error)) throw error
              if (index === transports_.length - 1) throw error

              includes ??= transports_.slice(index + 1).some((transport_) => {
                const { exclude, include } =
                  transport_({ chain }).config.methods ?? {}
                if (include) return include.includes(method)
                if (exclude) return !exclude.includes(method)
                return true
              })
              if (!includes) throw error
              return fetch(index + 1)
            }
          }

          return fetch()
        },
        retryCount,
        retryDelay,
        type: 'fallback',
      },
      {
        onResponse: (fn: fallback.OnResponse) => {
          onResponse = fn
        },
        transports: transports_.map((transport) =>
          transport({ chain, retryCount: 0 }),
        ),
      },
    )

    if (rank) {
      const rankOptions = typeof rank === 'object' ? rank : {}
      rankTransports({
        chain,
        interval: rankOptions.interval ?? pollingInterval,
        onTransports: (transports) => {
          transports_ = transports as transports
        },
        ping: rankOptions.ping,
        sampleCount: rankOptions.sampleCount,
        timeout: rankOptions.timeout,
        transports: transports_,
        weights: rankOptions.weights,
      })
    }

    return transport
  }) as fallback.Transport<transports>
}

export declare namespace fallback {
  /** Options for a Fallback Transport. */
  type Options = {
    /** Transport key. */
    key?: string | undefined
    /** Transport display name. */
    name?: string | undefined
    /**
     * Enables Transport ranking.
     *
     * @default false
     */
    rank?: boolean | RankOptions | undefined
    /** Retry count. */
    retryCount?: number | undefined
    /** Retry delay in milliseconds. */
    retryDelay?: number | undefined
    /** Function that determines whether a request error should stop the fallback sequence. */
    shouldThrow?: ((error: Error) => boolean) | undefined
  }

  /** Function to call after each Fallback Transport response. */
  type OnResponse = (
    args: {
      /** JSON-RPC method name. */
      method: string
      /** JSON-RPC parameters. */
      params: unknown[]
      /** Transport that handled the request. */
      transport: Transport.Instance
    } & (
      | {
          error?: undefined
          response: unknown
          status: 'success'
        }
      | {
          error: Error
          response?: undefined
          status: 'error'
        }
    ),
  ) => void

  /** Fallback Transport. */
  type Transport<transports extends readonly Transport.Transport[]> =
    Transport.Transport<
      'fallback',
      {
        onResponse: (fn: OnResponse) => void
        transports: {
          [key in keyof transports]: ReturnType<transports[key]>
        }
      }
    >
}

type RankOptions = {
  interval?: number | undefined
  ping?:
    | ((options: { transport: Transport.Instance }) => Promise<unknown>)
    | undefined
  sampleCount?: number | undefined
  timeout?: number | undefined
  weights?:
    | {
        latency?: number | undefined
        stability?: number | undefined
      }
    | undefined
}

/* c8 ignore start */
function rankTransports(options: {
  chain?: Chain.Chain | undefined
  interval: number | undefined
  onTransports: (transports: readonly Transport.Transport[]) => void
  ping?: RankOptions['ping'] | undefined
  sampleCount?: number | undefined
  timeout?: number | undefined
  transports: readonly Transport.Transport[]
  weights?: RankOptions['weights'] | undefined
}) {
  const {
    chain,
    interval = 4_000,
    onTransports,
    ping,
    sampleCount = 10,
    timeout = 1_000,
    transports,
    weights = {},
  } = options
  const { latency: latencyWeight = 0.3, stability: stabilityWeight = 0.7 } =
    weights
  const samples: { latency: number; success: number }[][] = []

  const rank = async () => {
    const sample = await Promise.all(
      transports.map(async (transport) => {
        const transport_ = transport({ chain, retryCount: 0, timeout })
        const start = Date.now()
        try {
          await (ping
            ? ping({ transport: transport_ })
            : transport_.request({
                method: 'net_listening',
              } as Transport.Request))
          return { latency: Date.now() - start, success: 1 }
        } catch {
          return { latency: Date.now() - start, success: 0 }
        }
      }),
    )

    samples.push(sample)
    if (samples.length > sampleCount) samples.shift()

    const maxLatency = Math.max(
      ...samples.map((sample) =>
        Math.max(...sample.map(({ latency }) => latency)),
      ),
    )
    const scores = transports
      .map((_, index) => {
        const latencies = samples.map((sample) => sample[index]!.latency)
        const meanLatency =
          latencies.reduce((total, latency) => total + latency, 0) /
          latencies.length
        const latencyScore = maxLatency === 0 ? 1 : 1 - meanLatency / maxLatency
        const successes = samples.map((sample) => sample[index]!.success)
        const stabilityScore =
          successes.reduce((total, success) => total + success, 0) /
          successes.length
        if (stabilityScore === 0) return [0, index] as const
        return [
          latencyWeight * latencyScore + stabilityWeight * stabilityScore,
          index,
        ] as const
      })
      .sort((a, b) => b[0] - a[0])

    onTransports(scores.map(([, index]) => transports[index]!))
    await wait(interval ?? 4_000)
    /* c8 ignore next 2 */
    rank()
  }

  rank()
}
/* c8 ignore stop */
