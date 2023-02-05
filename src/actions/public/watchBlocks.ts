import type { Chain } from '../../chains'
import type { PublicClient } from '../../clients'
import type { BlockTag } from '../../types'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import type { GetBlockResponse } from './getBlock'
import { getBlock } from './getBlock'

export type OnBlockResponse<
  TChain extends Chain = Chain,
  TOmitFields extends string = '',
> = Omit<GetBlockResponse<TChain>, TOmitFields>
export type OnBlock<
  TChain extends Chain = Chain,
  TOmitFields extends string = '',
> = (
  block: OnBlockResponse<TChain, TOmitFields>,
  prevBlock: OnBlockResponse<TChain, TOmitFields> | undefined,
) => void

type BaseWatchBlocksArgs<TChain extends Chain = Chain> = {
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
}

type OnBlockArgs<TChain extends Chain = Chain> =
  | {
      /** Whether or not to include transaction data in the response. */
      includeTransactions: true
      /** The callback to call when a new block is received. */
      onBlock: OnBlock<TChain>
    }
  | {
      /** Whether or not to include transaction data in the response. */
      includeTransactions?: false
      /** The callback to call when a new block is received. */
      onBlock: OnBlock<TChain, 'transactions'>
    }

export type WatchBlocksArgs<TChain extends Chain = Chain> =
  BaseWatchBlocksArgs<TChain> & OnBlockArgs<TChain>

/** @description Watches and returns information for incoming blocks. */
export function watchBlocks<
  TChain extends Chain,
  TWatchBlocksArgs extends WatchBlocksArgs<TChain>,
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
  }: TWatchBlocksArgs,
) {
  const observerId = JSON.stringify([
    'watchBlocks',
    client.uid,
    emitMissed,
    emitOnBegin,
    includeTransactions,
    pollingInterval,
  ])

  let prevBlock: GetBlockResponse<TChain> | undefined

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
          emit.onBlock(block, prevBlock)
          prevBlock = block
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
