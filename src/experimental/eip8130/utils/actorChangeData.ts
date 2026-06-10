import type { Address } from 'abitype'
import type { ErrorType } from '../../../errors/utils.js'
import type { Hex } from '../../../types/misc.js'
import {
  type DecodeAbiParametersErrorType,
  decodeAbiParameters,
} from '../../../utils/abi/decodeAbiParameters.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from '../../../utils/abi/encodeAbiParameters.js'
import { actorChangeType } from '../constants.js'
import type { AaActorChange } from '../types/transaction.js'

const authorizeDataParameters = [
  {
    type: 'tuple',
    components: [
      { name: 'authenticator', type: 'address' },
      { name: 'scope', type: 'uint8' },
      { name: 'expiry', type: 'uint48' },
      { name: 'policyType', type: 'uint8' },
    ],
  },
  { type: 'bytes' },
] as const

export type EncodeActorChangeDataErrorType =
  | EncodeAbiParametersErrorType
  | ErrorType

/**
 * Encodes the operation-specific `data` of an `actor_change`:
 *
 * - `authorizeActor` -> `abi.encode((address,uint8,uint48,uint8) config, bytes policyData)`
 * - `revokeActor` -> empty bytes (`0x`)
 *
 * @remarks
 * The `data` is ABI-encoded (not RLP) so the same blob is decoded identically by
 * the native protocol and by `AccountConfiguration.applySignedActorChanges`
 * (`abi.decode(data, (ActorConfig, bytes))`). It is also the value hashed in the
 * config-change signature digest (see {@link hashActorChanges8130}).
 */
export function encodeActorChangeData(change: AaActorChange): Hex {
  if (change.changeType === actorChangeType.authorizeActor)
    return encodeAbiParameters(authorizeDataParameters, [
      {
        authenticator: change.authenticator,
        scope: change.scope ?? 0,
        expiry: change.expiry ?? 0n,
        policyType: change.policyType ?? 0,
      },
      change.policyData ?? '0x',
    ])
  return '0x'
}

export type DecodedAuthorizeActorData = {
  authenticator: Address
  scope: number
  expiry: bigint
  policyType: number
  policyData: Hex
}

export type DecodeAuthorizeActorDataErrorType =
  | DecodeAbiParametersErrorType
  | ErrorType

/** Decodes the `authorizeActor` `data` produced by {@link encodeActorChangeData}. */
export function decodeAuthorizeActorData(data: Hex): DecodedAuthorizeActorData {
  const [config, policyData] = decodeAbiParameters(
    authorizeDataParameters,
    data,
  )
  return {
    authenticator: config.authenticator,
    scope: config.scope,
    expiry: BigInt(config.expiry),
    policyType: config.policyType,
    policyData,
  }
}
