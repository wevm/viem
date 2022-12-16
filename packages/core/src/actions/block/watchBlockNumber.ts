import type { PublicClient } from '../../clients'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import type { FetchBlockNumberResponse } from './fetchBlockNumber'
import { fetchBlockNumber } from './fetchBlockNumber'

export type WatchBlockNumberArgs = {
  /** Whether or not to emit the latest block to the callback when the subscription opens. */
  emitOnBegin?: boolean
  /** Polling frequency (in ms). Defaults to Client's pollingInterval config. */
  pollingInterval?: number
}
export type WatchBlockNumberResponse = FetchBlockNumberResponse
export type WatchBlockNumberCallback = (
  blockNumber: WatchBlockNumberResponse,
) => void

/** @description Watches and returns incoming block numbers. */
export function watchBlockNumber(
  client: PublicClient,
  callback: WatchBlockNumberCallback,
  {
    emitOnBegin = false,
    pollingInterval = client.pollingInterval,
  }: WatchBlockNumberArgs = {},
) {
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
