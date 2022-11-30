import { NetworkRpc } from '../../rpcs'
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
  rpc: NetworkRpc,
  callback: WatchBlockNumberCallback,
  {
    emitOnBegin = false,
    pollingInterval: pollingInterval_,
  }: WatchBlockNumberArgs = {},
) {
  const blockTime = rpc.adapter.chain?.blockTime
  const pollingInterval = pollingInterval_ ?? (blockTime || rpc.pollingInterval)
  const observerId = JSON.stringify(['watchBlockNumber', rpc.uid])

  return observe<WatchBlockNumberCallback, WatchBlockNumberResponse>(
    observerId,
    callback,
  )(({ emit }) =>
    poll(() => fetchBlockNumber(rpc), {
      emitOnBegin,
      onData: emit,
      interval: pollingInterval,
    }),
  )
}
