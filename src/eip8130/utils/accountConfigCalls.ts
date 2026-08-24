import type { Address } from 'abitype'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import {
  type EncodeFunctionDataErrorType,
  encodeFunctionData,
} from '../../utils/abi/encodeFunctionData.js'
import { accountConfigurationAbi } from '../abis.js'
import { keystoreAddress } from '../constants.js'
import type {
  AaActor,
  AaChange,
  AaChangeChannel,
} from '../types/transaction.js'
import { encodeChangePayload } from './actorChangeData.js'

function toInitialActors(actors: readonly AaActor[]) {
  return actors.map((actor) => ({
    actorId: actor.actorId,
    authenticator: actor.authenticator,
    scope: actor.scope ?? 0,
    policyData: actor.policyData ?? ('0x' as Hex),
  }))
}

function toAbiChanges(changes: readonly AaChange[]) {
  return changes.map((change) => ({
    changeType: change.changeType,
    payload: encodeChangePayload(change),
  }))
}

export type EncodeCreateAccountDataParameters = {
  /** User-chosen uniqueness factor (bytes32). */
  userSalt: Hex
  /** Runtime bytecode placed at the account address. */
  code: Hex
  /** Initial actors (sorted by `actorId`, strictly ascending). */
  initialActors: readonly AaActor[]
}

export type EncodeCreateAccountDataErrorType =
  | EncodeFunctionDataErrorType
  | ErrorType

/**
 * Encodes calldata for `AccountConfiguration.createAccount` — the ERC-4337
 * factory call that deploys an EIP-8130 account on a non-8130 chain (and is the
 * `factoryData` returned by {@link toFactoryArgs}).
 */
export function encodeCreateAccountData(
  parameters: EncodeCreateAccountDataParameters,
): Hex {
  const { userSalt, code, initialActors } = parameters
  return encodeFunctionData({
    abi: accountConfigurationAbi,
    functionName: 'createAccount',
    args: [userSalt, code, toInitialActors(initialActors)],
  })
}

export type ToFactoryArgsParameters = EncodeCreateAccountDataParameters

export type ToFactoryArgsReturnType = {
  factory: Address
  factoryData: Hex
}

export type ToFactoryArgsErrorType =
  | EncodeCreateAccountDataErrorType
  | ErrorType

/**
 * Returns the ERC-4337 `{ factory, factoryData }` for deploying an EIP-8130
 * account through the keystore on a non-8130 chain. The resulting account
 * address matches {@link computeAddress}. The factory is the enshrined
 * {@link keystoreAddress}.
 */
export function toFactoryArgs(
  parameters: ToFactoryArgsParameters,
): ToFactoryArgsReturnType {
  return {
    factory: keystoreAddress,
    factoryData: encodeCreateAccountData(parameters),
  }
}

export type EncodeApplySignedAccountChangesDataParameters = {
  /** The account whose configuration is changing. */
  account: Address
  /** Replay channel (`'local'` binds `block.chainid`; `'multichain'` binds `0`). */
  channel: AaChangeChannel
  /** The channel sequence word (`uint64`). */
  sequence: bigint
  /** The ordered ops in the batch. */
  changes: readonly AaChange[]
  /** Authorization signature over the batch digest (`authenticator || data`). */
  signature: Hex
}

export type EncodeApplySignedAccountChangesDataErrorType =
  | EncodeFunctionDataErrorType
  | ErrorType

/**
 * Encodes calldata for `AccountConfiguration.applySignedAccountChanges` — the
 * portable (any-chain) path to apply a signed batch via plain EVM execution.
 * Pair with {@link signAccountChanges} to produce the `signature`.
 */
export function encodeApplySignedAccountChangesData(
  parameters: EncodeApplySignedAccountChangesDataParameters,
): Hex {
  const { account, channel, sequence, changes, signature } = parameters
  return encodeFunctionData({
    abi: accountConfigurationAbi,
    functionName: 'applySignedAccountChanges',
    args: [
      account,
      {
        channel: channel === 'multichain' ? 1 : 0,
        sequence,
        changes: toAbiChanges(changes),
        signature,
      },
    ],
  })
}
