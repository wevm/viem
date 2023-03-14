import type { PublicClient } from '../../clients'
import type { BlockTag, Chain } from '../../types'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import type { GetBlockReturnType } from './getBlock'
import { getBlock } from './getBlock'

export type OnBlockParameter<
  TChain extends Chain = Chain,
  TIncludeTransactions = false,
> = Omit<
  GetBlockReturnType<TChain>,
  TIncludeTransactions extends false ? 'transactions' : ''
>
export type OnBlock<
  TChain extends Chain = Chain,
  TIncludeTransactions = false,
> = (
  block: OnBlockParameter<TChain, TIncludeTransactions>,
  prevBlock: OnBlockParameter<TChain, TIncludeTransactions> | undefined,
) => void

export type WatchBlocksParameters<TChain extends Chain = Chain> = {
  /** The block tag. Defaults to "latest". */
  blockTag?: BlockTag
  /** Whether or not to emit the missed blocks to the callback. */
  emitMissed?: boolean
  /** Whether or not to emit the block to the callback when the subscription opens. */
  emitOnBegin?: boolean
  /** The callback to call when an error occurred when trying to get for a new block. */
  onError?: (error: Error) => void
  /** Polling frequency (in ms). Defaults to the client's pollingInterval config. */
  pollingInterval?: number
} & (
  | {
      /** Whether or not to include transaction data in the response. */
      includeTransactions: true
      /** The callback to call when a new block is received. */
      onBlock: OnBlock<TChain, true>
    }
  | {
      /** Whether or not to include transaction data in the response. */
      includeTransactions?: false
      /** The callback to call when a new block is received. */
      onBlock: OnBlock<TChain>
    }
)

/** @description Watches and returns information for incoming blocks. */
export function watchBlocks<
  TChain extends Chain,
  TWatchBlocksParameters extends WatchBlocksParameters<TChain>,
>(
  client: PublicClient<any, TChain>,
  {
    blockTag = 'latest',
    emitMissed = false,
    emitOnBegin = false,
    onBlock,
    onError,
    includeTransactions = false,
    pollingInterval = client.pollingInterval,
  }: TWatchBlocksParameters,
) {
  const observerId = JSON.stringify([
    'watchBlocks',
    client.uid,
    emitMissed,
    emitOnBegin,
    includeTransactions,
    pollingInterval,
  ])

  let prevBlock: GetBlockReturnType<TChain> | undefined

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
