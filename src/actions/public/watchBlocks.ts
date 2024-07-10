import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { HasTransportType } from '../../types/transport.js'
import { formatBlock } from '../../utils/formatters/block.js'
import { getAction } from '../../utils/getAction.js'
import { observe } from '../../utils/observe.js'
import { type PollErrorType, poll } from '../../utils/poll.js'
import { type StringifyErrorType, stringify } from '../../utils/stringify.js'

import { type GetBlockReturnType, getBlock } from './getBlock.js'

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
  | (HasTransportType<transport, 'webSocket'> extends true
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
      /** Whether or not to emit the missed blocks to the callback. */
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
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/blocks/watching-blocks
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
    blockTag = 'latest',
    emitMissed = false,
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
    if (client.transport.type === 'webSocket') return false
    if (
      client.transport.type === 'fallback' &&
      client.transport.transports[0].config.type === 'webSocket'
    )
      return false
    return true
  })()
  const includeTransactions = includeTransactions_ ?? false

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
            if (block.number && prevBlock?.number) {
              // If the current block number is the same as the previous,
              // we can skip.
              if (block.number === prevBlock.number) return

              // If we have missed out on some previous blocks, and the
              // `emitMissed` flag is truthy, let's emit those blocks.
              if (block.number - prevBlock.number > 1 && emitMissed) {
                for (let i = prevBlock?.number + 1n; i < block.number; i++) {
                  const block = (await getAction(
                    client,
                    getBlock,
                    'getBlock',
                  )({
                    blockNumber: i,
                    includeTransactions,
                  })) as GetBlockReturnType<chain>
                  emit.onBlock(block as any, prevBlock as any)
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
    let unsubscribe = () => (active = false)
    ;(async () => {
      try {
        const transport = (() => {
          if (client.transport.type === 'fallback') {
            const transport = client.transport.transports.find(
              (transport: ReturnType<Transport>) =>
                transport.config.type === 'webSocket',
            )
            if (!transport) return client.transport
            return transport.value
          }
          return client.transport
        })()

        const { unsubscribe: unsubscribe_ } = await transport.subscribe({
          params: ['newHeads'],
          onData(data: any) {
            if (!active) return
            const format =
              client.chain?.formatters?.block?.format || formatBlock
            const block = format(data.result)
            onBlock(block, prevBlock as any)
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
