import type { Address } from 'abitype'
import { BaseError } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import { type SliceErrorType, sliceHex } from '../../utils/data/slice.js'
import {
  type HexToBigIntErrorType,
  type HexToNumberErrorType,
  hexToBigInt,
  hexToNumber,
} from '../../utils/encoding/fromHex.js'
import { type FromRlpErrorType, fromRlp } from '../../utils/encoding/fromRlp.js'
import type { RecursiveArray } from '../../utils/encoding/toRlp.js'
import {
  aaTransactionType,
  accountChangeType,
  openPayer,
} from '../constants.js'
import type {
  AaAccountChange,
  AaActor,
  AaCall,
  AaCalls,
  AaChange,
  TransactionSerializable8130,
} from '../types/transaction.js'
import { decodeChange } from './actorChangeData.js'

export type ParseTransactionErrorType =
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
      const [to, value, data] = call as Hex[]
      const parsed: AaCall = { to: to as Address }
      if (value && value !== '0x') parsed.value = hexToBigInt(value)
      if (data && data !== '0x') parsed.data = data
      return parsed
    }),
  )
}

function parseActor(value: RlpHex): AaActor {
  const [actorId, authenticator, scope, policyData] = value as Hex[]
  const actor: AaActor = { actorId, authenticator: authenticator as Address }
  const scopeNum = !scope || scope === '0x' ? 0 : hexToNumber(scope)
  if (scopeNum !== 0) actor.scope = scopeNum
  if (policyData && policyData !== '0x') actor.policyData = policyData
  return actor
}

function parseChange(value: RlpHex): AaChange {
  const [opByte, payload] = value as [Hex, Hex]
  return decodeChange(opByte === '0x' ? 0 : hexToNumber(opByte), payload)
}

function parseAccountChanges(value: RlpHex): readonly AaAccountChange[] {
  // Each AccountChange is a single flat RLP list rlp([type_byte, ...body_fields]);
  // the type byte is the first list element, RLP-encoded as an integer. After
  // RLP decoding the outer list we receive one sub-list per entry.
  const entries = value as RlpHex[]
  const result: AaAccountChange[] = []
  for (const entry of entries) {
    const [type, ...body] = entry as RlpHex[]
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
      const [channel, sequence, changes, signature] = body
      result.push({
        type: 'config',
        channel: (channel as Hex) === '0x01' ? 'multichain' : 'local',
        sequence:
          (sequence as Hex) === '0x' ? 0n : hexToBigInt(sequence as Hex),
        changes: (changes as RlpHex[]).map(parseChange),
        signature: signature as Hex,
      })
      continue
    }
    if (type === accountChangeType.delegation) {
      const [target] = body
      result.push({ type: 'delegation', target: target as Address })
      continue
    }
    throw new BaseError(`Unknown account change entry type: "${type as Hex}".`)
  }
  return result
}

/**
 * Parses a serialized AA (`AA_TX_TYPE`) transaction back into a
 * {@link TransactionSerializable8130}.
 */
export function parseTransaction(serialized: Hex): TransactionSerializable8130 {
  const type = sliceHex(serialized, 0, 1)
  if (type !== aaTransactionType)
    throw new BaseError(
      `Serialized transaction type "${type}" is not an AA (\`0x79\`) transaction.`,
    )

  const fields = fromRlp(sliceHex(serialized, 1), 'hex') as RlpHex[]
  const [
    chainId,
    from,
    nonceKey,
    nonceSequence,
    validAfter,
    validBefore,
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
  const validAfterValue = toOptionalBigInt(validAfter as Hex)
  if (validAfterValue !== undefined) transaction.validAfter = validAfterValue
  const validBeforeValue = toOptionalBigInt(validBefore as Hex)
  if (validBeforeValue !== undefined) transaction.validBefore = validBeforeValue
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

  if ((payer as Hex) === openPayer) transaction.payer = openPayer
  else {
    const payerAddress = toOptionalAddress(payer as Hex)
    if (payerAddress) transaction.payer = payerAddress
  }
  if ((senderAuth as Hex) !== '0x') transaction.senderAuth = senderAuth as Hex
  if ((payerAuth as Hex) !== '0x') transaction.payerAuth = payerAuth as Hex

  return transaction
}
