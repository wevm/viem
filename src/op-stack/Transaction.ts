import { Hex, Transaction as ox_Transaction } from 'ox'
import type { Errors } from 'ox'

/** OP Stack transaction. */
export type Transaction<pending extends boolean = false> =
  | ox_Transaction.Transaction<pending>
  | Deposit<pending>

/** OP Stack RPC transaction. */
export type Rpc<pending extends boolean = false> =
  | ox_Transaction.Rpc<pending>
  | DepositRpc<pending>

/** OP Stack deposit transaction. */
export type Deposit<
  pending extends boolean = false,
  bigintType = bigint,
  numberType = number,
  type extends string = 'deposit',
> = Omit<
  ox_Transaction.Base<type, pending, bigintType, numberType>,
  'chainId'
> & {
  /** Chain ID, when returned by the node. */
  chainId?: numberType | undefined
  /** Effective gas price paid by the transaction. */
  gasPrice?: bigintType | undefined
  /** Whether the deposit is an L1 attributes transaction. */
  isSystemTx?: boolean | undefined
  /** Maximum fee per gas. */
  maxFeePerGas?: bigintType | undefined
  /** Maximum priority fee per gas. */
  maxPriorityFeePerGas?: bigintType | undefined
  /** ETH minted on L2 before execution. */
  mint?: bigintType | undefined
  /** Hash that uniquely identifies the L1 deposit source. */
  sourceHash: Hex.Hex
}

/** OP Stack deposit RPC transaction. */
export type DepositRpc<pending extends boolean = false> = Deposit<
  pending,
  Hex.Hex,
  Hex.Hex,
  '0x7e'
>

/**
 * Converts an OP Stack RPC transaction to its native representation.
 *
 * @param transaction - OP Stack RPC transaction.
 * @param options - Conversion options.
 * @returns Native OP Stack transaction.
 */
export function fromRpc<
  const transaction extends Rpc | null,
  pending extends boolean = false,
>(
  transaction: transaction | Rpc<pending> | null,
  options: fromRpc.Options<pending> = {},
): fromRpc.ReturnType<transaction, pending> {
  if (!transaction) return null as fromRpc.ReturnType<transaction, pending>

  const transaction_ = ox_Transaction.fromRpc(
    transaction as ox_Transaction.Rpc<pending>,
    options,
  )
  if (transaction.type !== '0x7e')
    return transaction_ as fromRpc.ReturnType<transaction, pending>

  const deposit = transaction as DepositRpc<pending>
  return {
    ...transaction_,
    ...(typeof deposit.isSystemTx === 'boolean'
      ? { isSystemTx: deposit.isSystemTx }
      : {}),
    ...(typeof deposit.mint === 'string'
      ? { mint: Hex.toBigInt(deposit.mint) }
      : {}),
    sourceHash: deposit.sourceHash,
    type: 'deposit',
  } as fromRpc.ReturnType<transaction, pending>
}

export declare namespace fromRpc {
  /** Options for {@link fromRpc}. */
  type Options<pending extends boolean = false> =
    ox_Transaction.fromRpc.Options<pending>

  /** Return type for {@link fromRpc}. */
  type ReturnType<
    transaction extends Rpc | null,
    pending extends boolean = false,
  > = transaction extends Rpc<pending> ? Transaction<pending> : null

  /** Errors thrown by {@link fromRpc}. */
  type ErrorType =
    | ox_Transaction.fromRpc.ErrorType
    | Hex.toBigInt.ErrorType
    | Errors.GlobalErrorType
}
