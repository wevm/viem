import type { Address } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import {
  textResolverAbi,
  universalResolverResolveAbi,
} from '../../constants/abis.js'
import type { Chain } from '../../types/chain.js'
import type { Prettify } from '../../types/utils.js'
import {
  type DecodeFunctionResultErrorType,
  decodeFunctionResult,
} from '../../utils/abi/decodeFunctionResult.js'
import {
  type EncodeFunctionDataErrorType,
  encodeFunctionData,
} from '../../utils/abi/encodeFunctionData.js'
import {
  type GetChainContractAddressErrorType,
  getChainContractAddress,
} from '../../utils/chain/getChainContractAddress.js'
import { type ToHexErrorType, toHex } from '../../utils/encoding/toHex.js'
import { isNullUniversalResolverError } from '../../utils/ens/errors.js'
import { type NamehashErrorType, namehash } from '../../utils/ens/namehash.js'
import {
  type PacketToBytesErrorType,
  packetToBytes,
} from '../../utils/ens/packetToBytes.js'
import { getAction } from '../../utils/getAction.js'
import {
  type ReadContractErrorType,
  type ReadContractParameters,
  readContract,
} from '../public/readContract.js'

export type GetEnsTextParameters = Prettify<
  Pick<ReadContractParameters, 'blockNumber' | 'blockTag'> & {
    /** ENS name to get Text for. */
    name: string
    /** Text record to retrieve. */
    key: string
    /** Address of ENS Universal Resolver Contract. */
    universalResolverAddress?: Address
  }
>

export type GetEnsTextReturnType = string | null

export type GetEnsTextErrorType =
  | GetChainContractAddressErrorType
  | ReadContractErrorType
  | ToHexErrorType
  | PacketToBytesErrorType
  | EncodeFunctionDataErrorType
  | NamehashErrorType
  | DecodeFunctionResultErrorType

/**
 * Gets a text record for specified ENS name.
 *
 * - Docs: https://viem.sh/docs/ens/actions/getEnsResolver.html
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/ens
 *
 * Calls `resolve(bytes, bytes)` on ENS Universal Resolver Contract.
 *
 * Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize.html) function for this.
 *
 * @param client - Client to use
 * @param parameters - {@link GetEnsTextParameters}
 * @returns Address for ENS resolver. {@link GetEnsTextReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getEnsText, normalize } from 'viem/ens'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const twitterRecord = await getEnsText(client, {
 *   name: normalize('wevm.eth'),
 *   key: 'com.twitter',
 * })
 * // 'wagmi_sh'
 */
export async function getEnsText<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
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

  try {
    const res = await getAction(
      client,
      readContract,
      'readContract',
    )({
      address: universalResolverAddress,
      abi: universalResolverResolveAbi,
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
  } catch (err) {
    if (isNullUniversalResolverError(err, 'resolve')) return null
    throw err
  }
}
