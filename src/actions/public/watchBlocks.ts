import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { HasTransportType } from '../../types/transport.js'
import { getAction } from '../../utils/getAction.js'
import { observe } from '../../utils/observe.js'
import { type PollErrorType, poll } from '../../utils/poll.js'
import { type StringifyErrorType, stringify } from '../../utils/stringify.js'

import { type GetBlockReturnType, getBlock } from './getBlock.js'
import {
  getSubscriptionTransport,
  shouldPoll,
} from './internal/watchTransport.js'

export type OnBlockParameter<
  chain extends Chain | undefined = Chain,
  includeTransactions extends boolean = false,
  blockTag extends BlockTag = 'latest',
> = GetBlockReturnType<chain, includeTransactions, blockTag>

export type OnBlock<
  chain extends Chain | undefined = Chain,
  includeTransactions extends boolean = false,
  blockTag extends BlockTag = 'latest',
> = (
  block: OnBlockParameter<chain, includeTransactions, blockTag>,
  prevBlock: OnBlockParameter<chain, includeTransactions, blockTag> | undefined,
) => void

export type WatchBlocksParameters<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain,
  includeTransactions extends boolean = false,
  blockTag extends BlockTag = 'latest',
> = {
  /** The callback to call when a new block is received. */
  onBlock: OnBlock<chain, includeTransactions, blockTag>
  /** The callback to call when an error occurred when trying to get for a new block. */
  onError?: ((error: Error) => void) | undefined
} & (
  | (HasTransportType<transport, 'webSocket' | 'ipc'> extends true
      ? {
          blockTag?: undefined
          emitMissed?: undefined
          emitOnBegin?: undefined
          includeTransactions?: undefined
          /** Whether or not the WebSocket Transport should poll the JSON-RPC, rather than using `eth_subscribe`. */
          poll?: false | undefined
          pollingInterval?: undefined
        }
      : never)
  | {
      /** The block tag. Defaults to "latest". */
      blockTag?: blockTag | BlockTag | undefined
      /**
       * Whether or not to emit the missed blocks to the callback.
       * Defaults to `true` when `blockTag` is `latest` or `pending` and the
       * polling interval is longer than half the chain's block time,
       * otherwise `false`. The default skips gaps of more than 100 blocks.
       */
      emitMissed?: boolean | undefined
      /** Whether or not to emit the block to the callback when the subscription opens. */
      emitOnBegin?: boolean | undefined
      /** Whether or not to include transaction data in the response. */
      includeTransactions?: includeTransactions | undefined
      poll?: true | undefined
      /** Polling frequency (in ms). Defaults to the client's pollingInterval config. */
      pollingInterval?: number | undefined
    }
)

export type WatchBlocksReturnType = () => void

export type WatchBlocksErrorType =
  | StringifyErrorType
  | PollErrorType
  | ErrorType

/**
 * Watches and returns information for incoming blocks.
 *
 * - Docs: https://viem.sh/docs/actions/public/watchBlocks
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/blocks_watching-blocks
 * - JSON-RPC Methods:
 *   - When `poll: true`, calls [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getBlockByNumber) on a polling interval.
 *   - When `poll: false` & WebSocket Transport, uses a WebSocket subscription via [`eth_subscribe`](https://docs.alchemy.com/reference/eth-subscribe-polygon) and the `"newHeads"` event.
 *
 * @param client - Client to use
 * @param parameters - {@link WatchBlocksParameters}
 * @returns A function that can be invoked to stop watching for new block numbers. {@link WatchBlocksReturnType}
 *
 * @example
 * import { createPublicClient, watchBlocks, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const unwatch = watchBlocks(client, {
 *   onBlock: (block) => console.log(block),
 * })
 */
export function watchBlocks<
  transport extends Transport,
  chain extends Chain | undefined,
  includeTransactions extends boolean = false,
  blockTag extends BlockTag = 'latest',
