import { Hex, TransactionReceipt as ox_TransactionReceipt } from 'ox'
import type { Errors } from 'ox'

/** OP Stack transaction receipt. */
export type TransactionReceipt = ox_TransactionReceipt.TransactionReceipt &
  Overrides

/** OP Stack RPC transaction receipt. */
export type Rpc = ox_TransactionReceipt.Rpc & RpcOverrides

/** Native OP Stack receipt fields. */
export type Overrides = {
  /** Jovian data-availability footprint gas scalar. */
  daFootprintGasScalar: bigint | null
  /** Deposit nonce introduced by Regolith. */
  depositNonce?: bigint | undefined
  /** Deposit receipt version introduced by Canyon. */
  depositReceiptVersion?: number | undefined
  /** Ecotone L1 base fee scalar. */
  l1BaseFeeScalar: bigint | null
  /** Ecotone L1 blob base fee. */
  l1BlobBaseFee: bigint | null
  /** Ecotone L1 blob base fee scalar. */
  l1BlobBaseFeeScalar: bigint | null
  /** L1 data fee. */
  l1Fee: bigint | null
  /** Pre-Ecotone L1 fee scalar. */
  l1FeeScalar: number | null
  /** L1 base fee used to calculate the data fee. */
  l1GasPrice: bigint | null
  /** L1 gas used, deprecated by Fjord. */
  l1GasUsed: bigint | null
  /** Isthmus operator fee constant. */
  operatorFeeConstant: bigint | null
  /** Isthmus operator fee scalar. */
  operatorFeeScalar: bigint | null
}

/** RPC OP Stack receipt fields. */
export type RpcOverrides = {
  /** Jovian data-availability footprint gas scalar. */
  daFootprintGasScalar?: Hex.Hex | null | undefined
  /** Deposit nonce introduced by Regolith. */
  depositNonce?: Hex.Hex | null | undefined
  /** Deposit receipt version introduced by Canyon. */
  depositReceiptVersion?: Hex.Hex | null | undefined
  /** Ecotone L1 base fee scalar. */
  l1BaseFeeScalar?: Hex.Hex | null | undefined
  /** Ecotone L1 blob base fee. */
  l1BlobBaseFee?: Hex.Hex | null | undefined
  /** Ecotone L1 blob base fee scalar. */
  l1BlobBaseFeeScalar?: Hex.Hex | null | undefined
  /** L1 data fee. */
  l1Fee?: Hex.Hex | null | undefined
  /** Pre-Ecotone L1 fee scalar. */
  l1FeeScalar?: `${number}` | null | undefined
  /** L1 base fee used to calculate the data fee. */
  l1GasPrice?: Hex.Hex | null | undefined
  /** L1 gas used, deprecated by Fjord. */
  l1GasUsed?: Hex.Hex | null | undefined
  /** Isthmus operator fee constant. */
  operatorFeeConstant?: Hex.Hex | null | undefined
  /** Isthmus operator fee scalar. */
  operatorFeeScalar?: Hex.Hex | null | undefined
}

/**
 * Converts an OP Stack RPC transaction receipt to its native representation.
 *
 * @param receipt - OP Stack RPC transaction receipt.
 * @returns Native OP Stack transaction receipt.
 */
export function fromRpc<const receipt extends Rpc | null>(
  receipt: receipt | Rpc | null,
): fromRpc.ReturnType<receipt> {
  if (!receipt) return null as fromRpc.ReturnType<receipt>

  const { depositNonce, depositReceiptVersion, ...rpc } = receipt
  const base = ox_TransactionReceipt.fromRpc(rpc)

  return {
    ...base,
    daFootprintGasScalar: toBigInt(receipt.daFootprintGasScalar),
    ...(typeof depositNonce === 'string'
      ? { depositNonce: Hex.toBigInt(depositNonce) }
      : {}),
    ...(typeof depositReceiptVersion === 'string'
      ? { depositReceiptVersion: Hex.toNumber(depositReceiptVersion) }
      : {}),
    l1BaseFeeScalar: toBigInt(receipt.l1BaseFeeScalar),
    l1BlobBaseFee: toBigInt(receipt.l1BlobBaseFee),
    l1BlobBaseFeeScalar: toBigInt(receipt.l1BlobBaseFeeScalar),
    l1Fee: toBigInt(receipt.l1Fee),
    l1FeeScalar:
      typeof receipt.l1FeeScalar === 'string'
        ? Number(receipt.l1FeeScalar)
        : null,
    l1GasPrice: toBigInt(receipt.l1GasPrice),
    l1GasUsed: toBigInt(receipt.l1GasUsed),
    operatorFeeConstant: toBigInt(receipt.operatorFeeConstant),
    operatorFeeScalar: toBigInt(receipt.operatorFeeScalar),
  } as fromRpc.ReturnType<receipt>
}

export declare namespace fromRpc {
  /** Return type for {@link fromRpc}. */
  type ReturnType<receipt extends Rpc | null> = receipt extends Rpc
    ? TransactionReceipt
    : null

  /** Errors thrown by {@link fromRpc}. */
  type ErrorType =
    | ox_TransactionReceipt.fromRpc.ErrorType
    | Hex.toBigInt.ErrorType
    | Hex.toNumber.ErrorType
    | Errors.GlobalErrorType
}

function toBigInt(value: Hex.Hex | null | undefined): bigint | null {
  return typeof value === 'string' ? Hex.toBigInt(value) : null
}
