/** @entrypointCategory Utilities */
// biome-ignore lint/complexity/noUselessEmptyExport: tsdoc
export type {}

/**
 * Utilities & types for working with [EIP-1193 Providers](https://eips.ethereum.org/EIPS/eip-1193)
 *
 * @example
 * ### Instantiating External Providers
 *
 * External EIP-1193 Providers can be instantiated with `Provider.from`:
 *
 * ```ts twoslash
 * import 'viem/window'
 * import { Provider } from 'viem/utils'
 *
 * const provider = Provider.from(window.ethereum)
 *
 * const blockNumber = await provider.request({ method: 'eth_blockNumber' })
 * ```
 *
 * :::tip
 *
 * There are also libraries that distribute EIP-1193 Provider objects that you can use with `Provider.from`:
 *
 * - [`@walletconnect/ethereum-provider`](https://www.npmjs.com/package/\@walletconnect/ethereum-provider)
 *
 * - [`@coinbase/wallet-sdk`](https://www.npmjs.com/package/\@coinbase/wallet-sdk)
 *
 * - [`@metamask/detect-provider`](https://www.npmjs.com/package/\@metamask/detect-provider)
 *
 * - [`@safe-global/safe-apps-provider`](https://github.com/safe-global/safe-apps-sdk/tree/main/packages/safe-apps-provider)
 *
 * - [`mipd`](https://github.com/wevm/mipd): EIP-6963 Multi Injected Providers
 *
 * :::
 *
 * @example
 * ### Instantiating a Provider with Events
 *
 * Event emitters for EIP-1193 Providers can be created using `Provider.createEmitter`:
 *
 * Useful for Wallets that distribute an EIP-1193 Provider (e.g. webpage injection via `window.ethereum`).
 *
 * ```ts twoslash
 * // @noErrors
 * import { Provider, RpcRequest, RpcResponse } from 'viem/utils'
 *
 * // 1. Instantiate a Provider Emitter.
 * const emitter = Provider.createEmitter() // [!code ++]
 *
 * const store = RpcRequest.createStore()
 *
 * const provider = Provider.from({
 *   // 2. Pass the Emitter to the Provider.
 *   ...emitter, // [!code ++]
 *   async request(args) {
 *     return await fetch('https://1.rpc.thirdweb.com', {
 *       body: JSON.stringify(store.prepare(args)),
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *       },
 *     })
 *       .then((res) => res.json())
 *       .then(RpcResponse.parse)
 *   },
 * })
 *
 * // 3. Emit Provider Events.
 * emitter.emit('accountsChanged', ['0x...']) // [!code ++]
 * ```
 *
 * @category Providers
 */
export * as Provider from './Provider.js'

/**
 * Utility functions and types for working with asynchronous JSON-RPC transports.
 *
 * @example
 * ### HTTP Instantiation
 *
 * ```ts twoslash
 * import { RpcAsync } from 'viem/utils'
 *
 * const rpc = RpcAsync.fromHttp('https://1.rpc.thirdweb.com')
 *
 * const response = await rpc.request({ method: 'eth_blockNumber' })
 * ```
 *
 * @category JSON-RPC
 */
export * as RpcAsync from './RpcAsync.js'

/**
 * Utility types & functions for working with [JSON-RPC 2.0 Requests](https://www.jsonrpc.org/specification#request_object) and Ethereum JSON-RPC methods as
 * defined on the [Ethereum API specification](https://github.com/ethereum/execution-apis)
 *
 * @example
 * ### Instantiating a Request Store
 *
 * A Request Store can be instantiated using `RpcRequest.createStore`:
 *
 * ```ts twoslash
 * import { RpcRequest } from 'viem/utils'
 *
 * const store = RpcRequest.createStore()
 *
 * const request_1 = store.prepare({
 *   method: 'eth_blockNumber',
 * })
 * // @log: { id: 0, jsonrpc: '2.0', method: 'eth_blockNumber' }
 *
 * const request_2 = store.prepare({
 *   method: 'eth_call',
 *   params: [
 *     {
 *       to: '0x0000000000000000000000000000000000000000',
 *       data: '0xdeadbeef',
 *     },
 *   ],
 * })
 * // @log: { id: 1, jsonrpc: '2.0', method: 'eth_call', params: [{ to: '0x0000000000000000000000000000000000000000', data: '0xdeadbeef' }] }
 * ```
 *
 * @category JSON-RPC
 */
export * as RpcRequest from './RpcRequest.js'

/**
 * Utility types & functions for working with [JSON-RPC 2.0 Responses](https://www.jsonrpc.org/specification#response_object)
 *
 * @example
 * ### Instantiating an RPC Response
 *
 * RPC Responses can be instantiated using `RpcResponse.from`:
 *
 * ```ts twoslash
 * import { RpcResponse } from 'viem/utils'
 *
 * const response = RpcResponse.from({
 *   id: 0,
 *   jsonrpc: '2.0',
 *   result: '0x69420',
 * })
 * ```
 *
 * :::note
 *
 * Type-safe instantiation from a `request` object is also supported. If a `request` is provided, then the `id` and `jsonrpc` properties will be overridden with the values from the request.
 *
 * ```ts twoslash
 * import { RpcRequest, RpcResponse } from 'viem/utils'
 *
 * const request = RpcRequest.from({ id: 0, method: 'eth_blockNumber' })
 *
 * const response = RpcResponse.from(
 *   { result: '0x69420' },
 *   { request },
 * )
 * ```
 *
 * :::
 *
 * @example
 * ### Parsing an RPC Response
 *
 * RPC Responses can be parsed using `RpcResponse.parse`:
 *
 * ```ts twoslash
 * import { RpcRequest, RpcResponse } from 'viem/utils'
 *
 * // 1. Create a request store.
 * const store = RpcRequest.createStore()
 *
 * // 2. Get a request object.
 * const request = store.prepare({
 *   method: 'eth_getBlockByNumber',
 *   params: ['0x1', false],
 * })
 *
 * // 3. Send the JSON-RPC request via HTTP.
 * const block = await fetch('https://1.rpc.thirdweb.com', {
 *   body: JSON.stringify(request),
 *   headers: {
 *     'Content-Type': 'application/json',
 *   },
 *   method: 'POST',
 * })
 *  .then((response) => response.json())
 *  // 4. Parse the JSON-RPC response into a type-safe result. // [!code focus]
 *  .then((response) => RpcResponse.parse(response, { request })) // [!code focus]
 *
 * block // [!code focus]
 * // ^?
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * ```
 *
 * @category JSON-RPC
 */
export * as RpcResponse from './RpcResponse.js'

/**
 * Utility functions and types for working with JSON-RPC transports.
 *
 * @category JSON-RPC
 */
export * as RpcTransport from './RpcTransport.js'

/**
 * Utility types for working with Ethereum JSON-RPC namespaces & schemas.
 *
 * @category JSON-RPC
 */
export * as RpcSchema from './RpcSchema.js'