>(
  client: Client<transport, chain>,
  {
    blockTag = client.experimental_blockTag ?? 'latest',
    emitMissed: emitMissed_,
    emitOnBegin = false,
    onBlock,
    onError,
    includeTransactions: includeTransactions_,
    poll: poll_,
    pollingInterval = client.pollingInterval,
  }: WatchBlocksParameters<transport, chain, includeTransactions, blockTag>,
): WatchBlocksReturnType {
  const enablePolling = (() => {
    if (typeof poll_ !== 'undefined') return poll_
    return shouldPoll(client)
  })()
  const includeTransactions = includeTransactions_ ?? false
  // Polling less than twice per block skips blocks, so emit the missed
  // ones unless told otherwise. `safe` and `finalized` can move by
  // thousands of blocks at once (such as on Arbitrum) at any polling
  // interval, so they emit missed blocks only when asked.
  const blockTime = client.chain?.blockTime
  const emitMissed =
    emitMissed_ ??
    ((blockTag === 'latest' || blockTag === 'pending') &&
      blockTime !== undefined &&
      pollingInterval > blockTime / 2)
  // The default catches up at most 100 blocks, so a long gap, such as a
  // device waking from sleep, skips to the latest block.
  const maxMissed = emitMissed_ === undefined ? 100 : Number.POSITIVE_INFINITY

  let prevBlock:
    | GetBlockReturnType<chain, false | includeTransactions, 'latest'>
    | undefined

  const pollBlocks = () => {
    const observerId = stringify([
      'watchBlocks',
      client.uid,
      blockTag,
      emitMissed,
      emitOnBegin,
      includeTransactions,
      maxMissed,
      pollingInterval,
    ])

    return observe(observerId, { onBlock, onError }, (emit) =>
      poll(
        async () => {
          try {
            const block = await getAction(
              client,
              getBlock,
              'getBlock',
            )({
              blockTag,
              includeTransactions,
            })
            if (block.number !== null && prevBlock?.number != null) {
              // If the current block number is the same as the previous,
              // we can skip.
              if (block.number === prevBlock.number) return

              // If we have missed out on some previous blocks, and the
              // `emitMissed` flag is truthy, let's emit those blocks.
              // Fetch them in parallel batches so catching up takes a few
              // round trips rather than one per block.
              const missed = Number(block.number - prevBlock.number) - 1
              if (missed > 0 && missed <= maxMissed && emitMissed) {
                const batchSize = 10
                const start = prevBlock.number + 1n
                for (let i = 0; i < missed; i += batchSize) {
                  const blocks = await Promise.all(
                    Array.from(
                      { length: Math.min(batchSize, missed - i) },
                      (_, j) =>
                        getAction(
                          client,
                          getBlock,
                          'getBlock',
                        )({
                          blockNumber: start + BigInt(i + j),
                          includeTransactions,
                        }),
                    ),
                  )
                  for (const block of blocks) {
                    emit.onBlock(block as any, prevBlock as any)
                    prevBlock = block as any
                  }
                }
              }
            }

            if (
              // If no previous block exists, emit.
              prevBlock?.number == null ||
              // If the block tag is "pending" with no block number, emit.
              (blockTag === 'pending' && block?.number == null) ||
              // If the next block number is greater than the previous block number, emit.
              // We don't want to emit blocks in the past.
              (block.number !== null && block.number > prevBlock.number)
            ) {
              emit.onBlock(block as any, prevBlock as any)
              prevBlock = block as any
            }
          } catch (err) {
            emit.onError?.(err as Error)
          }
        },
        {
          emitOnBegin,
          interval: pollingInterval,
        },
      ),
    )
  }

  const subscribeBlocks = () => {
    let active = true
    let emitFetched = true
    let unsubscribe = () => (active = false)
    ;(async () => {
      try {
        if (emitOnBegin) {
          getAction(
            client,
            getBlock,
            'getBlock',
          )({
            blockTag,
            includeTransactions,
          })
            .then((block) => {
              if (!active) return
              if (!emitFetched) return
              onBlock(block as any, undefined)
              emitFetched = false
            })
            .catch(onError)
        }

        const transport = getSubscriptionTransport(client)

        const { unsubscribe: unsubscribe_ } = await transport.subscribe({
          params: ['newHeads'],
          async onData(data: any) {
            if (!active) return
            const block = (await getAction(
              client,
              getBlock,
              'getBlock',
            )({
              blockNumber: data.result?.number,
              includeTransactions,
            }).catch(() => {})) as GetBlockReturnType<chain>
            if (!active) return
            onBlock(block as any, prevBlock as any)
            emitFetched = false
            prevBlock = block
          },
          onError(error: Error) {
            onError?.(error)
          },
        })
        unsubscribe = unsubscribe_
        if (!active) unsubscribe()
      } catch (err) {
        onError?.(err as Error)
      }
    })()
    return () => unsubscribe()
  }

  return enablePolling ? pollBlocks() : subscribeBlocks()
}
