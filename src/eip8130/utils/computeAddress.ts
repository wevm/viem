import type { Address } from 'abitype'
import { BaseError } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import {
  type GetCreate2AddressErrorType,
  getCreate2Address,
} from '../../utils/address/getContractAddress.js'
import { type ConcatHexErrorType, concatHex } from '../../utils/data/concat.js'
import { size } from '../../utils/data/size.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { bytesToHex, toHex } from '../../utils/encoding/toHex.js'
import {
  type Keccak256ErrorType,
  keccak256,
} from '../../utils/hash/keccak256.js'
import { keystoreAddress, maxCodeSize } from '../constants.js'
import type { AaActor } from '../types/transaction.js'

/**
 * Builds the 14-byte `DEPLOYMENT_HEADER(n)` EVM loader that copies the trailing
 * runtime code into memory and returns it.
 */
export function deploymentHeader(codeSize: number): Hex {
  const hi = (codeSize >> 8) & 0xff
  const lo = codeSize & 0xff
  return bytesToHex(
    Uint8Array.from([
      0x61,
      hi,
      lo,
      0x60,
      0x0e,
      0x60,
      0x00,
      0x39,
      0x61,
      hi,
      lo,
      0x60,
      0x00,
      0xf3,
    ]),
  )
}

export type ComputeAddressParameters = {
  /** User-chosen uniqueness factor (bytes32). */
  userSalt: Hex
  /** Runtime bytecode to be placed at the account address. */
  code: Hex
  /**
   * Initial actors. MUST be sorted by `actorId` in strictly ascending order
   * (this also rejects duplicate `actorId`s).
   */
  initialActors: readonly AaActor[]
}

export type ComputeAddressErrorType =
  | GetCreate2AddressErrorType
  | ConcatHexErrorType
  | Keccak256ErrorType
  | BaseError
  | ErrorType

/**
 * Computes the counterfactual address for an EIP-8130 `create` entry using the
 * CREATE2 derivation:
 *
 * ```
 * // per actor leaf: keccak256(actorId(32) || authenticator(20) || scope(2 BE) || policyData(0|52))
 * actors_commitment = keccak256(leaf_0 || leaf_1 || ... || leaf_{n-1})
 * effective_salt    = keccak256(user_salt || actors_commitment)
 * deployment_code   = DEPLOYMENT_HEADER(len(code)) || code
 * address           = keccak256(0xff || ACCOUNT_CONFIG_ADDRESS || effective_salt || keccak256(deployment_code))[12:]
 * ```
 *
 * The commitment is a "hash-the-leaves-then-hash-the-list" scheme (EIP-8130
 * `_computeActorsCommitment`): each actor is hashed into a 32-byte leaf, then
 * the packed leaves are hashed once.
 */
export function computeAddress(parameters: ComputeAddressParameters): Address {
  const { userSalt, code, initialActors } = parameters

  const codeSize = size(code)
  if (codeSize === 0) throw new BaseError('`code` must not be empty.')
  if (codeSize > maxCodeSize)
    throw new BaseError(
      `\`code\` exceeds the maximum code size (${maxCodeSize} bytes): got ${codeSize} bytes.`,
    )
  if (initialActors.length === 0)
    throw new BaseError('`initialActors` must not be empty.')

  // Require strictly ascending `actorId` order (also rejects duplicates).
  for (let i = 1; i < initialActors.length; i++) {
    if (
      hexToBigInt(initialActors[i].actorId) <=
      hexToBigInt(initialActors[i - 1].actorId)
    )
      throw new BaseError(
        '`initialActors` must be sorted by `actorId` in strictly ascending order (no duplicates).',
      )
  }

  const actorsCommitment = keccak256(
    concatHex(
      initialActors.map((actor) =>
        keccak256(
          concatHex([
            actor.actorId,
            actor.authenticator,
            toHex(actor.scope ?? 0, { size: 2 }),
            actor.policyData ?? '0x',
          ]),
        ),
      ),
    ),
  )
  const effectiveSalt = keccak256(concatHex([userSalt, actorsCommitment]))
  const deploymentCode = concatHex([deploymentHeader(codeSize), code])

  return getCreate2Address({
    from: keystoreAddress,
    salt: effectiveSalt,
    bytecode: deploymentCode,
  })
}
