import { PublicClient } from '../../clients'
import type { Address, Prettify } from '../../types'
import { packetToBuffer } from '../../utils/ens'
import { readContract, ReadContractArgs } from '../public'

export type GetEnsNameArgs = Prettify<
  Pick<ReadContractArgs, 'blockNumber' | 'blockTag'> & {
    /** Address to get ENS name for. */
    address: Address
    /** Address of ENS Universal Resolver Contract */
    universalResolverAddress: Address
  }
>

/**
 * @description Gets primary name for specified address.
 *
 * - Calls `reverse(bytes)` on ENS Universal Resolver Contract.
 *
 * @example
 * const ensName = await getEnsName(publicClient, {
 *   address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
 *   universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
 * })
 * console.log(ensName) // 'wagmi-dev.eth'
 */
export async function getEnsName(
  client: PublicClient,
  { address, blockNumber, blockTag, universalResolverAddress }: GetEnsNameArgs,
) {
  const reverseNode = `${address.toLowerCase().substring(2)}.addr.reverse`
  try {
    const res = await readContract(client, {
      address: universalResolverAddress,
      abi: [
        {
          name: 'reverse',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ type: 'bytes', name: 'reverseName' }],
          outputs: [
            { type: 'string', name: 'resolvedName' },
            { type: 'address', name: 'resolvedAddress' },
            { type: 'address', name: 'reverseResolver' },
            { type: 'address', name: 'resolver' },
          ],
        },
      ],
      functionName: 'reverse',
      args: [`0x${packetToBuffer(reverseNode).toString('hex')}`],
      blockNumber,
      blockTag,
    })
    return res[0]
  } catch (error) {
    return null
  }
}
