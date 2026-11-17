/**
 * Un-renamed re-exports of `ox`'s internal type utilities that appear in inferred
 * ERC-4337 client types, so a consumer's declaration emit can name them.
 *
 * `ox/erc4337`'s `UserOperation` and `UserOperation.Rpc` are `OneOf<...>` instantiations,
 * and the emitter preserves the alias reference, so it must name `OneOf` itself. Viem's
 * own `OneOf` (`core/internal/types.ts`) is a distinct symbol and cannot serve. These
 * re-exports are the same symbols, and this module is addressable through
 * `viem/_types/*`, which closes the chain. See `src/tempo/internal/oxTransactionReceipt.ts`
 * for the pattern.
 */
export type { KeyofUnion, OneOf } from 'ox/_types/core/internal/types'
