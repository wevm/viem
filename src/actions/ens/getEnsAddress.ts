import type { PublicClient, Transport } from '../../clients/index.js'
import type { Address, Chain, Prettify } from '../../types/index.js'
import {
  decodeFunctionResult,
  encodeFunctionData,
  getChainContractAddress,
  toHex,
} from '../../utils/index.js'
import { namehash, packetToBytes } from '../../utils/ens/index.js'
import { readContract, ReadContractParameters } from '../public/index.js'

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
 */
export async function getEnsAddress<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
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

    universalResolverAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: 'ensUniversalResolver',
    })
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
