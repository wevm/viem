import { PublicClient } from '../../clients'
import { ChainDoesNotSupportContract } from '../../errors'
import type { Address, Prettify } from '../../types'
import { decodeFunctionResult, encodeFunctionData, toHex } from '../../utils'
import { namehash, packetToBytes } from '../../utils/ens'
import { readContract, ReadContractParameters } from '../public'

export type GetEnsAddressParameters = Prettify<
  Pick<ReadContractParameters, 'blockNumber' | 'blockTag'> & {
    /** ENS name to get address. */
    name: string
    /** Address of ENS Universal Resolver Contract */
    universalResolverAddress?: Address
  }
>

export type GetEnsAddressReturnType = Address

/**
 * @description Gets address for ENS name.
 *
 * - Calls `resolve(bytes, bytes)` on ENS Universal Resolver Contract.
 * - Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize.html) function for this.
 *
 * @example
 * import { normalize } from 'viem/ens'
 *
 * const ensAddress = await getEnsAddress(publicClient, {
 *   name: normalize('wagmi-dev.eth'),
 * })
 * // '0xd2135CfB216b74109775236E36d4b433F1DF507B'
 */
export async function getEnsAddress(
  client: PublicClient,
  {
    blockNumber,
    blockTag,
    name,
    universalResolverAddress: universalResolverAddress_,
  }: GetEnsAddressParameters,
): Promise<GetEnsAddressReturnType> {
  let universalResolverAddress = universalResolverAddress_
  if (!universalResolverAddress) {
    if (!client.chain)
      throw new Error(
        'client chain not configured. universalResolverAddress is required.',
      )

    const contract = client.chain?.contracts?.ensUniversalResolver
    if (!contract)
      throw new ChainDoesNotSupportContract({
        chain: client.chain,
        contract: { name: 'ensUniversalResolver' },
      })

    if (
      blockNumber &&
      contract.blockCreated &&
      contract.blockCreated > blockNumber
    )
      throw new ChainDoesNotSupportContract({
        blockNumber,
        chain: client.chain,
        contract: {
          name: 'ensUniversalResolver',
          blockCreated: contract.blockCreated,
        },
      })

    universalResolverAddress = contract.address
  }

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
