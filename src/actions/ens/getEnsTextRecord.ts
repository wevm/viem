import type { PublicClient } from '../../clients'
import { panicReasons } from '../../constants'
import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
} from '../../errors'
import type { Address, Prettify } from '../../types'
import {
  decodeFunctionResult,
  encodeFunctionData,
  getChainContractAddress,
  toHex,
} from '../../utils'
import { namehash, packetToBytes } from '../../utils/ens'
import { readContract, ReadContractParameters } from '../public'

export type getEnsTextRecordParameters = Prettify<
  Pick<ReadContractParameters, 'blockNumber' | 'blockTag'> & {
    /** ENS name to get ENS Text for. */
    name: string
    /** ENS key to get ENS Text for. */
    key: string
    /** Address of ENS Universal Resolver Contract. */
    universalResolverAddress?: Address
  }
>

export type getEnsTextRecordReturnType = string | null

/**
 * @description Gets Text for specified address.
 *
 * - Calls `resolve(bytes name, bytes data)` on ENS Universal Resolver Contract.
 *
 * @example
 * const ensText = await getEnsTextRecord(publicClient, {
 *   name: 'kesar.eth',
 *   key: 'avatar',
 * })
 * // 'https://....'
 */
export async function getEnsTextRecord(
  client: PublicClient,
  {
    name,
    key,
    blockNumber,
    blockTag,
    universalResolverAddress: universalResolverAddress_,
  }: getEnsTextRecordParameters,
): Promise<getEnsTextRecordReturnType> {
  let universalResolverAddress = universalResolverAddress_
  if (!universalResolverAddress) {
    if (!client.chain)
      throw new Error(
        'client chain not configured. universalResolverAddress is required.',
      )

    universalResolverAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: 'ensUniversalResolver',
    })
  }
  try {
    const res = await readContract(client, {
      address: universalResolverAddress,
      abi: [
        {
          name: 'resolve',
          type: 'function',
          stateMutability: 'view',
          inputs: [
            { name: 'name', type: 'bytes' },
            { name: 'data', type: 'bytes' },
          ],
          outputs: [
            { name: '', type: 'bytes' },
            { name: 'address', type: 'address' },
          ],
        },
      ],
      functionName: 'resolve',
      args: [
        toHex(packetToBytes(name)),
        encodeFunctionData({
          abi: [
            {
              name: 'text',
              type: 'function',
              stateMutability: 'view',
              inputs: [
                { type: 'bytes32', name: 'node' },
                { type: 'string', name: 'key' },
              ],
              outputs: [],
            },
          ],
          functionName: 'text',
          args: [namehash(name), key],
        }),
      ],
      blockNumber,
      blockTag,
    })
    return decodeFunctionResult({
      abi: [
        {
          name: 'text',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ name: '', type: 'string' }],
        },
      ],
      functionName: 'text',
      data: res[0],
    })
  } catch (error) {
    if (
      error instanceof ContractFunctionExecutionError &&
      (error.cause as ContractFunctionRevertedError).reason === panicReasons[50]
    )
      // No primary Text set for ens name.
      return null
    throw error
  }
}
