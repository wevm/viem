import type { PublicClient } from '../../clients'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import type { GetBlockNumberResponse } from './getBlockNumber'
import { getBlockNumber } from './getBlockNumber'

export type OnBlockNumberResponse = GetBlockNumberResponse
export type OnBlockNumber = (
  blockNumber: OnBlockNumberResponse,
  prevBlockNumber: OnBlockNumberResponse | undefined,
) => void

export type WatchBlockNumberArgs = {
  /** Whether or not to emit the missed block numbers to the callback. */
  emitMissed?: boolean
  /** Whether or not to emit the latest block number to the callback when the subscription opens. */
  emitOnBegin?: boolean
  /** The callback to call when a new block number is received. */
  onBlockNumber: OnBlockNumber
  /** The callback to call when an error occurred when trying to get for a new block. */
  onError?: (error: Error) => void
  /** Polling frequency (in ms). Defaults to Client's pollingInterval config. */
  pollingInterval?: number
}

/** @description Watches and returns incoming block numbers. */
export function watchBlockNumber(
  client: PublicClient,
  {
    emitOnBegin = false,
    emitMissed = false,
    onBlockNumber,
    onError,
    pollingInterval = client.pollingInterval,
  }: WatchBlockNumberArgs,
) {
  const observerId = JSON.stringify(['watchBlockNumber', client.uid])

  let prevBlockNumber: GetBlockNumberResponse | undefined

  return observe(observerId, { onBlockNumber, onError }, (emit) =>
    poll(
      async () => {
        try {
          const blockNumber = await getBlockNumber(client, { maxAge: 0 })

          if (prevBlockNumber) {
            // If the current block number is the same as the previous,
            // we can skip.
            if (blockNumber === prevBlockNumber) return

            // If we have missed out on some previous blocks, and the
            // `emitMissed` flag is truthy, let's emit those blocks.
            if (blockNumber - prevBlockNumber > 1 && emitMissed) {
              for (let i = prevBlockNumber + 1n; i < blockNumber; i++) {
                emit.onBlockNumber(i, prevBlockNumber)
                prevBlockNumber = i
              }
            }
          }
          prevBlockNumber = blockNumber
          emit.onBlockNumber(blockNumber, prevBlockNumber)
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
