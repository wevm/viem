import { PublicClient } from '../../clients'
import type { Address, Hex, Prettify } from '../../types'
import { decodeFunctionResult, encodeFunctionData } from '../../utils'
import { namehash, packetToBuffer } from '../../utils/ens'
import { readContract, ReadContractArgs } from '../public'

export type GetEnsAddressArgs = Prettify<
  Pick<ReadContractArgs, 'blockNumber' | 'blockTag'> & {
    /** ENS name to get address. */
    name: string
    /** Address of ENS Universal Resolver Contract */
    universalResolverAddress: Address
  }
>

/**
 * @description Gets address for ENS name.
 *
 * - Calls `resolve(bytes, bytes)` on ENS Universal Resolver Contract.
 *
 * @example
 * const ensAddress = await getEnsAddress(publicClient, {
 *   name: 'wagmi-dev.eth',
 *   universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
 * })
 * console.log(ensAddress) // '0xd2135CfB216b74109775236E36d4b433F1DF507B'
 */
export async function getEnsAddress(
  client: PublicClient,
  { blockNumber, blockTag, name, universalResolverAddress }: GetEnsAddressArgs,
) {
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
      `0x${packetToBuffer(name).toString('hex')}`,
      encodeFunctionData({
        abi: [
          {
            name: 'addr',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'name', type: 'bytes32' }],
            outputs: [],
          },
        ],
        functionName: 'addr',
        args: [namehash(name)],
      }),
    ],
    blockNumber,
    blockTag,
  })
  return decodeFunctionResult({
    abi: [
      {
        name: 'addr',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: 'name', type: 'address' }],
      },
    ],
    functionName: 'addr',
    data: res[0],
  })
}
