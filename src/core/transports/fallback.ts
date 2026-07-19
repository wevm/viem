import type * as Chain from '../Chain.js'
import { wait } from '../internal/wait.js'
import * as Transport from '../Transport.js'

/** Observability callback invoked after each fallback attempt. */
export type OnResponse = (
  args: {
    method: string
    params: unknown
    transport: Transport.Instance
  } & (
    | { error?: undefined; response: unknown; status: 'success' }
    | { error: Error; response?: undefined; status: 'error' }
  ),
) => void

/** Options for ranking transports by latency and stability. */
export type RankOptions = {
  /**
   * The polling interval (in ms) at which the ranker should ping each transport.
   * @default pollingInterval
   */
  interval?: number | undefined
  /** Ping function to determine latency. */
  ping?:
    | ((options: { transport: Transport.Instance }) => Promise<unknown>)
    | undefined
  /**
   * The number of previous samples to perform ranking on.
   * @default 10
   */
  sampleCount?: number | undefined
  /**
   * Timeout (in ms) when sampling transports.
   * @default 1_000
   */
  timeout?: number | undefined
  /** Weights to apply to the scores. Weight values are proportional. */
  weights?:
    | {
        /**
         * The weight to apply to the latency score.
         * @default 0.3
         */
        latency?: number | undefined
        /**
         * The weight to apply to the stability score.
         * @default 0.7
         */
        stability?: number | undefined
      }
    | undefined
}

/** A fallback {@link Transport} that chains through a list of transports. */
export type Fallback = Transport.Transport<
  'fallback',
  {
    onResponse: (fn: OnResponse) => void
    transports: readonly Transport.Instance[]
  }
>

/**
 * Creates a {@link Transport} that attempts each transport in order, falling
 * through to the next when one errors -- unless `shouldThrow` says the error is
 * terminal (e.g. a user rejection). When `rank` is enabled, transports are
 * periodically re-ordered by latency and stability.
 *
 * @example
 * ```ts
 * import { Client, fallback, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: fallback([
 *     http('https://1.rpc.example'),
 *     http('https://2.rpc.example'),
 *   ]),
 * })
 * ```
 */
export function fallback(
  transports: readonly Transport.Transport[],
  options: fallback.Options = {},
): Fallback {
  const { rank = false, shouldThrow: shouldThrow_ = shouldThrow } = options
  return Transport.from({
    key: options.key ?? 'fallback',
    name: options.name ?? 'Fallback',
    type: 'fallback',
    setup({ chain, pollingInterval = 4_000, retryCount, timeout }) {
      const instances = transports.map((transport) =>
        transport.setup({ chain, retryCount: 0, timeout }),
      )
      let ranked = instances

      let onResponse: OnResponse = () => {}

      const request = async (args: { method: string; params?: unknown }) => {
        const { method, params } = args
        let includes: boolean | undefined
        const attempt = async (index = 0): Promise<unknown> => {
          const transport = ranked[index]
          try {
            const response = await transport.request(args)
            onResponse({
              method,
              params,
              response,
              status: 'success',
              transport,
            })
            return response
          } catch (error) {
            onResponse({
              error: error as Error,
              method,
              params,
              status: 'error',
              transport,
            })
            if (shouldThrow_(error as Error)) throw error
            if (index === ranked.length - 1) throw error
            includes ??= ranked
              .slice(index + 1)
              .some((instance) => supportsMethod(instance.methods, method))
            if (!includes) throw error
            return attempt(index + 1)
          }
        }
        return attempt()
      }

      if (rank) {
        const rankOptions = (
          typeof rank === 'object' ? rank : {}
        ) as RankOptions
        rankTransports({
          chain,
          interval: rankOptions.interval ?? pollingInterval,
          onTransports: (transports) => {
            ranked = transports.map((transport) =>
              transport.setup({ chain, retryCount: 0, timeout }),
            )
          },
          ping: rankOptions.ping,
          sampleCount: rankOptions.sampleCount,
          timeout: rankOptions.timeout,
          transports,
          weights: rankOptions.weights,
        })
      }

      return {
        onResponse: (fn: OnResponse) => {
          onResponse = fn
        },
        request,
        retryCount: options.retryCount ?? retryCount,
        retryDelay: options.retryDelay,
        transports: instances,
      }
    },
  })
}

