import type { Address } from 'abitype'
import type * as Hex from 'ox/Hex'
import * as TypedData from 'ox/TypedData'
import { MultisigConfig, Passport, ZkSignature } from 'ox/tempo'
import { getChainId } from '../../actions/public/getChainId.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import { isAddressEqual } from '../../utils/address/isAddressEqual.js'
import { nativeMultisigFactory } from '../Addresses.js'
import { getKeyValidUntil } from './keyPublisher.js'
import { getConfigCommitment } from './multisig.js'

// TIP-1131's allowance for a signer's clock running ahead.
const maxFutureSkew = 60

/**
 * Verifies a passport owner binding: a scheme `0x02` message signature showing that
 * a passport holding its chip is an owner of a configurable account.
 *
 * Checks the proof with `verifyProof`, that the Key Publisher still lists its
 * document signer root, that `config` is the account's current configuration,
 * and that the passport's address is one of its owners.
 *
 * [TIP-1142](https://tips.sh/1142)
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const valid = await Actions.passport.verify(client, {
 *   account: '0x...',
 *   binding: '0x...',
 *   config,
 *   verifyProof: ({ proof, publicInput }) => verifyGroth16({ proof, publicInput }),
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the binding is valid for the account.
 */
export async function verify<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: verify.Parameters,
): Promise<verify.ReturnValue> {
  const { account, binding, config, verifyProof } = parameters

  const signature = (() => {
    if (typeof binding !== 'string') return binding
    try {
      return ZkSignature.deserializeMessage(binding)
    } catch {
      return undefined
    }
  })()
  if (!signature || signature.scheme !== Passport.scheme) return false
  if (signature.issuedAt > Math.floor(Date.now() / 1000) + maxFutureSkew)
    return false

  const chainId = client.chain?.id ?? (await getChainId(client))
  const payload = TypedData.getSignPayload(
    Passport.getBindingTypedData({ account, chainId }),
  )
  const publicInput = Passport.getPublicInput({ ...signature, payload })
  if (!(await verifyProof({ proof: signature.proof, publicInput })))
    return false

  // Zero means never listed, or revoked. A root rotated out stays valid for
  // message signatures, since the passport app chooses `issuedAt`.
  const validUntil = await getKeyValidUntil(client, {
    issuer: signature.issuer,
    keyHash: signature.keyHash,
    publisherId: signature.publisherId,
  })
  if (validUntil === 0n || validUntil < BigInt(signature.issuedAt)) return false

  // Zero means the account has no persisted update, so its address fixes its configuration.
  const commitment = await getConfigCommitment(client, { account })
  const current = (() => {
    try {
      if (BigInt(commitment) !== 0n)
        return MultisigConfig.getCommitment(config) === commitment
      return isAddressEqual(
        MultisigConfig.getAddress(config, { factory: nativeMultisigFactory }),
        account,
      )
    } catch {
      return false
    }
  })()
  if (!current) return false

  const address = ZkSignature.getAddress(signature)
  return config.owners.some((owner) => isAddressEqual(owner.owner, address))
}

export declare namespace verify {
  export type Parameters = {
    /** Configurable account the binding names. */
    account: Address
    /** Serialized message signature, or its decoded fields. */
    binding: Hex.Hex | ZkSignature.MessageSignature
    /** The account's current configuration, such as one carried by its signature. */
    config: MultisigConfig.Input
    /** Verifies a Groth16 proof against scheme `0x02`'s verifying key. */
    verifyProof: (parameters: {
      /** 256-byte Groth16 proof. */
      proof: Hex.Hex
      /** Public input the proof must verify for. */
      publicInput: Hex.Hex
    }) => boolean | Promise<boolean>
  }

  export type ReturnValue = boolean

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}
