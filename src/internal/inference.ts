/**
 * Compiler-support exports that keep third-party types nameable while a consumer emits
 * its own declarations. Not part of Viem's API: every name is `z_`-prefixed and marked
 * `@deprecated` so editors sort it last and strike it out in autocomplete.
 *
 * A consumer that re-exports an inferred Viem value has to emit its own declaration for
 * it. TypeScript can only write down a type it can name through a module the consumer
 * resolves, and it consults the consumer's own `package.json` dependencies to decide. A
 * consumer depends on `viem`, not on `ox` or `abitype`, so any type reaching those
 * packages is unnameable and the emit fails with `TS2742` (`TS2883` on TypeScript 7):
 *
 * ```ts
 * export const client = Client.create({ chain: mainnet, transport: http() })
 * //           ^ cannot be named without a reference to 'ox/Block'
 * ```
 *
 * These must be re-exports (an alias is a distinct symbol and cannot serve) and must
 * land in an entrypoint's export table (via the barrels' `export type *`): the emitter
 * only searches modules the consumer imports, so an internal module reachable through
 * re-export edges alone is never considered. Types that Viem's own signatures reference
 * directly do not need entries here; the chain-config modules export those themselves,
 * and the emitter names them through `viem/_types/*`.
 *
 * Add an entry only when `environments/tsc/declaration` reports a new third-party leak,
 * and prefer removing the leak from the signature.
 */

/** @deprecated Compiler support for declaration emit, not Viem API. Use `abitype`'s `Abi`. */
export type { Abi as z_Abi } from 'abitype'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { TypedDataDomain as z_TypedDataDomain } from 'abitype'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { TypedDataParameter as z_TypedDataParameter } from 'abitype'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { TypedDataType as z_TypedDataType } from 'abitype'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { TypedData as z_TypedData } from 'ox/TypedData'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { AbiEvent as z_AbiEvent } from 'ox/AbiEvent'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { Name as z_AbiEventName } from 'ox/AbiEvent'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { Rpc as z_AccountProofRpc } from 'ox/AccountProof'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { Identifier as z_BlockIdentifier } from 'ox/Block'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { Tag as z_BlockTag } from 'ox/Block'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { Rpc as z_BlockOverridesRpc } from 'ox/BlockOverrides'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { FeeValuesType as z_FeeValuesType } from 'ox/Fee'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { Rpc as z_FilterRpc } from 'ox/Filter'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { Kzg as z_Kzg } from 'ox/Kzg'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { AccountOverrides as z_AccountOverrides } from 'ox/StateOverrides'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { Rpc as z_TransactionRpc } from 'ox/Transaction'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { Transaction as z_Transaction } from 'ox/Transaction'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { Rpc as z_TransactionReceiptRpc } from 'ox/TransactionReceipt'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { RpcStatus as z_TransactionReceiptRpcStatus } from 'ox/TransactionReceipt'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { RpcType as z_TransactionReceiptRpcType } from 'ox/TransactionReceipt'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { Status as z_TransactionReceiptStatus } from 'ox/TransactionReceipt'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { TransactionReceipt as z_TransactionReceipt } from 'ox/TransactionReceipt'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { Type as z_TransactionReceiptType } from 'ox/TransactionReceipt'
/** @deprecated Compiler support for declaration emit, not Viem API. */
export type { Withdrawal as z_Withdrawal } from 'ox/Withdrawal'
