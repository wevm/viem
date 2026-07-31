/**
 * Un-renamed re-exports of `ox/tempo/TransactionReceipt`'s types, so a consumer's
 * declaration emit can name them.
 *
 * `ox` defines the Tempo receipt as a flattened generic (`Compute<...>`) whose defaults
 * reference the module-local `Type`, `RpcType`, and `Status`. When an inferred Chain
 * carries an instantiation of it, the emitter must name those original symbols; a
 * consumer cannot (it does not depend on `ox`), and Viem-owned aliases are distinct
 * symbols so they do not serve. Re-exports are the same symbols, and this module is
 * addressable through `viem/_types/*`, which closes the chain.
 *
 * Un-renamed matters: for a renamed re-export the emitter writes the original name
 * against the re-exporting module, producing a reference that does not resolve.
 */
export type {
  Rpc,
  RpcStatus,
  RpcType,
  Status,
  TransactionReceipt,
  Type,
} from 'ox/tempo/TransactionReceipt'
