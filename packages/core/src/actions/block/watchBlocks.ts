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
    pollingInterval = client.pollingInterval,
  }: WatchBlocksArgs = {},
) {
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
        onData: emit,
        interval: pollingInterval,
      },
    ),
  )
}
