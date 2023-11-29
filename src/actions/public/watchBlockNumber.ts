import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { GetTransportConfig } from '../../types/transport.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { getAction } from '../../utils/getAction.js'
import { observe } from '../../utils/observe.js'
import { type PollErrorType, poll } from '../../utils/poll.js'
import { stringify } from '../../utils/stringify.js'

import {
  type GetBlockNumberReturnType,
  getBlockNumber,
} from './getBlockNumber.js'

export type OnBlockNumberParameter = GetBlockNumberReturnType
export type OnBlockNumberFn = (
  blockNumber: OnBlockNumberParameter,
  prevBlockNumber: OnBlockNumberParameter | undefined,
) => void

export type PollOptions = {
  /** Whether or not to emit the missed block numbers to the callback. */
  emitMissed?: boolean
  /** Whether or not to emit the latest block number to the callback when the subscription opens. */
  emitOnBegin?: boolean
  /** Polling frequency (in ms). Defaults to Client's pollingInterval config. */
  pollingInterval?: number
}

export type WatchBlockNumberParameters<
  TTransport extends Transport = Transport,
> = {
  /** The callback to call when a new block number is received. */
  onBlockNumber: OnBlockNumberFn
  /** The callback to call when an error occurred when trying to get for a new block. */
  onError?: (error: Error) => void
} & (GetTransportConfig<TTransport>['type'] extends 'webSocket'
  ?
      | {
          emitMissed?: never
          emitOnBegin?: never
          /** Whether or not the WebSocket Transport should poll the JSON-RPC, rather than using `eth_subscribe`. */
          poll?: false
          pollingInterval?: never
        }
      | (PollOptions & { poll: true })
  : PollOptions & { poll?: true })

export type WatchBlockNumberReturnType = () => void

export type WatchBlockNumberErrorType = PollErrorType | ErrorType

/**
 * Watches and returns incoming block numbers.
 *
 * - Docs: https://viem.sh/docs/actions/public/watchBlockNumber.html
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/blocks/watching-blocks
 * - JSON-RPC Methods:
 *   - When `poll: true`, calls [`eth_blockNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blocknumber) on a polling interval.
 *   - When `poll: false` & WebSocket Transport, uses a WebSocket subscription via [`eth_subscribe`](https://docs.alchemy.com/reference/eth-subscribe-polygon) and the `"newHeads"` event.
 *
 * @param client - Client to use
 * @param parameters - {@link WatchBlockNumberParameters}
 * @returns A function that can be invoked to stop watching for new block numbers. {@link WatchBlockNumberReturnType}
 *
 * @example
 * import { createPublicClient, watchBlockNumber, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const unwatch = watchBlockNumber(client, {
 *   onBlockNumber: (blockNumber) => console.log(blockNumber),
 * })
 */
export function watchBlockNumber<
  TChain extends Chain | undefined,
  TTransport extends Transport,
>(
  client: Client<TTransport, TChain>,
  {
    emitOnBegin = false,
    emitMissed = false,
    onBlockNumber,
    onError,
    poll: poll_,
    pollingInterval = client.pollingInterval,
  }: WatchBlockNumberParameters<TTransport>,
): WatchBlockNumberReturnType {
  const enablePolling =
    typeof poll_ !== 'undefined' ? poll_ : client.transport.type !== 'webSocket'

  let prevBlockNumber: GetBlockNumberReturnType | undefined

  const pollBlockNumber = () => {
    const observerId = stringify([
      'watchBlockNumber',
      client.uid,
      emitOnBegin,
      emitMissed,
      pollingInterval,
    ])

    return observe(observerId, { onBlockNumber, onError }, (emit) =>
      poll(
        async () => {
          try {
            const blockNumber = await getAction(
              client,
              getBlockNumber,
              'getBlockNumber',
            )({ cacheTime: 0 })

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

  const subscribeBlockNumber = () => {
    let active = true
    let unsubscribe = () => (active = false)
    ;(async () => {
      try {
        const { unsubscribe: unsubscribe_ } = await client.transport.subscribe({
          params: ['newHeads'],
          onData(data: any) {
            if (!active) return
            const blockNumber = hexToBigInt(data.result?.number)
            onBlockNumber(blockNumber, prevBlockNumber)
            prevBlockNumber = blockNumber
          },
          onError(error: Error) {
            onError?.(error)
          },
        })
        unsubscribe = unsubscribe_
        if (!active) unsubscribe()
      } catch (err) {
        onError?.(err as Error)
      }
    })()
    return unsubscribe
  }

  return enablePolling ? pollBlockNumber() : subscribeBlockNumber()
}
