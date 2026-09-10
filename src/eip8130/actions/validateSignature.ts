import type { Address, TypedData } from 'abitype'

import { readContract } from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex, SignableMessage } from '../../types/misc.js'
import type { TypedDataDefinition } from '../../types/typedData.js'
import { hashMessage } from '../../utils/signature/hashMessage.js'
import { hashTypedData } from '../../utils/signature/hashTypedData.js'
import { keystoreAbi } from '../abis.js'
import { keystoreAddress } from '../constants.js'

export type ValidateSignatureParameters = {
  /** The account the signature is validated against. */
  account: Address
  /**
   * The EIP-8130 signature envelope (`sigType || authenticator || data`), e.g.
   * from `account.signMessage(...)` or `signMessageEnvelope(...)`.
   */
  signature: Hex
} & (
  | { message: SignableMessage; hash?: undefined; typedData?: undefined }
  | { hash: Hex; message?: undefined; typedData?: undefined }
  | {
      typedData: TypedDataDefinition<
        TypedData | Record<string, unknown>,
        string
      >
      message?: undefined
      hash?: undefined
    }
)

export type ValidateSignatureReturnType = {
  /** Whether the signature authenticated a live actor of the account. */
  valid: boolean
  /** The verified actor's identifier (zero-ish when invalid). */
  actorId: Hex
  /** The verified actor's scope bitmask (`0` = unrestricted admin). */
  scope: number
}

/**
 * Verifies an EIP-8130 signature envelope against the `Keystore`
 * (`validateSignature`), returning the resolved `actorId` and `scope`.
 *
 * This is the finer-grained counterpart to core `client.verifyMessage` (which
 * only tells you pass/fail via ERC-1271): use it when you need to know *which*
 * actor signed, or to apply your own scope-based authorization (e.g. gate on
 * `Scopes.isOperator`, i.e. `scope === 0 || (scope & actorScope.operator)`).
 * The keystore reverts when the actor cannot be authenticated, which is surfaced
 * here as `valid: false`.
 *
 * @example
 * ```ts
 * import { validateSignature } from 'viem/eip8130'
 *
 * const { valid, actorId, scope } = await validateSignature(client, {
 *   account: account.address,
 *   message: 'hello world',
 *   signature, // from account.signMessage({ message: 'hello world' })
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The verification result plus the resolved actor id and scope.
 */
export async function validateSignature<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: ValidateSignatureParameters,
): Promise<ValidateSignatureReturnType> {
  const { account, signature } = parameters
  const hash =
    parameters.hash ??
    (parameters.message !== undefined
      ? hashMessage(parameters.message)
      : hashTypedData(parameters.typedData as never))

  try {
    const [actorId, scope] = await readContract(client, {
      address: keystoreAddress,
      abi: keystoreAbi,
      functionName: 'validateSignature',
      args: [account, hash, signature],
    })
    return { valid: true, actorId, scope }
  } catch {
    // The keystore reverts (UnknownSignatureType / AuthenticationFailed / …)
    // when the envelope does not authenticate a live actor.
    return {
      valid: false,
      actorId:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      scope: 0,
    }
  }
}
