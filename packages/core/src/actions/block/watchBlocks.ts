import type { PublicClient } from '../../clients'
import type { BlockTag } from '../../types'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import type { FetchBlockResponse } from './fetchBlock'
import { fetchBlock } from './fetchBlock'

export type WatchBlocksArgs = {
  /** The block tag. Defaults to "latest". */
  blockTag?: BlockTag
  /** Whether or not to emit the latest block to the callback when the subscription opens. */
  emitOnBegin?: boolean
  /** Whether or not to include transaction data in the response. */
  includeTransactions?: boolean
  /** Polling frequency (in ms). Defaults to the client's pollingInterval config. */
  pollingInterval?: number
}
export type WatchBlocksResponse = FetchBlockResponse
export type WatchBlocksCallback = (block: WatchBlocksResponse) => void

export function watchBlocks(
  client: PublicClient,
  callback: WatchBlocksCallback,
  {
    blockTag = 'latest',
    emitOnBegin = false,
    includeTransactions = false,
    pollingInterval: pollingInterval_,
  }: WatchBlocksArgs = {},
) {
  const blockTime = client.transport.chain?.blockTime
  const pollingInterval =
    pollingInterval_ ?? (blockTime || client.pollingInterval)
  const observerId = JSON.stringify([
    'watchBlocks',
    client.uid,
    includeTransactions,
  ])

  return observe<WatchBlocksCallback, WatchBlocksResponse>(
    observerId,
    callback,
  )(({ emit }) =>
    poll(
      () =>
        fetchBlock(client, {
          blockTag,
          includeTransactions,
        }),
      {
        emitOnBegin,
        initialWaitTime: async (block) => {
          if (!blockTime) return pollingInterval
          if (pollingInterval_ !== undefined) return pollingInterval

          // In order to keep in sync, we need to find the time
          // to wait to fetch the next block.
          const waitTime =
            blockTime - (Number(new Date()) - Number(block.timestamp * 1000n))

          // If the wait time is between the block time, we will wait that
          // time and then fetch the next block. Otherwise, we are expecting a
          // new block so we will fetch immediately.
          if (waitTime > 0 && waitTime < blockTime) {
            return waitTime
          }
          return 0
        },
        onData: emit,
        interval: pollingInterval,
      },
    ),
  )
}
