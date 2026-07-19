import { RpcResponse } from 'ox'

import type ReconnectingWebSocket from '../../vendor/partysocket/ws.js'
import * as RpcClient from '../../utils/RpcClient.js'
import * as Transport from '../Transport.js'

/** A live WebSocket JSON-RPC client. */
export type WebSocketRpcClient = RpcClient.Socket<ReconnectingWebSocket>

/** A WebSocket JSON-RPC {@link Transport}. */
export type WebSocket = Transport.Transport<
  'webSocket',
  {
    getRpcClient(): Promise<WebSocketRpcClient>
    subscribe: RpcClient.Socket.subscribe.Fn
  }
>

/**
 * Creates a WebSocket JSON-RPC transport with automatic reconnection. When no
 * `url` is provided, falls back to the chain's default WebSocket RPC URL.
 *
 * @example
 * ```ts
 * import { Client, webSocket } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: webSocket('wss://eth.merkle.io/ws'),
 * })
 * ```
 */
export function webSocket(
  url?: string | undefined,
  options: webSocket.Options = {},
): WebSocket {
  return Transport.from({
    key: options.key ?? 'webSocket',
    name: options.name ?? 'WebSocket JSON-RPC',
    type: 'webSocket',
    setup({ chain, retryCount, timeout }) {
      const urls = chain?.rpcUrls?.ws
      const url_ = url ?? (typeof urls === 'string' ? urls : urls?.[0])
      if (!url_) throw new Transport.UrlRequiredError()

      const timeout_ = options.timeout ?? timeout ?? 10_000

      const getRpcClient = () =>
        RpcClient.webSocket(url_, {
          keepAlive: options.keepAlive ?? true,
          reconnect: options.reconnect ?? true,
        })

      return {
        methods: options.methods,
        retryCount: options.retryCount ?? retryCount,
        retryDelay: options.retryDelay,
        timeout: timeout_,
        getRpcClient,
        async subscribe(options: RpcClient.Socket.subscribe.Options) {
          const client = await getRpcClient()
          return client.subscribe(options)
        },
        async request(body) {
          const client = await getRpcClient()
          const { error, result } = await client.request({
            body,
            timeout: timeout_,
          })
          if (error) throw RpcResponse.parseError(error)
          return result
        },
      }
    },
  })
}

export declare namespace webSocket {
  type Options = {
    /** Whether to send keep-alive messages. @default true */
    keepAlive?: RpcClient.KeepAlive | undefined
    /** Whether (and how) to reconnect on socket closure. @default true */
    reconnect?: boolean | RpcClient.webSocket.ReconnectOptions | undefined

    /** Transport key. @default 'webSocket' */
    key?: string | undefined
    /** RPC methods to include or exclude. */
    methods?: { include?: string[] } | { exclude?: string[] } | undefined
    /** Transport name. @default 'WebSocket JSON-RPC' */
    name?: string | undefined
    /** Max retries per request. @default 3 */
    retryCount?: number | undefined
    /** Base delay (ms) between retries. @default 150 */
    retryDelay?: number | undefined
    /** Request timeout (ms). @default 10_000 */
    timeout?: number | undefined
  }
}
