import { AbiEvent, Bytes, Hash, Hex } from 'ox'
import type { Address, Errors, Log } from 'ox'

import * as Abis from './abis.js'
import * as TxEnvelopeDeposit from './TxEnvelopeDeposit.js'

/** A request to deposit a transaction from L1 to L2. */
export type Request = {
  /** Gas limit for transaction execution on L2. */
  gas: bigint
  /** Value in wei to mint on L2. */
  mint?: bigint | undefined
  /** Value in wei sent with the transaction on L2. */
  value?: bigint | undefined
} & (
  | {
      /** Encoded contract method and arguments. */
      data?: Hex.Hex | undefined
      /** Whether the transaction deploys a contract. */
      isCreation?: false | undefined
      /** L2 transaction recipient. */
      to?: Address.Address | undefined
    }
  | {
      /** Contract deployment bytecode. */
      data: Hex.Hex
      /** Whether the transaction deploys a contract. */
      isCreation: true
      /** Contract deployments cannot specify a recipient. */
      to?: undefined
    }
)

/** A decoded `TransactionDeposited` log. */
export type TransactionDepositedLog = AbiEvent.extractLogs.ReturnType<
  AbiEvent.extractLogs.ExtractEvent<
    typeof Abis.portalAbi,
    'TransactionDeposited'
  >,
  Log.Log,
  true
>

/** Extracts `TransactionDeposited` events from L1 logs. */
export function extractTransactionDepositedLogs(
  options: extractTransactionDepositedLogs.Options,
): extractTransactionDepositedLogs.ReturnType {
  return AbiEvent.extractLogs(Abis.portalAbi, options.logs, {
    eventName: 'TransactionDeposited',
    strict: true,
  })
}

export declare namespace extractTransactionDepositedLogs {
  /** Options for {@link extractTransactionDepositedLogs}. */
  type Options = {
    /** L1 logs to inspect. */
    logs: readonly Log.Log[]
  }

  /** Return type of {@link extractTransactionDepositedLogs}. */
  type ReturnType = readonly TransactionDepositedLog[]

  /** Errors thrown by {@link extractTransactionDepositedLogs}. */
  type ErrorType = AbiEvent.extractLogs.ErrorType | Errors.GlobalErrorType
}

/** Computes the L2 transaction hash for a `TransactionDeposited` event. */
export function getL2TransactionHash(
  options: getL2TransactionHash.Options,
): getL2TransactionHash.ReturnType {
  const { log } = options
  const sourceHash = getSourceHash({
    domain: 'userDeposit',
    l1BlockHash: log.blockHash,
    l1LogIndex: log.logIndex,
  })
  const { data, gas, isCreation, mint, value } = opaqueDataToDepositData(
    log.args.opaqueData,
  )

  return Hash.keccak256(
    TxEnvelopeDeposit.serialize({
      data,
      from: log.args.from,
      gas,
      isSystemTx: false,
      mint,
      sourceHash,
      to: isCreation ? undefined : log.args.to,
      type: 'deposit',
      value,
    }),
  )
}

export declare namespace getL2TransactionHash {
  /** Options for {@link getL2TransactionHash}. */
  type Options = {
    /** `TransactionDeposited` log to hash. */
    log: TransactionDepositedLog
  }

  /** Return type of {@link getL2TransactionHash}. */
  type ReturnType = Hex.Hex

  /** Errors thrown by {@link getL2TransactionHash}. */
  type ErrorType =
    | getSourceHash.ErrorType
    | opaqueDataToDepositData.ErrorType
    | TxEnvelopeDeposit.serialize.ErrorType
    | Hash.keccak256.ErrorType
    | Errors.GlobalErrorType
}

/** Computes L2 transaction hashes from L1 receipt logs. */
export function getL2TransactionHashes(
  options: getL2TransactionHashes.Options,
): getL2TransactionHashes.ReturnType {
  return extractTransactionDepositedLogs(options).map((log) =>
    getL2TransactionHash({ log }),
  )
}

export declare namespace getL2TransactionHashes {
  /** Options for {@link getL2TransactionHashes}. */
  type Options = extractTransactionDepositedLogs.Options

  /** Return type of {@link getL2TransactionHashes}. */
  type ReturnType = readonly Hex.Hex[]

