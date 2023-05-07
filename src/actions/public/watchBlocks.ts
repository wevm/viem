import type { PublicClient } from '../../clients/createPublicClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { GetTransportConfig } from '../../types/transport.js'
import { observe } from '../../utils/observe.js'
import { poll } from '../../utils/poll.js'

import { type GetBlockReturnType, getBlock } from './getBlock.js'

export type OnBlockParameter<TChain extends Chain | undefined = Chain> =
  GetBlockReturnType<TChain>

export type OnBlock<TChain extends Chain | undefined = Chain> = (
  block: OnBlockParameter<TChain>,
  prevBlock: OnBlockParameter<TChain> | undefined,
) => void

type PollOptions = {
  /** The block tag. Defaults to "latest". */
  blockTag?: BlockTag
  /** Whether or not to emit the missed blocks to the callback. */
  emitMissed?: boolean
  /** Whether or not to emit the block to the callback when the subscription opens. */
  emitOnBegin?: boolean
  /** Whether or not to include transaction data in the response. */
  includeTransactions?: boolean
  /** Polling frequency (in ms). Defaults to the client's pollingInterval config. */
  pollingInterval?: number
}

export type WatchBlocksParameters<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain,
> = {
  /** The callback to call when a new block is received. */
  onBlock: OnBlock<TChain>
  /** The callback to call when an error occurred when trying to get for a new block. */
  onError?: (error: Error) => void
} & (GetTransportConfig<TTransport>['type'] extends 'webSocket'
  ?
      | {
          blockTag?: never
          emitMissed?: never
          emitOnBegin?: never
          includeTransactions?: never
          /** Whether or not the WebSocket Transport should poll the JSON-RPC, rather than using `eth_subscribe`. */
          poll?: false
          pollingInterval?: never
        }
      | (PollOptions & { poll?: true })
  : PollOptions & { poll?: true })

export type WatchBlocksReturnType = () => void

/**
 * Watches and returns information for incoming blocks.
 *
 * - Docs: https://viem.sh/docs/actions/public/watchBlocks.html
 * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/blocks/watching-blocks
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
 * const unwatch = await watchBlocks(client, {
 *   onBlock: (block) => console.log(block),
 * })
 */
export function watchBlocks<
  TTransport extends Transport,
  TChain extends Chain | undefined,
>(
  client: PublicClient<TTransport, TChain>,
  {
    blockTag = 'latest',
    emitMissed = false,
    emitOnBegin = false,
    onBlock,
    onError,
    includeTransactions = false,
    poll: poll_,
    pollingInterval = client.pollingInterval,
  }: WatchBlocksParameters<TTransport, TChain>,
): WatchBlocksReturnType {
  const enablePolling =
    typeof poll_ !== 'undefined' ? poll_ : client.transport.type !== 'webSocket'

  let prevBlock: GetBlockReturnType<TChain> | undefined

  const pollBlocks = () => {
    const observerId = JSON.stringify([
      'watchBlocks',
      client.uid,
      emitMissed,
      emitOnBegin,
      includeTransactions,
      pollingInterval,
    ])

    return observe(observerId, { onBlock, onError }, (emit) =>
      poll(
        async () => {
          try {
            const block = await getBlock(client, {
              blockTag,
              includeTransactions,
            })
            if (block.number && prevBlock?.number) {
              // If the current block number is the same as the previous,
              // we can skip.
              if (block.number === prevBlock.number) return

              // If we have missed out on some previous blocks, and the
              // `emitMissed` flag is truthy, let's emit those blocks.
              if (block.number - prevBlock.number > 1 && emitMissed) {
                for (let i = prevBlock?.number + 1n; i < block.number; i++) {
                  const block = await getBlock(client, {
                    blockNumber: i,
                    includeTransactions,
                  })
                  emit.onBlock(block, prevBlock)
                  prevBlock = block
                }
              }
            }

            if (
              // If no previous block exists, emit.
              !prevBlock?.number ||
              // If the block tag is "pending" with no block number, emit.
              (blockTag === 'pending' && !block?.number) ||
              // If the next block number is greater than the previous block number, emit.
              // We don't want to emit blocks in the past.
              (block.number && block.number > prevBlock.number)
            ) {
              emit.onBlock(block, prevBlock)
              prevBlock = block
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
    let unsubscribe = () => (active = false)
    ;(async () => {
      try {
        const { unsubscribe: unsubscribe_ } = await client.transport.subscribe({
          params: ['newHeads'],
          onData(data: any) {
            if (!active) return
            const block = data.result
            onBlock(block, prevBlock)
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
    return unsubscribe
  }

  return enablePolling ? pollBlocks() : subscribeBlocks()
}
