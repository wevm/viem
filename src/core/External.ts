/**
 * Viem-owned names for third-party types that appear in Viem's public signatures.
 *
 * A consumer that re-exports an inferred Viem value has to emit its own declaration for
 * it. TypeScript can only write down a type it can name through a module the consumer
 * can resolve, and it consults the consumer's own `package.json` dependencies to decide.
 * A consumer depends on `viem`, not on `ox` or `abitype`, so any type reaching those
 * packages is unnameable and the emit fails with `TS2742` (`TS2883` on TypeScript 7):
 *
 * ```ts
 * export const client = Client.create({ chain: mainnet, transport: http() })
 * //           ^ cannot be named without a reference to 'ox/Block'
 * ```
 *
 * Re-exporting each type under a Viem-owned name gives the emitter something portable to
 * write. These have to be flat named exports: a `export * as Namespace` re-export leaves
 * the members invisible to the emitter's name resolution, which is why the rest of
 * Viem's namespace-shaped surface needs the `viem/_types/*` subpath instead.
 *
 * These names are public API. Add to them only when `environments/tsc/declaration`
 * reports a new third-party leak, and prefer removing the leak from the signature.
 */

import type * as ox_TempoTransaction from 'ox/tempo/Transaction'
import type * as ox_TxEnvelope from 'ox/TxEnvelope'
import type * as ox_TxEnvelopeTempo from 'ox/tempo/TxEnvelopeTempo'

// `TypedData` needs a name of its own, not just its members. It is defined as a
// flattened intersection, and when the emitter writes it out structurally the result is
// self-contradictory (`TS2413`: `address[${string}]: undefined` against a `string` index
// signature of `readonly TypedDataParameter[]`). Naming it keeps it unexpanded.
export type {
  Abi,
  TypedDataDomain,
  TypedDataParameter,
  TypedDataType,
} from 'abitype'
// From `ox`, not `abitype`: `ox` re-aliases it (`type TypedData = abitype.TypedData`)
// rather than re-exporting, so the two are distinct symbols and Viem's signatures
// reference `ox`'s.
export type { TypedData } from 'ox/TypedData'
export type { AbiEvent, Name as AbiEventName } from 'ox/AbiEvent'
export type { Rpc as AccountProofRpc } from 'ox/AccountProof'
export type { Identifier as BlockIdentifier, Tag as BlockTag } from 'ox/Block'
export type { Rpc as BlockOverridesRpc } from 'ox/BlockOverrides'
export type { FeeValuesType } from 'ox/Fee'
export type { Rpc as FilterRpc } from 'ox/Filter'
export type { Kzg } from 'ox/Kzg'
export type { AccountOverrides } from 'ox/StateOverrides'
export type { Rpc as TransactionRpc, Transaction } from 'ox/Transaction'
export type {
  Rpc as TransactionReceiptRpc,
  RpcStatus as TransactionReceiptRpcStatus,
  RpcType as TransactionReceiptRpcType,
  Status as TransactionReceiptStatus,
  TransactionReceipt,
  Type as TransactionReceiptType,
} from 'ox/TransactionReceipt'
export type { TxEnvelope } from 'ox/TxEnvelope'
export type { Withdrawal } from 'ox/Withdrawal'

// Nested inside a function namespace, so it needs an alias rather than a re-export.
// Reachable through a Chain's `serializers`.
export type TxEnvelopeSerializeOptions = ox_TxEnvelope.serialize.Options
export type TempoTxEnvelopeSerializeOptions =
  ox_TxEnvelopeTempo.serialize.Options

// Declared as aliases, not renamed re-exports. A renamed re-export leaves the original
// symbol in place, so the emitter resolves through it and writes the original name:
// `ox/tempo/Transaction`'s `Transaction` comes out as `import("viem").Transaction`, which
// silently resolves to the non-Tempo type. An alias is a distinct symbol, so the emitter
// writes the name Viem actually exports. Viem's own signatures must reference these.
//
// Tempo receipt types are handled differently: `ox` flattens them, so their internals
// leak structurally where no Viem signature can interpose. They get un-renamed re-export
// shims instead (`src/tempo/internal/oxTransactionReceipt.ts`), addressable through
// `viem/_types/*` without adding public names here.
export type TempoTransaction = ox_TempoTransaction.Transaction
export type TempoTransactionRpc = ox_TempoTransaction.Rpc
