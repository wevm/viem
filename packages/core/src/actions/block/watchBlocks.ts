import type { Chain } from '../../chains'
import type { PublicClient } from '../../clients'
import type { BlockTag } from '../../types'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import type { FetchBlockResponse } from './fetchBlock'
import { fetchBlock } from './fetchBlock'

export type WatchBlocksArgs = {
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
export type WatchBlocksResponse<TChain extends Chain = Chain> =
  FetchBlockResponse<TChain>
export type WatchBlocksCallback<TChain extends Chain = Chain> = (
  block: WatchBlocksResponse<TChain>,
  prevBlock: WatchBlocksResponse<TChain> | undefined,
) => void

/** @description Watches and returns information for incoming blocks. */
export function watchBlocks<TChain extends Chain>(
  client: PublicClient<any, TChain>,
  callback: WatchBlocksCallback<TChain>,
  {
    blockTag = 'latest',
    emitMissed = false,
    emitOnBegin = false,
    includeTransactions = false,
    pollingInterval = client.pollingInterval,
  }: WatchBlocksArgs = {},
) {
  const observerId = JSON.stringify(['watchBlocks', client.uid])

  let prevBlock: WatchBlocksResponse<TChain> | undefined

  return observe(
    observerId,
    callback,
  )(({ emit }) =>
    poll(
      async () => {
        const block = await fetchBlock(client, {
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
              const block = await fetchBlock(client, {
                blockNumber: i,
                includeTransactions,
              })
              emit(block, prevBlock)
              prevBlock = block
            }
          }
        }
        emit(block, prevBlock)
        prevBlock = block
      },
      {
        emitOnBegin,
        interval: pollingInterval,
      },
    ),
  )
}
