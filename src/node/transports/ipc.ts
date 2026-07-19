import { connect, type Socket as NetSocket } from 'node:net'

import { RpcResponse } from 'ox'

import { stringify } from '../../core/internal/stringify.js'
import * as RpcClient from '../../utils/RpcClient.js'
import * as Transport from '../../core/Transport.js'

/** The reconnecting IPC connection exposed by {@link IpcRpcClient}. */
export type IpcConnection = RpcClient.Connection & {
  /** The underlying `node:net` socket, when connected. */
  get socket(): NetSocket | undefined
}

/** A live IPC JSON-RPC client. */
export type IpcRpcClient = RpcClient.Socket<IpcConnection>

/** An IPC JSON-RPC {@link Transport}. */
export type Ipc = Transport.Transport<
  'ipc',
  {
    getRpcClient(): Promise<IpcRpcClient>
    subscribe: RpcClient.Socket.subscribe.Fn
  }
>

/**
 * Creates an IPC JSON-RPC transport (Node only) connected to the socket at
 * `path`.
 *
 * @example
 * ```ts
 * import { Client } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { ipc } from 'viem/node'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: ipc('/tmp/geth.ipc'),
 * })
 * ```
 */
export function ipc(path: string, options: ipc.Options = {}): Ipc {
  return Transport.from({
    key: options.key ?? 'ipc',
    name: options.name ?? 'IPC JSON-RPC',
    type: 'ipc',
    setup({ retryCount, timeout }) {
      const timeout_ = options.timeout ?? timeout ?? 10_000
      const keepAlive = options.keepAlive ?? true
      const reconnect = options.reconnect ?? true

      const getRpcClient = () =>
        RpcClient.fromSocket<IpcConnection>({
          cacheKey: stringify({ type: 'ipc', path, keepAlive, reconnect }),
          createConnection: createConnection(path, reconnect),
          keepAlive,
          reconnect: reconnect !== false,
          url: path,
        })

      return {
        methods: options.methods,
        retryCount: options.retryCount ?? retryCount,
        retryDelay: options.retryDelay,
        timeout: timeout_,
        getRpcClient,
        subscribe: async (
          subscribeOptions: RpcClient.Socket.subscribe.Options,
        ) => (await getRpcClient()).subscribe(subscribeOptions),
        async request({ method, params }) {
          const body: RpcClient.RpcRequest = { method, params }
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

export declare namespace ipc {
  type Options = {
    /** Whether to send keep-alive messages. @default true */
    keepAlive?: RpcClient.KeepAlive | undefined
    /** Whether (and how) to reconnect on socket closure. @default true */
    reconnect?: boolean | RpcClient.webSocket.ReconnectOptions | undefined

    /** Transport key. @default 'ipc' */
    key?: string | undefined
    /** RPC methods to include or exclude. */
    methods?: { include?: string[] } | { exclude?: string[] } | undefined
    /** Transport name. @default 'IPC JSON-RPC' */
    name?: string | undefined
    /** Max retries per request. @default 3 */
    retryCount?: number | undefined
    /** Base delay (ms) between retries. @default 150 */
    retryDelay?: number | undefined
    /** Request timeout (ms). @default 10_000 */
    timeout?: number | undefined
  }
}

const openingBrace = '{'.charCodeAt(0)
const closingBrace = '}'.charCodeAt(0)

/**
 * Extracts complete JSON messages from a (possibly partial) IPC buffer.
 *
 * @internal
 */
export function extractMessages(
  buffer: Buffer,
): [messages: Buffer[], remaining: Buffer] {
  const messages: Buffer[] = []

  let cursor = 0
  let level = 0
  for (let i = 0; i < buffer.length; i++) {
    if (buffer[i] === openingBrace) level++
    if (buffer[i] === closingBrace) level--
    if (level === 0) {
      const message = buffer.subarray(cursor, i + 1)
      if (
        message[0] === openingBrace &&
        message[message.length - 1] === closingBrace
      )
        messages.push(message)
      cursor = i + 1
    }
  }

  return [messages, buffer.subarray(cursor)]
}

const defaults = {
  connectionTimeout: 4_000,
  maxEnqueuedMessages: Number.POSITIVE_INFINITY,
  maxReconnectionDelay: 10_000,
  maxRetries: Number.POSITIVE_INFINITY,
  minReconnectionDelay: 3_000,
  minUptime: 5_000,
  reconnectionDelayGrowFactor: 1.3,
} as const

/** Builds a {@link RpcClient.CreateConnection} backed by a reconnecting `net.Socket`. */
function createConnection(
  path: string,
  reconnect: boolean | RpcClient.webSocket.ReconnectOptions,
): RpcClient.CreateConnection<IpcConnection> {
  const overrides = typeof reconnect === 'object' ? reconnect : {}
  const config = {
    connectionTimeout:
      overrides.connectionTimeout ?? defaults.connectionTimeout,
    maxEnqueuedMessages:
      overrides.maxEnqueuedMessages ?? defaults.maxEnqueuedMessages,
    maxReconnectionDelay:
      overrides.maxReconnectionDelay ?? defaults.maxReconnectionDelay,
    maxRetries:
      reconnect === false ? 0 : (overrides.maxRetries ?? defaults.maxRetries),
    minReconnectionDelay:
      overrides.minReconnectionDelay ?? defaults.minReconnectionDelay,
    minUptime: overrides.minUptime ?? defaults.minUptime,
    reconnectionDelayGrowFactor:
      overrides.reconnectionDelayGrowFactor ??
      defaults.reconnectionDelayGrowFactor,
  }

  return ({ onClose, onError, onOpen, onResponse }) => {
    let current: NetSocket | undefined
    let closed = false
    let retryCount = 0
    const queue: string[] = []
    let connectTimer: ReturnType<typeof setTimeout> | undefined
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined
    let uptimeTimer: ReturnType<typeof setTimeout> | undefined

    function clearTimers() {
      if (connectTimer) clearTimeout(connectTimer)
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (uptimeTimer) clearTimeout(uptimeTimer)
      connectTimer = reconnectTimer = uptimeTimer = undefined
    }

    function scheduleReconnect() {
      if (closed) return
      if (retryCount >= config.maxRetries) return
      const delay = Math.min(
        config.minReconnectionDelay *
          config.reconnectionDelayGrowFactor ** retryCount,
        config.maxReconnectionDelay,
      )
      retryCount++
      reconnectTimer = setTimeout(connectSocket, delay)
    }

    function connectSocket() {
      if (closed) return

      let settled = false
      let remaining = Buffer.alloc(0) as Buffer
      const netSocket = connect(path)
      current = netSocket

      connectTimer = setTimeout(() => {
        if (settled) return
        netSocket.destroy()
      }, config.connectionTimeout)

      const onConnected = () => {
        if (settled) return
        settled = true
        if (connectTimer) clearTimeout(connectTimer)
        // Reset the retry counter once the connection stays up.
        uptimeTimer = setTimeout(() => {
          retryCount = 0
        }, config.minUptime)
        // Flush any messages buffered while disconnected.
        while (queue.length > 0) netSocket.write(queue.shift() as string)
        onOpen()
      }

      const onData = (buffer: Buffer) => {
        const [messages, rest] = extractMessages(
          Buffer.concat([Uint8Array.from(remaining), Uint8Array.from(buffer)]),
        )
        for (const message of messages)
          onResponse(JSON.parse(Buffer.from(message).toString()))
        remaining = rest
      }

      const onSocketError = (error: Error) => onError(error)

      const onSocketClose = () => {
        netSocket.off('ready', onConnected)
        netSocket.off('data', onData)
        netSocket.off('error', onSocketError)
        netSocket.off('close', onSocketClose)
        if (connectTimer) clearTimeout(connectTimer)
        if (uptimeTimer) clearTimeout(uptimeTimer)
        if (current === netSocket) current = undefined
        onClose()
        scheduleReconnect()
      }

      netSocket.on('ready', onConnected)
      netSocket.on('data', onData)
      netSocket.on('error', onSocketError)
      netSocket.on('close', onSocketClose)
    }

    connectSocket()

    return {
      get socket() {
        return current
      },
      get readyState() {
        return current?.readyState === 'open' ? 1 : 3
      },
      send(data) {
        if (current && current.readyState === 'open') {
          current.write(data)
          return
        }
        // Buffer while (re)connecting, capped by `maxEnqueuedMessages`.
        if (queue.length < config.maxEnqueuedMessages) queue.push(data)
      },
      close() {
        closed = true
        clearTimers()
        current?.destroy()
        current = undefined
      },
    }
  }
}
