// biome-ignore lint/performance/noBarrelFile: entrypoint module

/** Creates a {@link Transport} from an EIP-1193-compatible provider. */
export { custom } from '../core/transports/custom.js'

/** Creates a {@link Transport} that falls through a list of transports. */
export { fallback } from '../core/transports/fallback.js'

/** Creates an HTTP JSON-RPC transport. */
export { http } from '../core/transports/http.js'

/** Creates a WebSocket JSON-RPC transport. */
export { webSocket } from '../core/transports/webSocket.js'

/** Standalone ERC-4337 actions grouped by namespace (`entryPoint`, `paymaster`, `userOperation`). */
export * as Actions from './actions/index.js'

/** A Client configured for an ERC-4337 Bundler. */
export * as BundlerClient from './BundlerClient.js'

/** Coinbase Smart Account implementation. */
export * as CoinbaseSmartAccount from './CoinbaseSmartAccount.js'

/** Utilities & types for WebAuthn credentials. Re-exports `ox/webauthn`. */
export * as Credential from './Credential.js'

/** ERC-4337 account abstraction action decorator for a Client's `.extend`. */
export {
  type Decorator as AccountAbstractionActions,
  accountAbstractionActions,
} from './Decorator.js'

/** Utilities & types for the ERC-4337 EntryPoint contract. Re-exports `ox/erc4337`. */
export * as EntryPoint from './EntryPoint.js'

/** ERC-4337 errors (EntryPoint reverts, User Operation validation failures, …). */
export * from './errors.js'

/** A Client configured for an ERC-7677 Paymaster service. */
export * as PaymasterClient from './PaymasterClient.js'

/** Simple7702 Smart Account implementation. */
export * as Simple7702SmartAccount from './Simple7702SmartAccount.js'

/** Utilities & types for creating & using Smart Accounts. */
export * as SmartAccount from './SmartAccount.js'

/** Solady Smart Account implementation. */
export * as SoladySmartAccount from './SoladySmartAccount.js'

/** Utilities & types for User Operations. */
export * as UserOperation from './UserOperation.js'

/** Utilities & types for User Operation gas estimates. Re-exports `ox/erc4337`. */
export * as UserOperationGas from './UserOperationGas.js'

/** Utilities & types for User Operation receipts. Re-exports `ox/erc4337`. */
export * as UserOperationReceipt from './UserOperationReceipt.js'

/** An owner account backed by a WebAuthn P256 credential. */
export * as WebAuthnAccount from './WebAuthnAccount.js'
