import type { PublicClient, Transport } from '../../clients'
import type { Address, Chain, Prettify } from '../../types'
import {
  multiAddressResolverAbi,
  singleAddressResolverAbi,
  universalResolverAbi,
} from '../../constants/abis'
import {
  decodeFunctionResult,
  encodeFunctionData,
  getChainContractAddress,
  toHex,
} from '../../utils'
import { namehash, packetToBytes } from '../../utils/ens'
import type { MulticoinRequest } from '../../utils/ens/multicoin'
import { readContract, ReadContractParameters } from '../public'

export type GetEnsAddressParameters<T extends MulticoinRequest | undefined> =
  Prettify<
    Pick<ReadContractParameters, 'blockNumber' | 'blockTag'> & {
      /** ENS name to get address. */
      name: string
      coin?: T
      /** Address of ENS Universal Resolver Contract */
      universalResolverAddress?: Address
    }
  >

export type GetEnsAddressReturnType<T> = T extends MulticoinRequest
  ? string | null
  : Address

/**
 * @description Gets address for ENS name.
 *
 * - Calls `resolve(bytes, bytes)` on ENS Universal Resolver Contract.
 * - Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize.html) function for this.
 */
export async function getEnsAddress<
  TChain extends Chain | undefined,
  T extends MulticoinRequest | undefined,
>(
  client: PublicClient<Transport, TChain>,
  {
    blockNumber,
    blockTag,
    name,
    coin,
    universalResolverAddress: universalResolverAddress_,
  }: GetEnsAddressParameters<T>,
): Promise<GetEnsAddressReturnType<T>> {
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

  const isMulticoin = !!coin
  const functionData = isMulticoin
    ? encodeFunctionData({
        abi: multiAddressResolverAbi,
        functionName: 'addr',
        args: [namehash(name), BigInt(coin.coinType)],
      })
    : encodeFunctionData({
        abi: singleAddressResolverAbi,
        functionName: 'addr',
        args: [namehash(name)],
      })

  const res = await readContract(client, {
    address: universalResolverAddress,
    abi: universalResolverAbi,
    functionName: 'resolve',
    args: [toHex(packetToBytes(name)), functionData],
    blockNumber,
    blockTag,
  })
  if (isMulticoin) {
    let returnValue: string | null = null
    const encoded = decodeFunctionResult({
      abi: multiAddressResolverAbi,
      functionName: 'addr',
      data: res[0],
    })
    if (encoded !== '0x')
      returnValue = coin.encoder(Buffer.from(encoded.slice(2), 'hex'))
    return returnValue as GetEnsAddressReturnType<T>
  }
  return decodeFunctionResult({
    abi: singleAddressResolverAbi,
    functionName: 'addr',
    data: res[0],
  })
}
