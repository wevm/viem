import { AbiEvent, AbiParameters, Hash } from 'ox'
import type { Address, Errors, Hex, Log } from 'ox'

import * as ViemErrors from '../core/Errors.js'
import * as Abis from './abis.js'

/** A request to initiate a withdrawal from L2 to L1. */
export type Request = {
  /** Encoded contract method and arguments. */
  data?: Hex.Hex | undefined
  /** Gas limit for transaction execution on L1. */
  gas: bigint
  /** L1 transaction recipient. */
  to: Address.Address
  /** Value in wei withdrawn to L1. */
  value?: bigint | undefined
}

/** An OP Stack withdrawal. */
export type Withdrawal = {
  /** Withdrawal calldata. */
  data: Hex.Hex
  /** Gas limit for execution on L1. */
  gasLimit: bigint
  /** Withdrawal nonce. */
  nonce: bigint
  /** L2 sender. */
  sender: Address.Address
  /** L1 recipient. */
  target: Address.Address
  /** Value in wei withdrawn to L1. */
  value: bigint
  /** Withdrawal hash. */
  withdrawalHash: Hex.Hex
}

/** A decoded `MessagePassed` log. */
export type MessagePassedLog = AbiEvent.extractLogs.ReturnType<
  AbiEvent.extractLogs.ExtractEvent<
    typeof Abis.l2ToL1MessagePasserAbi,
    'MessagePassed'
  >,
  Log.Log,
  true
>

/** Extracts `MessagePassed` events from L2 logs. */
export function extractWithdrawalMessageLogs(
  options: extractWithdrawalMessageLogs.Options,
): extractWithdrawalMessageLogs.ReturnType {
  return AbiEvent.extractLogs(Abis.l2ToL1MessagePasserAbi, options.logs, {
    eventName: 'MessagePassed',
    strict: true,
  })
}

export declare namespace extractWithdrawalMessageLogs {
  /** Options for {@link extractWithdrawalMessageLogs}. */
  type Options = {
    /** L2 logs to inspect. */
    logs: readonly Log.Log[]
  }

  /** Return type of {@link extractWithdrawalMessageLogs}. */
  type ReturnType = readonly MessagePassedLog[]

  /** Errors thrown by {@link extractWithdrawalMessageLogs}. */
  type ErrorType = AbiEvent.extractLogs.ErrorType | Errors.GlobalErrorType
}

/** Computes the storage slot for a withdrawal hash. */
export function getWithdrawalHashStorageSlot(
  options: getWithdrawalHashStorageSlot.Options,
): getWithdrawalHashStorageSlot.ReturnType {
  const data = AbiParameters.encode(
    [{ type: 'bytes32' }, { type: 'uint256' }],
    [options.withdrawalHash, 0n],
  )
  return Hash.keccak256(data)
}

export declare namespace getWithdrawalHashStorageSlot {
  /** Options for {@link getWithdrawalHashStorageSlot}. */
  type Options = {
    /** Withdrawal hash. */
    withdrawalHash: Hex.Hex
  }

  /** Return type of {@link getWithdrawalHashStorageSlot}. */
  type ReturnType = Hex.Hex

  /** Errors thrown by {@link getWithdrawalHashStorageSlot}. */
  type ErrorType =
    | AbiParameters.encode.ErrorType
    | Hash.keccak256.ErrorType
    | Errors.GlobalErrorType
}

/** Extracts withdrawals from L2 receipt logs. */
export function getWithdrawals(
  options: getWithdrawals.Options,
): getWithdrawals.ReturnType {
  return extractWithdrawalMessageLogs(options).map((log) => log.args)
}

export declare namespace getWithdrawals {
  /** Options for {@link getWithdrawals}. */
  type Options = extractWithdrawalMessageLogs.Options

  /** Return type of {@link getWithdrawals}. */
  type ReturnType = readonly Withdrawal[]

  /** Errors thrown by {@link getWithdrawals}. */
  type ErrorType =
    | extractWithdrawalMessageLogs.ErrorType
    | Errors.GlobalErrorType
}

/** Thrown when a transaction receipt contains no withdrawals. */
export class ReceiptContainsNoWithdrawalsError extends ViemErrors.BaseError {
  override name = 'Withdrawal.ReceiptContainsNoWithdrawalsError'

  constructor(options: ReceiptContainsNoWithdrawalsError.Options) {
    super(
      `The provided transaction receipt with hash "${options.hash}" contains no withdrawals.`,
    )
  }
}

export declare namespace ReceiptContainsNoWithdrawalsError {
  /** Constructor options for {@link ReceiptContainsNoWithdrawalsError}. */
  type Options = {
    /** Transaction hash. */
    hash: Hex.Hex
  }
}
