import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { HasTransportType } from '../../types/transport.js'
import { formatBlock } from '../../utils/formatters/block.js'
import { observe } from '../../utils/observe.js'
import { type StringifyErrorType, stringify } from '../../utils/stringify.js'

import type { GetBlockReturnType } from './getBlock.js'

const blockFields = [
  'size',
  'totalDifficulty',
  'transactions',
  'uncles',
  'withdrawals',
] as const

export type BlockHeader<chain extends Chain | undefined = Chain> = Omit<
  GetBlockReturnType<chain, false, 'latest'>,
  (typeof blockFields)[number]
>

export type OnBlockHeaderParameter<chain extends Chain | undefined = Chain> =
  BlockHeader<chain>

export type OnBlockHeader<chain extends Chain | undefined = Chain> = (
  blockHeader: OnBlockHeaderParameter<chain>,
  prevBlockHeader: OnBlockHeaderParameter<chain> | undefined,
) => void

export type WatchBlockHeadersParameters<
  chain extends Chain | undefined = Chain,
> = {
  /** The callback to call when a new block header is received. */
  onBlockHeader: OnBlockHeader<chain>
  /** The callback to call when an error occurs while watching block headers. */
  onError?: ((error: Error) => void) | undefined
}

export type WatchBlockHeadersReturnType = () => void

export type WatchBlockHeadersErrorType = StringifyErrorType | ErrorType

/**
 * Watches and returns incoming block headers.
 *
 * - Docs: https://viem.sh/docs/actions/public/watchBlockHeaders
 * - JSON-RPC Methods: Uses a WebSocket or IPC subscription via [`eth_subscribe`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_subscribe) and the `"newHeads"` event.
 *
 * @param client - Client to use
 * @param parameters - {@link WatchBlockHeadersParameters}
 * @returns A function that can be invoked to stop watching for new block headers. {@link WatchBlockHeadersReturnType}
 *
 * @example
 * import { createPublicClient, webSocket } from 'viem'
 * import { watchBlockHeaders } from 'viem/actions'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: webSocket(),
 * })
 * const unwatch = watchBlockHeaders(client, {
 *   onBlockHeader: (blockHeader) => console.log(blockHeader),
 * })
 */
export function watchBlockHeaders<
  transport extends Transport,
  chain extends Chain | undefined,
>(
  client: Client<transport, chain>,
  {
    onBlockHeader,
    onError,
  }: HasTransportType<transport, 'webSocket' | 'ipc'> extends true
    ? WatchBlockHeadersParameters<chain>
    : never,
): WatchBlockHeadersReturnType {
  let prevBlockHeader: OnBlockHeaderParameter<chain> | undefined

  const observerId = stringify(['watchBlockHeaders', client.uid])

  return observe(observerId, { onBlockHeader, onError }, (emit) => {
    let active = true
    let subscribed = false
    let unsubscribe = () => (active = false)
    ;(async () => {
      try {
        const transport = (() => {
          if (client.transport.type === 'fallback') {
            const transport = client.transport.transports.find(
              (transport: ReturnType<Transport>) =>
                transport.config.type === 'webSocket' ||
                transport.config.type === 'ipc',
            )
            if (!transport) return client.transport
            return transport.value
          }
          return client.transport
        })()

        const { unsubscribe: unsubscribe_ } = await transport.subscribe({
          params: ['newHeads'],
          onData(data: any) {
            if (!active) return
            const blockHeader = (
              client.chain?.formatters?.block?.format || formatBlock
            )(data.result, 'watchBlockHeaders')
            for (const field of blockFields) delete blockHeader[field]
            emit.onBlockHeader(
              blockHeader as OnBlockHeaderParameter<chain>,
              prevBlockHeader,
            )
            prevBlockHeader = blockHeader as OnBlockHeaderParameter<chain>
          },
          onError(error: Error) {
            if (subscribed) emit.onError?.(error)
          },
        })
        subscribed = true
        unsubscribe = unsubscribe_
        if (!active) unsubscribe()
      } catch (err) {
        emit.onError?.(err as Error)
      }
    })()
    return () => unsubscribe()
  })
}
