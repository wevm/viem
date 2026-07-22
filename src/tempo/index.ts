// biome-ignore lint/performance/noBarrelFile: entrypoint module

/** Tempo domain primitives, re-exported from `ox/tempo`. */
export {
  Channel,
  EarnShares,
  KeyAuthorization,
  MultisigConfig,
  Period,
  ReceivePolicyReceipt,
  SignatureEnvelope,
  Tick,
  TokenRole,
  VirtualAddress,
  VirtualMaster,
  ZoneId,
  ZoneRpcAuthentication,
} from 'ox/tempo'

/** Creates a {@link Transport} from an EIP-1193-compatible provider. */
export { custom } from '../core/transports/custom.js'

/** Creates a {@link Transport} that falls through a list of transports. */
export { fallback } from '../core/transports/fallback.js'

/** Creates an HTTP JSON-RPC transport. */
export { http } from '../core/transports/http.js'

/** Creates a WebSocket JSON-RPC transport. */
export { webSocket } from '../core/transports/webSocket.js'

/** ABIs of the Tempo precompiles and Earn contracts. */
export * as Abis from './Abis.js'

/** Utilities & types for Tempo accounts: root signers & access keys. */
export * as Account from './Account.js'

/** Standalone Tempo actions grouped by namespace (`token`, `amm`, `dex`, …). */
export * as Actions from './actions/index.js'

/** Addresses of the Tempo precompiles. */
export * as Addresses from './Addresses.js'

/** Tempo wallet capability schema types. */
export * as Capabilities from './Capabilities.js'

/** Tempo chain definitions (mainnet, moderato, devnet, localnet). */
export * as Chain from './Chain.js'

/** A Tempo Client: the base Client decorated with public, wallet, and Tempo actions. */
export * as Client from './Client.js'

/** Tempo action decorator for a Client's `.extend`. */
export { type Decorator as TempoActions, tempoActions } from './Decorator.js'

/** Tempo errors. */
export * from './errors.js'

/** Helpers producing unix timestamps for key expiries. */
export * as Expiry from './Expiry.js'

/** Tempo hardforks & activation helpers. */
export * as Hardfork from './Hardfork.js'

/** Store for signed key authorizations. */
export * as KeyAuthorizationManager from './KeyAuthorizationManager.js'

/** P256 (secp256r1) key utilities. Re-exports `ox/P256`. */
export * as P256 from './P256.js'

/** Call scopes restricting access keys to targets & selectors. */
export * as Scopes from './Scopes.js'

/** Function selectors of the Tempo precompile ABIs. */
export * as Selectors from './Selectors.js'

/** Minimal async key-value storages (memory, session). */
export * as Storage from './Storage.js'

/** Relay transport: routes fee sponsorship traffic to a fee payer service. */
export { type Relay, withRelay } from './Transport.js'

/** WebAuthn P256 credential creation & signing. */
export * as WebAuthnP256 from './WebAuthnP256.js'

/** WebCrypto-backed P256 key pairs. Re-exports `ox/WebCryptoP256`. */
export * as WebCryptoP256 from './WebCryptoP256.js'
