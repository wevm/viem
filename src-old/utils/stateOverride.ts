import {
  InvalidAddressError,
  type InvalidAddressErrorType,
} from '../errors/address.js'
import {
  InvalidBytesLengthError,
  type InvalidBytesLengthErrorType,
} from '../errors/data.js'
import {
  AccountStateConflictError,
  type AccountStateConflictErrorType,
  StateAssignmentConflictError,
  type StateAssignmentConflictErrorType,
} from '../errors/stateOverride.js'
import type {
  RpcAccountStateOverride,
  RpcStateMapping,
  RpcStateOverride,
} from '../types/rpc.js'
import type { StateMapping, StateOverride } from '../types/stateOverride.js'
import { isAddress } from './address/isAddress.js'
import { type NumberToHexErrorType, numberToHex } from './encoding/toHex.js'

type SerializeStateMappingParameters = StateMapping | undefined

type SerializeStateMappingErrorType = InvalidBytesLengthErrorType

/** @internal */
export function serializeStateMapping(
  stateMapping: SerializeStateMappingParameters,
): RpcStateMapping | undefined {
  if (!stateMapping || stateMapping.length === 0) return undefined
  return stateMapping.reduce((acc, { slot, value }) => {
    if (slot.length !== 66)
      throw new InvalidBytesLengthError({
        size: slot.length,
        targetSize: 66,
        type: 'hex',
      })
    if (value.length !== 66)
      throw new InvalidBytesLengthError({
        size: value.length,
        targetSize: 66,
        type: 'hex',
      })
    acc[slot] = value
    return acc
  }, {} as RpcStateMapping)
}

type SerializeAccountStateOverrideParameters = Omit<
  StateOverride[number],
  'address'
>

type SerializeAccountStateOverrideErrorType =
  | NumberToHexErrorType
  | StateAssignmentConflictErrorType
  | SerializeStateMappingErrorType

/** @internal */
export function serializeAccountStateOverride(
  parameters: SerializeAccountStateOverrideParameters,
): RpcAccountStateOverride {
  const { balance, nonce, state, stateDiff, code } = parameters
  const rpcAccountStateOverride: RpcAccountStateOverride = {}
  if (code !== undefined) rpcAccountStateOverride.code = code
  if (balance !== undefined)
    rpcAccountStateOverride.balance = numberToHex(balance)
  if (nonce !== undefined) rpcAccountStateOverride.nonce = numberToHex(nonce)
  if (state !== undefined)
    rpcAccountStateOverride.state = serializeStateMapping(state)
  if (stateDiff !== undefined) {
    if (rpcAccountStateOverride.state) throw new StateAssignmentConflictError()
    rpcAccountStateOverride.stateDiff = serializeStateMapping(stateDiff)
  }
  return rpcAccountStateOverride
}

type SerializeStateOverrideParameters = StateOverride | undefined

export type SerializeStateOverrideErrorType =
  | InvalidAddressErrorType
  | AccountStateConflictErrorType
  | SerializeAccountStateOverrideErrorType

/** @internal */
export function serializeStateOverride(
  parameters?: SerializeStateOverrideParameters,
): RpcStateOverride | undefined {
  if (!parameters) return undefined
  const rpcStateOverride: RpcStateOverride = {}
  for (const { address, ...accountState } of parameters) {
    if (!isAddress(address, { strict: false }))
      throw new InvalidAddressError({ address })
    if (rpcStateOverride[address])
      throw new AccountStateConflictError({ address: address })
    rpcStateOverride[address] = serializeAccountStateOverride(accountState)
  }
  return rpcStateOverride
}
