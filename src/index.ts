/**
 * Utilities & types for working with Accounts: local signers (private key,
 * HD key, mnemonic, custom) and json-rpc accounts referenced by address.
 *
 * @example
 * ```ts
 * import { Account } from 'viem'
 *
 * const account = Account.fromPrivateKey('0x…')
 * ```
 */
export * as Account from './core/Account.js'

/**
 * Standalone actions callable with a {@link Client}, grouped by namespace
 * (`address`, `block`, `transaction`, `token`, …). `Actions.getAction`
 * resolves Client-attached action overrides for nested action dispatch.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({ chain: mainnet, transport: http() })
 * const blockNumber = await Actions.block.getNumber(client)
 * ```
 */
export * as Actions from './core/actions/index.js'

/**
 * Action decorators for {@link Client}'s `.extend`: public (read), wallet
 * (sign & send), test (anvil/hardhat), and ERC-7821 batch execution actions.
 *
 * @example
 * ```ts
 * import { Client, http, publicActions } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(publicActions())
 * const blockNumber = await client.block.getNumber()
 * ```
 */
export {
  erc7821Actions,
  publicActions,
  testActions,
  walletActions,
} from './core/actions/index.js'

/**
 * Canonical contract addresses shared across EVM chains.
 *
 * @example
 * ```ts
 * import { Addresses } from 'viem'
 *
 * const deployer = Addresses.create2
 * ```
 */
export * as Addresses from './core/Addresses.js'

/**
 * Types for typed wallet capabilities exchanged over RPC. Augment the
 * `Register` interface to type capabilities per RPC method.
 */
export * as Capabilities from './core/Capabilities.js'

/**
 * Utilities & types for defining and working with EVM chains.
 *
 * @example
 * ```ts
 * import { Chain } from 'viem'
 *
 * const mainnet = Chain.from({
 *   id: 1,
 *   name: 'Ethereum',
 *   nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
 *   rpcUrls: { http: 'https://eth.merkle.io' },
 * })
 * ```
 */
export * as Chain from './core/Chain.js'

/**
 * The Viem Client: the composition root binding a {@link Chain}, a
 * {@link Transport}, and an optional {@link Account}. Extend it with action
 * decorators via `.extend`.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({ chain: mainnet, transport: http() })
 * ```
 */
export * as Client from './core/Client.js'

/**
 * Type-safe contract instances bound to an ABI, address, and {@link Client}.
 *
 * @example
 * ```ts
 * import { Client, Contract, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { Abi } from 'viem/utils'
 *
 * const client = Client.create({ chain: mainnet, transport: http() })
 * const contract = Contract.from({
 *   abi: Abi.from([
 *     'function balanceOf(address owner) view returns (uint256)',
 *   ]),
 *   address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
 *   client,
 * })
 * ```
 */
export * as Contract from './core/Contract.js'

/**
 * Errors thrown while executing contract functions, with revert data decoded
 * against the contract ABI.
 */
export * as ContractError from './core/ContractError.js'

/**
 * Viem's {@link Errors.BaseError} class (the base of all Viem errors) and
 * error configuration.
 */
export * as Errors from './core/Errors.js'

/**
 * Manages and auto-increments transaction nonces for an {@link Account}.
 *
 * @example
 * ```ts
 * import { Account, NonceManager } from 'viem'
 *
 * const account = Account.fromPrivateKey('0x…', {
 *   nonceManager: NonceManager.jsonRpc(),
 * })
 * ```
 */
export * as NonceManager from './core/NonceManager.js'

/**
 * Node (execution) error taxonomy: failure modes a JSON-RPC node surfaces when
 * validating or executing a transaction, mapped from the raw RPC error.
 */
export * as RpcError from './core/RpcError.js'

/**
 * Utilities & types for declaring tokens with shared metadata and per-chain
 * contract addresses.
 *
 * @example
 * ```ts
 * import { Token } from 'viem'
 *
 * const usdc = Token.from({
 *   addresses: { 1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
 *   currency: 'USD',
 *   decimals: 6,
 *   symbol: 'USDC',
 * })
 * ```
 */
export * as Token from './core/Token.js'

/**
 * The Transport interface carrying JSON-RPC requests for a {@link Client},
 * plus the built-in transports and their errors.
 */
export * as Transport from './core/Transport.js'

/**
 * Built-in transports: `http`, `webSocket`, and `custom` (EIP-1193), plus the
 * `fallback`, `loadBalance`, and `rateLimit` wrappers.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({ chain: mainnet, transport: http() })
 * ```
 */
export {
  custom,
  fallback,
  http,
  loadBalance,
  rateLimit,
  webSocket,
} from './core/Transport.js'
