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

export type GetEnsAvatarParameters = Prettify<
  Pick<ReadContractParameters, 'blockNumber' | 'blockTag'> & {
    /** ENS name to get ENS avatar for. */
    name: string
    /** Address of ENS Universal Resolver Contract. */
    universalResolverAddress?: Address
  }
>

export type GetEnsAvatarReturnType = string | null

/**
 * @description Gets avatar for specified address.
 *
 * - Calls `text(bytes, string)` on ENS Universal Resolver Contract.
 *
 * @example
 * const ensAvatar = await getEnsAvatar(publicClient, {
 *   name: 'kesar.eth',
 * })
 * // 'wagmi-dev.eth'
 */
export async function getEnsAvatar(
  client: PublicClient,
  {
    name,
    blockNumber,
    blockTag,
    universalResolverAddress: universalResolverAddress_,
  }: GetEnsAvatarParameters,
): Promise<GetEnsAvatarReturnType> {
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
          name: 'text',
          type: 'function',
          stateMutability: 'view',
          inputs: [
            { type: 'bytes32', name: 'node' },
            { type: 'string', name: 'key' },
          ],
          outputs: [{ name: '', type: 'string' }],
        },
      ],
      functionName: 'text',
      args: [namehash(name), 'avatar'],
      blockNumber,
      blockTag,
    })
    return res
  } catch (error) {
    if (
      error instanceof ContractFunctionExecutionError &&
      (error.cause as ContractFunctionRevertedError).reason === panicReasons[50]
    )
      // No primary avatar set for ens name.
      return null
    throw error
  }
}
