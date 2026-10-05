/**
 * Node.js cryptographic implementations backed by `node:crypto`.
 *
 * @example
 * ```ts
 * import { Engine } from 'viem/node'
 *
 * await Engine.install()
 * ```
 */
export { Engine } from 'ox/node'

/** File-system paths for KZG trusted setups. */
export { Paths } from 'ox/trusted-setups'

/** Creates an IPC JSON-RPC transport (Node only). */
export { ipc } from './transports/ipc.js'

/** IPC JSON-RPC transport types. */
export type { Ipc, IpcConnection, IpcRpcClient } from './transports/ipc.js'