  /** Errors thrown by {@link getL2TransactionHashes}. */
  type ErrorType =
    | extractTransactionDepositedLogs.ErrorType
    | getL2TransactionHash.ErrorType
    | Errors.GlobalErrorType
}

/** Computes an OP Stack deposit source hash. */
export function getSourceHash(
  options: getSourceHash.Options,
): getSourceHash.ReturnType {
  const depositIdHash = (() => {
    if (options.domain === 'upgradeDeposit')
      return Hash.keccak256(Bytes.fromString(options.intent), { as: 'Hex' })
    const marker =
      options.domain === 'userDeposit'
        ? options.l1LogIndex
        : options.sequenceNumber
    return Hash.keccak256(
      Hex.concat(options.l1BlockHash, Hex.fromNumber(marker, { size: 32 })),
    )
  })()
  return Hash.keccak256(
    Hex.concat(
      Hex.fromNumber(sourceHashDomainMap[options.domain], { size: 32 }),
      depositIdHash,
    ),
  )
}

export declare namespace getSourceHash {
  /** Options for {@link getSourceHash}. */
  type Options =
    | {
        /** Source domain. */
        domain: 'userDeposit'
        /** Upgrade deposits use an intent string instead. */
        intent?: undefined
        /** L1 block hash. */
        l1BlockHash: Hex.Hex
        /** Index of the deposit log on L1. */
        l1LogIndex: number
        /** L1 information deposits use a sequence number instead. */
        sequenceNumber?: undefined
      }
    | {
        /** Source domain. */
        domain: 'l1InfoDeposit'
        /** Upgrade deposits use an intent string instead. */
        intent?: undefined
        /** L1 block hash. */
        l1BlockHash: Hex.Hex
        /** User deposits use a log index instead. */
        l1LogIndex?: undefined
        /** Sequence number of the L1 information deposit. */
        sequenceNumber: number
      }
    | {
        /** Source domain. */
        domain: 'upgradeDeposit'
        /** UTF-8 upgrade intent. */
        intent: string
        /** L1-origin deposits use a block hash instead. */
        l1BlockHash?: undefined
        /** User deposits use a log index instead. */
        l1LogIndex?: undefined
        /** L1 information deposits use a sequence number instead. */
        sequenceNumber?: undefined
      }

  /** Return type of {@link getSourceHash}. */
  type ReturnType = Hex.Hex

  /** Errors thrown by {@link getSourceHash}. */
  type ErrorType =
    | Bytes.fromString.ErrorType
    | Hash.keccak256.ErrorType
    | Hex.concat.ErrorType
    | Hex.fromNumber.ErrorType
    | Errors.GlobalErrorType
}

/** Decodes the opaque data carried by a `TransactionDeposited` event. */
export function opaqueDataToDepositData(
  opaqueData: Hex.Hex,
): opaqueDataToDepositData.ReturnType {
  const mint = Hex.slice(opaqueData, 0, 32)
  const value = Hex.slice(opaqueData, 32, 64)
  const gas = Hex.slice(opaqueData, 64, 72)
  const isCreation = Hex.toBigInt(Hex.slice(opaqueData, 72, 73)) === 1n
  const data = Hex.size(opaqueData) === 73 ? '0x' : Hex.slice(opaqueData, 73)
  return {
    data,
    gas: Hex.toBigInt(gas),
    isCreation,
    mint: Hex.toBigInt(mint),
    value: Hex.toBigInt(value),
  }
}

export declare namespace opaqueDataToDepositData {
  /** Return type of {@link opaqueDataToDepositData}. */
  type ReturnType = {
    /** Transaction calldata. */
    data: Hex.Hex
    /** Gas limit. */
    gas: bigint
    /** Whether the transaction deploys a contract. */
    isCreation: boolean
    /** Value minted on L2. */
    mint: bigint
    /** Value sent on L2. */
    value: bigint
  }

  /** Errors thrown by {@link opaqueDataToDepositData}. */
  type ErrorType =
    | Hex.slice.ErrorType
    | Hex.size.ErrorType
    | Hex.toBigInt.ErrorType
    | Errors.GlobalErrorType
}

const sourceHashDomainMap = {
  l1InfoDeposit: 1,
  upgradeDeposit: 2,
  userDeposit: 0,
} as const
