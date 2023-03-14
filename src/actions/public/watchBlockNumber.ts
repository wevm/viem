import type { PublicClient } from '../../clients'
import { observe } from '../../utils/observe'
import { poll } from '../../utils/poll'
import type { GetBlockNumberReturnType } from './getBlockNumber'
import { getBlockNumber } from './getBlockNumber'

export type OnBlockNumberParameter = GetBlockNumberReturnType
export type OnBlockNumberFn = (
  blockNumber: OnBlockNumberParameter,
  prevBlockNumber: OnBlockNumberParameter | undefined,
) => void

export type WatchBlockNumberParameters = {
  /** Whether or not to emit the missed block numbers to the callback. */
  emitMissed?: boolean
  /** Whether or not to emit the latest block number to the callback when the subscription opens. */
  emitOnBegin?: boolean
  /** The callback to call when a new block number is received. */
  onBlockNumber: OnBlockNumberFn
  /** The callback to call when an error occurred when trying to get for a new block. */
  onError?: (error: Error) => void
  /** Polling frequency (in ms). Defaults to Client's pollingInterval config. */
  pollingInterval?: number
}

/** @description Watches and returns incoming block numbers. */
export function watchBlockNumber(
  client: PublicClient<any, any, any>,
  {
    emitOnBegin = false,
    emitMissed = false,
    onBlockNumber,
    onError,
    pollingInterval = client.pollingInterval,
  }: WatchBlockNumberParameters,
) {
  const observerId = JSON.stringify([
    'watchBlockNumber',
    client.uid,
    emitOnBegin,
    emitMissed,
    pollingInterval,
  ])

  let prevBlockNumber: GetBlockNumberReturnType | undefined

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

          // If the next block number is greater than the previous,
          // it is not in the past, and we can emit the new block number.
          if (!prevBlockNumber || blockNumber > prevBlockNumber) {
            emit.onBlockNumber(blockNumber, prevBlockNumber)
            prevBlockNumber = blockNumber
          }
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