export declare namespace fallback {
  type Options = {
    /** Transport key. @default 'fallback' */
    key?: string | undefined
    /** Transport name. @default 'Fallback' */
    name?: string | undefined
    /** Toggle to enable ranking, or rank options. @default false */
    rank?: boolean | RankOptions | undefined
    /** Max retries per request. @default 3 */
    retryCount?: number | undefined
    /** Base delay (ms) between retries. @default 150 */
    retryDelay?: number | undefined
    /** Whether an error is terminal (rethrow) rather than falling through. */
    shouldThrow?: ((error: Error) => boolean) | undefined
  }
}

/**
 * Whether a fallback should rethrow `error` instead of trying the next transport.
 *
 * @internal
 */
export function shouldThrow(error: Error): boolean {
  if ('code' in error && typeof error.code === 'number')
    return (
      error.code === 4001 || // user rejected (EIP-1193)
      error.code === 5000 || // user rejected (CAIP)
      error.code === -32003 || // transaction rejected
      error.code === 7000 || // walletconnect session settlement
      /execution reverted|gas required exceeds allowance/.test(error.message)
    )
  return false
}

/**
 * Periodically samples each transport's latency and stability, then reports a
 * ranked ordering (best first) via `onTransports`.
 *
 * @internal
 */
export function rankTransports(options: rankTransports.Options): void {
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
  const { stability: stabilityWeight = 0.7, latency: latencyWeight = 0.3 } =
    weights

  type SampleData = { latency: number; success: number }
  type Sample = SampleData[]
  const samples: Sample[] = []

  const rank = async () => {
    // 1. Take a sample from each transport.
    const sample: Sample = await Promise.all(
      transports.map(async (transport) => {
        const instance = transport.setup({ chain, retryCount: 0, timeout })

        const start = Date.now()
        let end: number
        let success: number
        try {
          await (ping
            ? ping({ transport: instance })
            : instance.request({ method: 'net_listening' }))
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

    // 2. Store the sample, dropping the oldest beyond `sampleCount`.
    samples.push(sample)
    if (samples.length > sampleCount) samples.shift()

    // 3. Calculate the max latency from samples.
    const maxLatency = Math.max(
      ...samples.map((sample) =>
        Math.max(...sample.map(({ latency }) => latency)),
      ),
    )

    // 4. Calculate the score for each transport.
    const scores = transports
      .map((_, i) => {
        const latencies = samples.map((sample) => sample[i]!.latency)
        const meanLatency =
          latencies.reduce((acc, latency) => acc + latency, 0) /
          latencies.length
        const latencyScore = 1 - meanLatency / maxLatency

        const successes = samples.map((sample) => sample[i]!.success)
        const stabilityScore =
          successes.reduce((acc, success) => acc + success, 0) /
          successes.length

        if (stabilityScore === 0) return [0, i] as const
        return [
          latencyWeight * latencyScore + stabilityWeight * stabilityScore,
          i,
        ] as const
      })
      .sort((a, b) => b[0] - a[0])

    // 5. Report the transports sorted by score.
    onTransports(scores.map(([, i]) => transports[i]!))

    // 6. Wait, and then rank again.
    await wait(interval)
    rank()
  }
  rank()
}

export declare namespace rankTransports {
  type Options = {
    /** Chain the transports connect through. */
    chain?: Chain.Chain | undefined
    /** Polling interval (in ms) between rankings. @default 4_000 */
    interval?: number | undefined
    /** Callback invoked with the ranked transports (best first). */
    onTransports: (transports: readonly Transport.Transport[]) => void
    /** Ping function to determine latency. */
    ping?: RankOptions['ping'] | undefined
    /** The number of previous samples to perform ranking on. @default 10 */
    sampleCount?: number | undefined
    /** Timeout (in ms) when sampling transports. @default 1_000 */
    timeout?: number | undefined
    /** The transports to rank. */
    transports: readonly Transport.Transport[]
    /** Weights to apply to the scores. */
    weights?: RankOptions['weights'] | undefined
  }
}

/** @internal */
function supportsMethod(
  methods: Transport.Instance['methods'],
  method: string,
): boolean {
  if (!methods) return true
  if ('include' in methods && methods.include)
    return methods.include.includes(method)
  if ('exclude' in methods && methods.exclude)
    return !methods.exclude.includes(method)
  return true
}
