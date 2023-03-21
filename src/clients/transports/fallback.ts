import type { Chain } from '../../types'
import { isDeterministicError } from '../../utils/buildRequest'
import { wait } from '../../utils/wait'
import type { Transport, TransportConfig } from './createTransport'
import { createTransport } from './createTransport'

type RankOptions = {
  /**
   * The polling interval (in ms) at which the ranker should ping the RPC URL.
   * @default client.pollingInterval
   */
  interval?: number
  /**
   * The weight to apply to the latency score.
   * @default 0.3
   */
  latencyWeight?: number
  /**
   * The number of previous samples to perform ranking on.
   * @default 10
   */
  sampleCount?: number
  /**
   * The weight to apply to the stability score.
   * @default 0.7
   */
  stabilityWeight?: number
  /**
   * Timeout when sampling transports.
   * @default 1_000
   */
  timeout?: number
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
  { transports: Transport[] }
>

export function fallback(
  transports_: Transport[],
  config: FallbackTransportConfig = {},
): FallbackTransport {
  const {
    key = 'fallback',
    name = 'Fallback',
    rank = true,
    retryCount,
    retryDelay,
  } = config
  return ({ chain, pollingInterval = 4_000, timeout }) => {
    let transports = transports_

    const transport = createTransport(
      {
        key,
        name,
        async request({ method, params }) {
          const fetch = async (i: number = 0): Promise<any> => {
            const transport = transports[i]({ chain, retryCount: 0, timeout })
            try {
              return await transport.request({
                method,
                params,
              } as any)
            } catch (err) {
              // If the error is deterministic, we don't need to fall back.
              // So throw the error.
              if (isDeterministicError(err as Error)) throw err

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
        transports: transports.map(
          (fn) => fn({ chain, retryCount: 0 }) as unknown as Transport,
        ),
      },
    )

    if (rank) {
      const rankOptions = typeof rank === 'object' ? rank : {}
      rankTransports({
        chain,
        interval: rankOptions.interval ?? pollingInterval,
        latencyWeight: rankOptions.latencyWeight,
        onTransports: (transports_) => (transports = transports_),
        sampleCount: rankOptions.sampleCount,
        stabilityWeight: rankOptions.stabilityWeight,
        timeout: rankOptions.timeout,
        transports,
      })
    }

    return transport
  }
}

type SampleData = [latency: number, success: number]
type Sample = SampleData[]

export function rankTransports({
  chain,
  interval = 4_000,
  latencyWeight = 0.3,
  onTransports,
  sampleCount = 10,
  stabilityWeight = 0.7,
  timeout = 1_000,
  transports,
}: {
  chain?: Chain
  interval: number
  latencyWeight?: number
  onTransports: (transports: Transport[]) => void
  sampleCount?: number
  stabilityWeight?: number
  timeout?: number
  transports: Transport[]
}) {
  let samples: Sample[] = []

  const rankTransports_ = async () => {
    const sample: Sample = await Promise.all(
      transports.map(async (transport) => {
        const transport_ = transport({ chain, retryCount: 0, timeout })

        const start = Date.now()
        let end
        let success
        try {
          await transport_.request({ method: 'net_listening' })
          success = 1
        } catch {
          success = 0
        } finally {
          end = Date.now()
        }
        const latency = end - start
        return [latency, success]
      }),
    )

    samples.push(sample)
    if (samples.length > sampleCount) samples.shift()

    const maxLatency = Math.max(
      ...samples.map((sample) =>
        Math.max(...sample.map(([latency]) => latency)),
      ),
    )

    const scores = transports
      .map((_, i) => {
        const latencies = samples.map((sample) => sample[i][0])
        const meanLatency =
          latencies.reduce((acc, latency) => acc + latency, 0) /
          latencies.length
        const latencyScore = 1 - meanLatency / maxLatency

        const successes = samples.map((sample) => sample[i][1])
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

    onTransports(scores.map(([, i]) => transports[i]))

    await wait(interval)
    rankTransports_()
  }
  rankTransports_()
}
