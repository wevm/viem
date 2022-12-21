import type { PublicClient } from '../../clients'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import type { FetchBlockNumberResponse } from './fetchBlockNumber'
import { fetchBlockNumber } from './fetchBlockNumber'

export type WatchBlockNumberArgs = {
  /** Whether or not to emit the missed block numbers to the callback. */
  emitMissed?: boolean
  /** Whether or not to emit the latest block number to the callback when the subscription opens. */
  emitOnBegin?: boolean
  /** Polling frequency (in ms). Defaults to Client's pollingInterval config. */
  pollingInterval?: number
}
export type WatchBlockNumberResponse = FetchBlockNumberResponse
export type WatchBlockNumberCallback = (
  blockNumber: WatchBlockNumberResponse,
  prevBlockNumber: WatchBlockNumberResponse | undefined,
) => void

/** @description Watches and returns incoming block numbers. */
export function watchBlockNumber(
  client: PublicClient,
  callback: WatchBlockNumberCallback,
  {
    emitOnBegin = false,
    emitMissed = false,
    pollingInterval = client.pollingInterval,
  }: WatchBlockNumberArgs = {},
) {
  const observerId = JSON.stringify(['watchBlockNumber', client.uid])

  let prevBlockNumber: WatchBlockNumberResponse | undefined

  return observe(
    observerId,
    callback,
  )(({ emit }) =>
    poll(
      async () => {
        const blockNumber = await fetchBlockNumber(client)

        if (prevBlockNumber) {
          // If the current block number is the same as the previous,
          // we can skip.
          if (blockNumber === prevBlockNumber) return

          // If we have missed out on some previous blocks, and the
          // `emitMissed` flag is truthy, let's emit those blocks.
          if (blockNumber - prevBlockNumber > 1 && emitMissed) {
            for (let i = prevBlockNumber + 1n; i < blockNumber; i++) {
              emit(i, prevBlockNumber)
              prevBlockNumber = i
            }
          }
        }
        prevBlockNumber = blockNumber
        emit(blockNumber, prevBlockNumber)
      },
      {
        emitOnBegin,
        interval: pollingInterval,
      },
    ),
  )
}
