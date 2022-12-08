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
  /** Whether or not to emit the latest block to the callback when the subscription opens. */
  emitOnBegin?: boolean
  /** Polling frequency (in ms). Defaults to the client's pollingInterval config. */
  pollingInterval?: number
}
export type WatchBlocksResponse<TChain extends Chain = Chain> =
  FetchBlockResponse<TChain>
export type WatchBlocksCallback<TChain extends Chain = Chain> = (
  block: WatchBlocksResponse<TChain>,
) => void

/** @description Watches and returns information for incoming blocks. */
export function watchBlocks<TChain extends Chain>(
  client: PublicClient<any, TChain>,
  callback: WatchBlocksCallback<TChain>,
  {
    blockTag = 'latest',
    emitOnBegin = false,
    pollingInterval = client.pollingInterval,
  }: WatchBlocksArgs = {},
) {
  const observerId = JSON.stringify(['watchBlocks', client.uid])

  return observe<WatchBlocksCallback<TChain>, WatchBlocksResponse<TChain>>(
    observerId,
    callback,
  )(({ emit }) =>
    poll(
      () =>
        fetchBlock(client, {
          blockTag,
        }),
      {
        emitOnBegin,
        onData: emit,
        interval: pollingInterval,
      },
    ),
  )
}
