import { Secp256k1 } from 'ox'
import * as Hex from 'ox/Hex'
import * as P256 from 'ox/P256'
import { SignatureEnvelope } from 'ox/tempo'
import * as WebAuthnP256 from 'ox/WebAuthnP256'
import {
  type VerifyHashParameters,
  type VerifyHashReturnType,
  verifyHash as viem_verifyHash,
} from '../../actions/public/verifyHash.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import type { PartialBy } from '../../types/utils.js'
import { getAction } from '../../utils/getAction.js'

/**
 * Verifies that a signature is valid for a given hash and address.
 * Supports multiple signature types: Secp256k1, P256, WebCrypto P256, and WebAuthn P256.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions, Account, P256 } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const privateKey = P256.randomPrivateKey()
 * const account = Account.fromP256(privateKey)
 *
 * const hash = '0x...'
 * const signature = await account.sign({ hash })
 *
 * const valid = await Actions.verifyHash(client, {
 *   hash,
 *   signature,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the signature is valid.
 */
export async function verifyHash<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: verifyHash.Parameters,
): Promise<verifyHash.ReturnValue> {
  const { hash } = parameters

  const signature = (() => {
    const signature = parameters.signature
    if (Hex.validate(signature)) return signature
    if (typeof signature === 'object' && 'r' in signature && 's' in signature)
      return SignatureEnvelope.serialize({
        type: 'secp256k1',
        signature: {
          r: BigInt(signature.r),
          s: BigInt(signature.s),
          yParity: signature.yParity!,
        },
      })
    return Hex.fromBytes(signature)
  })()

  const [envelope, userAddress] = (() => {
    const envelope = SignatureEnvelope.from(signature)
    if (envelope.type === 'keychain')
      return [envelope.inner, envelope.userAddress]
    return [envelope, undefined]
  })()

  if (envelope.type === 'p256')
    return P256.verify({
      payload: hash,
      publicKey: envelope.publicKey,
      signature: envelope.signature,
      hash: envelope.prehash,
    })
  if (envelope.type === 'webAuthn')
    return WebAuthnP256.verify({
      challenge: hash,
      metadata: envelope.metadata,
      publicKey: envelope.publicKey,
      signature: envelope.signature,
    })
  if (envelope.type === 'keychain') throw new Error('not supported')

  const address =
    parameters.address ??
    userAddress ??
    Secp256k1.recoverAddress({
      payload: hash,
      signature: envelope.signature,
    })

  return await getAction(
    client,
    viem_verifyHash,
    'verifyHash',
  )({ ...parameters, address } as never)
}

export declare namespace verifyHash {
  export type Parameters = PartialBy<VerifyHashParameters, 'address'>

  export type ReturnValue = VerifyHashReturnType
}
