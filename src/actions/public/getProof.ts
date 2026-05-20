import type * as Address from 'ox/Address'

import { BaseError } from '../../core/BaseError.js'
import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import * as AccountProof from '../../utils/AccountProof.js'
import type * as Block from '../../utils/Block.js'
import * as Hex from '../../utils/Hex.js'

/**
 * Returns the account and storage values of the specified account including
 * the Merkle proof, as defined in EIP-1186.
 *
 * @example
 * ```ts twoslash
 * import { actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http()
 * })
 *
 * const proof = await actions.getProof(client, {
 *   address: '0x0000000000000000000000000000000000000000',
 *   storageKeys: [
 *     '0x0000000000000000000000000000000000000000000000000000000000000000'
 *   ]
 * })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Account proof.
 */
export async function getProof<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getProof.Options,
): getProof.ReturnType {
  const {
    address,
    blockHash,
    blockNumber,
    blockTag = 'latest',
    requireCanonical,
    storageKeys,
  } = options

  if (requireCanonical !== undefined && !blockHash)
    throw new InvalidBlockIdentifierError()

  const block = (() => {
    if (blockHash)
      return requireCanonical !== undefined
        ? { blockHash, requireCanonical }
        : { blockHash }
    if (blockNumber !== undefined) return Hex.fromNumber(blockNumber)
    return blockTag
  })()

  const proof = await client.request({
    method: 'eth_getProof',
    params: [address, [...storageKeys], block],
  })

  return AccountProof.fromRpc(proof)
}

export declare namespace getProof {
  type Options = {
    /** Account address. */
    address: Address.Address
    /** Array of storage keys to proof and include. */
    storageKeys: readonly Hex.Hex[]
  } & (
    | {
        /** Block number to pull the proof from. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
        blockHash?: undefined
        requireCanonical?: undefined
      }
    | {
        blockNumber?: undefined
        /**
         * Block tag to pull the proof from.
         * @default 'latest'
         */
        blockTag?: Block.Tag | undefined
        blockHash?: undefined
        requireCanonical?: undefined
      }
    | {
        blockNumber?: undefined
        blockTag?: undefined
        /** Block hash to pull the proof from. */
        blockHash: Hex.Hex
        /**
         * Whether or not to throw an error if the block is not in the
         * canonical chain. Only allowed in conjunction with `blockHash`.
         */
        requireCanonical?: boolean | undefined
      }
  )

  type ReturnType = Promise<AccountProof.AccountProof>

  type ErrorType =
    | Hex.fromNumber.ErrorType
    | AccountProof.fromRpc.ErrorType
    | InvalidBlockIdentifierError
}

export class InvalidBlockIdentifierError extends BaseError {
  override name = 'actions.public.InvalidBlockIdentifierError'

  constructor() {
    super('`requireCanonical` can only be provided when `blockHash` is set.')
  }
}
