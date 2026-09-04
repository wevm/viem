import { Address, Hex, Rlp } from 'ox'
import type { Errors as OxErrors } from 'ox'

import * as Errors from '../core/Errors.js'

/** OP Stack deposit transaction envelope. */
export type TxEnvelopeDeposit<bigintType = bigint> = {
  /** Transaction calldata. */
  data?: Hex.Hex | undefined
  /** L1 account that initiated the deposit. */
  from: Address.Address
  /** Gas limit for the L2 transaction. */
  gas?: bigintType | undefined
  /** Whether the deposit is an L1 attributes transaction. */
  isSystemTx?: boolean | undefined
  /** ETH minted on L2 before execution. */
  mint?: bigintType | undefined
  /** Hash that uniquely identifies the L1 deposit source. */
  sourceHash: Hex.Hex
  /** Transaction recipient, or `null` for contract creation. */
  to?: Address.Address | null | undefined
  /** Transaction type. */
  type: Type
  /** ETH transferred during L2 execution. */
  value?: bigintType | undefined
}

/** Serialized OP Stack deposit transaction. */
export type Serialized = `${SerializedType}${string}`

/** Serialized OP Stack deposit transaction type. */
export const serializedType = '0x7e' as const

/** Serialized OP Stack deposit transaction type. */
export type SerializedType = typeof serializedType

/** OP Stack deposit transaction type. */
export const type = 'deposit' as const

/** OP Stack deposit transaction type. */
export type Type = typeof type

/**
 * Asserts that an OP Stack deposit transaction envelope is valid.
 *
 * @param envelope - Deposit transaction envelope.
 */
export function assert(
  envelope: TxEnvelopeDeposit,
): asserts envelope is TxEnvelopeDeposit {
  const { data, from, sourceHash, to } = envelope
  Address.assert(from, { strict: false })
  if (to) Address.assert(to, { strict: false })
  Hex.assert(sourceHash, { strict: true })
  if (Hex.size(sourceHash) !== 32)
    throw new InvalidSourceHashSizeError({ sourceHash })
  if (data) Hex.assert(data, { strict: true })
}

export declare namespace assert {
  /** Errors thrown by {@link assert}. */
  type ErrorType =
    | Address.assert.ErrorType
    | Hex.assert.ErrorType
    | InvalidSourceHashSizeError
    | OxErrors.GlobalErrorType
}

/**
 * Deserializes an OP Stack deposit transaction envelope.
 *
 * @param serialized - Serialized deposit transaction.
 * @returns Deposit transaction envelope.
 */
export function deserialize(serialized: Serialized): TxEnvelopeDeposit {
  if (Hex.slice(serialized, 0, 1) !== serializedType)
    throw new InvalidSerializedError({ serialized })

  const values = Rlp.toHex(Hex.slice(serialized, 1))
  if (!Array.isArray(values) || values.length !== 8)
    throw new InvalidSerializedError({ serialized })

  for (const value of values) {
    if (typeof value !== 'string')
      throw new InvalidSerializedError({ serialized })
    Hex.assert(value, { strict: true })
  }
  const [sourceHash, from, to, mint, value, gas, isSystemTx, data] =
    values as readonly Hex.Hex[]
  if (
    !sourceHash ||
    !from ||
    !to ||
    !mint ||
    !value ||
    !gas ||
    !isSystemTx ||
    !data
  )
    throw new InvalidSerializedError({ serialized })

  const envelope: TxEnvelopeDeposit = {
    from,
    sourceHash,
    type,
  }
  if (data !== '0x') envelope.data = data
  if (gas !== '0x') envelope.gas = Hex.toBigInt(gas)
  if (isSystemTx !== '0x') envelope.isSystemTx = Hex.toBoolean(isSystemTx)
  if (mint !== '0x') envelope.mint = Hex.toBigInt(mint)
  if (to !== '0x') envelope.to = to
  if (value !== '0x') envelope.value = Hex.toBigInt(value)

  assert(envelope)
  return envelope
}

export declare namespace deserialize {
  /** Errors thrown by {@link deserialize}. */
  type ErrorType =
    | assert.ErrorType
    | Hex.slice.ErrorType
    | Hex.toBigInt.ErrorType
    | Hex.toBoolean.ErrorType
    | Rlp.toHex.ErrorType
    | InvalidSerializedError
    | OxErrors.GlobalErrorType
}

/**
 * Returns whether a value is an OP Stack deposit transaction envelope.
 *
 * @param value - Value to inspect.
 */
export function is(value: unknown): value is TxEnvelopeDeposit {
  if (!value || typeof value !== 'object') return false
  const envelope = value as {
    sourceHash?: unknown
    type?: unknown
  }
  if (envelope.type === type) return true
  if (typeof envelope.type !== 'undefined') return false
  return typeof envelope.sourceHash !== 'undefined'
}

/**
 * Serializes an OP Stack deposit transaction envelope.
 *
 * @param envelope - Deposit transaction envelope.
 * @returns Serialized deposit transaction.
 */
export function serialize(envelope: TxEnvelopeDeposit): Serialized {
  assert(envelope)
  const { data, from, gas, isSystemTx, mint, sourceHash, to, value } = envelope
  return Hex.concat(
    serializedType,
    Rlp.from(
      [
        sourceHash,
        from,
        to ?? '0x',
        mint ? Hex.fromNumber(mint) : '0x',
        value ? Hex.fromNumber(value) : '0x',
        gas ? Hex.fromNumber(gas) : '0x',
        isSystemTx ? Hex.fromBoolean(true) : '0x',
        data ?? '0x',
      ],
      { as: 'Hex' },
    ),
  ) as Serialized
}

export declare namespace serialize {
  /** Errors thrown by {@link serialize}. */
  type ErrorType =
    | assert.ErrorType
    | Hex.concat.ErrorType
    | Hex.fromBoolean.ErrorType
    | Hex.fromNumber.ErrorType
    | Rlp.from.ErrorType
    | OxErrors.GlobalErrorType
}

/** Thrown when a serialized deposit transaction is invalid. */
export class InvalidSerializedError extends Errors.BaseError {
  override readonly name = 'TxEnvelopeDeposit.InvalidSerializedError'

  constructor({ serialized }: { serialized: Hex.Hex }) {
    super('Invalid serialized OP Stack deposit transaction.', {
      metaMessages: [`Serialized Transaction: "${serialized}"`],
    })
  }
}

/** Thrown when a deposit source hash is not 32 bytes. */
export class InvalidSourceHashSizeError extends Errors.BaseError {
  override readonly name = 'TxEnvelopeDeposit.InvalidSourceHashSizeError'

  constructor({ sourceHash }: { sourceHash: Hex.Hex }) {
    super('Deposit source hash must be 32 bytes.', {
      metaMessages: [`Source Hash: "${sourceHash}"`],
    })
  }
}
