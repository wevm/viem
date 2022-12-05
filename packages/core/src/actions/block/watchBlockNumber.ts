import { NetworkClient } from '../../clients'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import { FetchBlockNumberResponse, fetchBlockNumber } from './fetchBlockNumber'

export type WatchBlockNumberArgs = {
  /** Whether or not to emit the latest block to the callback when the subscription opens. */
  emitOnBegin?: boolean
  /** Polling frequency (in ms). Defaults to RPC's pollingInterval config. */
  pollingInterval?: number
}
export type WatchBlockNumberResponse = FetchBlockNumberResponse
export type WatchBlockNumberCallback = (
  blockNumber: WatchBlockNumberResponse,
) => void

export function watchBlockNumber(
  client: NetworkClient,
  callback: WatchBlockNumberCallback,
  {
    emitOnBegin = false,
    pollingInterval: pollingInterval_,
  }: WatchBlockNumberArgs = {},
) {
  const blockTime = client.adapter.chain?.blockTime
  const pollingInterval =
    pollingInterval_ ?? (blockTime || client.pollingInterval)
  const observerId = JSON.stringify(['watchBlockNumber', client.uid])

  return observe<WatchBlockNumberCallback, WatchBlockNumberResponse>(
    observerId,
    callback,
  )(({ emit }) =>
    poll(() => fetchBlockNumber(client), {
      emitOnBegin,
      onData: emit,
      interval: pollingInterval,
    }),
  )
}
