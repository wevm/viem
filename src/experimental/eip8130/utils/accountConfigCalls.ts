import type { Address } from 'abitype'
import type { ErrorType } from '../../../errors/utils.js'
import type { Hex } from '../../../types/misc.js'
import {
  type EncodeFunctionDataErrorType,
  encodeFunctionData,
} from '../../../utils/abi/encodeFunctionData.js'
import { accountConfigurationAbi } from '../abis.js'
import { accountConfigAddress as defaultAccountConfigAddress } from '../constants.js'
import type { AaActor, AaActorChange } from '../types/transaction.js'
import { encodeActorChangeData } from './actorChangeData.js'

function toInitialActors(actors: readonly AaActor[]) {
  return actors.map((actor) => ({
    actorId: actor.actorId,
    authenticator: actor.authenticator,
  }))
}

function toAbiActorChanges(changes: readonly AaActorChange[]) {
  return changes.map((change) => ({
    changeType: change.changeType,
    actorId: change.actorId,
    data: encodeActorChangeData(change),
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
 * `factoryData` returned by {@link toFactoryArgs8130}).
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

export type ToFactoryArgs8130Parameters = EncodeCreateAccountDataParameters & {
  /**
   * Account Configuration contract address (the ERC-4337 factory). Defaults to
   * the placeholder {@link accountConfigAddress} constant.
   */
  accountConfigAddress?: Address | undefined
}

export type ToFactoryArgs8130ReturnType = {
  factory: Address
  factoryData: Hex
}

export type ToFactoryArgs8130ErrorType =
  | EncodeCreateAccountDataErrorType
  | ErrorType

/**
 * Returns the ERC-4337 `{ factory, factoryData }` for deploying an EIP-8130
 * account through the `AccountConfiguration` contract on a non-8130 chain. The
 * resulting account address matches {@link computeAddress8130}.
 */
export function toFactoryArgs8130(
  parameters: ToFactoryArgs8130Parameters,
): ToFactoryArgs8130ReturnType {
  const {
    accountConfigAddress = defaultAccountConfigAddress,
    ...createParameters
  } = parameters
  return {
    factory: accountConfigAddress,
    factoryData: encodeCreateAccountData(createParameters),
  }
}

export type EncodeApplySignedActorChangesDataParameters = {
  /** The account whose actor configuration is changing. */
  account: Address
  /** Chain ID scope. `0` = valid on any chain (multichain channel). */
  chainId: number
  /** Actor change operations. */
  actorChanges: readonly AaActorChange[]
  /** Authorization signature (`authenticator || data`). */
  auth: Hex
}

export type EncodeApplySignedActorChangesDataErrorType =
  | EncodeFunctionDataErrorType
  | ErrorType

/**
 * Encodes calldata for `AccountConfiguration.applySignedActorChanges` — the
 * portable (any-chain) path to apply signed actor changes via plain EVM
 * execution. Pair with {@link signActorChanges8130} to produce the `auth`.
 */
export function encodeApplySignedActorChangesData(
  parameters: EncodeApplySignedActorChangesDataParameters,
): Hex {
  const { account, chainId, actorChanges, auth } = parameters
  return encodeFunctionData({
    abi: accountConfigurationAbi,
    functionName: 'applySignedActorChanges',
    args: [account, BigInt(chainId), toAbiActorChanges(actorChanges), auth],
  })
}
