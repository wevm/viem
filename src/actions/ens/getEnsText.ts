import type { PublicClient, Transport } from '../../clients/index.js'
import { textResolverAbi, universalResolverAbi } from '../../constants/abis.js'
import type { Address, Chain, Prettify } from '../../types/index.js'
import {
  decodeFunctionResult,
  encodeFunctionData,
  getChainContractAddress,
  toHex,
} from '../../utils/index.js'
import { namehash, packetToBytes } from '../../utils/ens/index.js'
import { readContract } from '../public/index.js'
import type { ReadContractParameters } from '../public/index.js'

export type GetEnsTextParameters = Prettify<
  Pick<ReadContractParameters, 'blockNumber' | 'blockTag'> & {
    /** ENS name to get ENS avatar for. */
    name: string
    /** Text record to retrieve */
    key: string
    /** Address of ENS Universal Resolver Contract. */
    universalResolverAddress?: Address
  }
>

export type GetEnsTextReturnType = string | null

/**
 * @description Gets text record for ENS name.
 *
 * - Calls `resolve(bytes, bytes)` on ENS Universal Resolver Contract.
 * - Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize.html) function for this.
 *
 * @example
 * import { normalize } from 'viem/ens'
 *
 * const twitterRecord = await getEnsText(publicClient, {
 *   name: normalize('wagmi-dev.eth'),
 *   key: 'com.twitter',
 * })
 * // 'wagmi_sh'
 */
export async function getEnsText<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  {
    blockNumber,
    blockTag,
    name,
    key,
    universalResolverAddress: universalResolverAddress_,
  }: GetEnsTextParameters,
): Promise<GetEnsTextReturnType> {
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
    abi: universalResolverAbi,
    functionName: 'resolve',
    args: [
      toHex(packetToBytes(name)),
      encodeFunctionData({
        abi: textResolverAbi,
        functionName: 'text',
        args: [namehash(name), key],
      }),
    ],
    blockNumber,
    blockTag,
  })

  if (res[0] === '0x') return null

  const record = decodeFunctionResult({
    abi: textResolverAbi,
    functionName: 'text',
    data: res[0],
  })

  return record === '' ? null : record
}
