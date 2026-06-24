import type { Address } from 'abitype'
import { BaseError } from '../../../errors/base.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Hex } from '../../../types/misc.js'
import { type SliceErrorType, sliceHex } from '../../../utils/data/slice.js'
import {
  type HexToBigIntErrorType,
  type HexToNumberErrorType,
  hexToBigInt,
  hexToNumber,
} from '../../../utils/encoding/fromHex.js'
import {
  type FromRlpErrorType,
  fromRlp,
} from '../../../utils/encoding/fromRlp.js'
import type { RecursiveArray } from '../../../utils/encoding/toRlp.js'
import {
  aaTransactionType,
  accountChangeType,
  actorChangeType,
} from '../constants.js'
import type {
  AaAccountChange,
  AaActor,
  AaActorChange,
  AaCalls,
  TransactionSerializable8130,
} from '../types/transaction.js'
import { decodeAuthorizeActorData } from './actorChangeData.js'

export type ParseTransaction8130ErrorType =
  | SliceErrorType
  | FromRlpErrorType
  | HexToBigIntErrorType
  | HexToNumberErrorType
  | ErrorType

type RlpHex = RecursiveArray<Hex>

function toOptionalAddress(value: Hex): Address | undefined {
  return value === '0x' ? undefined : (value as Address)
}

function toOptionalBigInt(value: Hex): bigint | undefined {
  return value === '0x' ? undefined : hexToBigInt(value)
}

function parseCalls(value: RlpHex): AaCalls {
  const phases = value as RlpHex[]
  return phases.map((phase) =>
    (phase as RlpHex[]).map((call) => {
      const [to, data] = call as Hex[]
      return { to: to as Address, data: data === '0x' ? undefined : data }
    }),
  )
}

function parseActor(value: RlpHex): AaActor {
  const [actorId, authenticator] = value as Hex[]
  return { actorId, authenticator: authenticator as Address }
}

function parseActorChange(value: RlpHex): AaActorChange {
  const [changeType, actorId, data] = value as [Hex, Hex, Hex]
  const type = changeType === '0x' ? 0 : hexToNumber(changeType)
  if (type === actorChangeType.authorizeActor) {
    const { authenticator, scope, expiry, policyType, policyData } =
      decodeAuthorizeActorData(data)
    const change: AaActorChange = {
      changeType: actorChangeType.authorizeActor,
      actorId,
      authenticator,
    }
    if (scope !== 0) change.scope = scope
    if (expiry !== 0n) change.expiry = expiry
    if (policyType !== 0) change.policyType = policyType
    if (policyData !== '0x') change.policyData = policyData
    return change
  }
  return { changeType: actorChangeType.revokeActor, actorId }
}

function parseAccountChanges(value: RlpHex): readonly AaAccountChange[] {
  // Wire format: each AccountChange is encoded as type_byte || rlp([body_fields...]).
  // After RLP decoding the outer list we receive alternating [type_hex, body_array] pairs.
  const flat = value as RlpHex[]
  const result: AaAccountChange[] = []
  for (let i = 0; i < flat.length; i += 2) {
    const type = flat[i] as Hex
    const body = flat[i + 1] as RlpHex[]
    if (type === accountChangeType.create) {
      const [userSalt, code, actors] = body
      result.push({
        type: 'create',
        userSalt: userSalt as Hex,
        code: code as Hex,
        initialActors: (actors as RlpHex[]).map(parseActor),
      })
      continue
    }
    if (type === accountChangeType.config) {
      const [chainId, sequence, actorChanges, auth] = body
      result.push({
        type: 'config',
        chainId: chainId === '0x' ? 0 : hexToNumber(chainId as Hex),
        sequence: sequence === '0x' ? 0 : hexToNumber(sequence as Hex),
        actorChanges: (actorChanges as RlpHex[]).map(parseActorChange),
        auth: auth as Hex,
      })
      continue
    }
    if (type === accountChangeType.delegation) {
      const [target] = body
      result.push({ type: 'delegation', target: target as Address })
      continue
    }
    throw new BaseError(`Unknown account change entry type: "${type}".`)
  }
  return result
}

/**
 * Parses a serialized EIP-8130 (`AA_TX_TYPE`) transaction back into a
 * {@link TransactionSerializable8130}.
 */
export function parseTransaction8130(
  serialized: Hex,
): TransactionSerializable8130 {
  const type = sliceHex(serialized, 0, 1)
  if (type !== aaTransactionType)
    throw new BaseError(
      `Serialized transaction type "${type}" is not an EIP-8130 transaction.`,
    )

  const fields = fromRlp(sliceHex(serialized, 1), 'hex') as RlpHex[]
  const [
    chainId,
    from,
    nonceKey,
    nonceSequence,
    expiry,
    maxPriorityFeePerGas,
    maxFeePerGas,
    gas,
    accountChanges,
    calls,
    metadata,
    payer,
    senderAuth,
    payerAuth,
  ] = fields

  const transaction: TransactionSerializable8130 = {
    chainId: hexToNumber(chainId as Hex),
  }

  const fromAddress = toOptionalAddress(from as Hex)
  if (fromAddress) transaction.from = fromAddress
  const nonceKeyValue = toOptionalBigInt(nonceKey as Hex)
  if (nonceKeyValue !== undefined) transaction.nonceKey = nonceKeyValue
  const nonceSequenceValue = toOptionalBigInt(nonceSequence as Hex)
  if (nonceSequenceValue !== undefined)
    transaction.nonceSequence = nonceSequenceValue
  const expiryValue = toOptionalBigInt(expiry as Hex)
  if (expiryValue !== undefined) transaction.expiry = expiryValue
  const maxPriorityFeePerGasValue = toOptionalBigInt(
    maxPriorityFeePerGas as Hex,
  )
  if (maxPriorityFeePerGasValue !== undefined)
    transaction.maxPriorityFeePerGas = maxPriorityFeePerGasValue
  const maxFeePerGasValue = toOptionalBigInt(maxFeePerGas as Hex)
  if (maxFeePerGasValue !== undefined)
    transaction.maxFeePerGas = maxFeePerGasValue
  const gasValue = toOptionalBigInt(gas as Hex)
  if (gasValue !== undefined) transaction.gas = gasValue

  if ((accountChanges as RlpHex[]).length > 0)
    transaction.accountChanges = parseAccountChanges(accountChanges)
  if ((calls as RlpHex[]).length > 0) transaction.calls = parseCalls(calls)
  if ((metadata as Hex) !== '0x') transaction.metadata = metadata as Hex

  const payerAddress = toOptionalAddress(payer as Hex)
  if (payerAddress) transaction.payer = payerAddress
  if ((senderAuth as Hex) !== '0x') transaction.senderAuth = senderAuth as Hex
  if ((payerAuth as Hex) !== '0x') transaction.payerAuth = payerAuth as Hex

  return transaction
}
