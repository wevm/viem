import type { Address } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import {
  textResolverAbi,
  universalResolverResolveArrayAbi,
} from '../../constants/abis.js'
import type { Chain } from '../../types/chain.js'
import type { Prettify } from '../../types/utils.js'
import { decodeFunctionResult } from '../../utils/abi/decodeFunctionResult.js'
import { encodeFunctionData } from '../../utils/abi/encodeFunctionData.js'
import { getChainContractAddress } from '../../utils/chain.js'
import { toHex } from '../../utils/encoding/toHex.js'
import { isNullUniversalResolverError } from '../../utils/ens/errors.js'
import { namehash } from '../../utils/ens/namehash.js'
import { packetToBytes } from '../../utils/ens/packetToBytes.js'
import {
  type ReadContractParameters,
  readContract,
} from '../public/readContract.js'

export type GetEnsTextParameters<TKeys> = Prettify<
  Pick<ReadContractParameters, 'blockNumber' | 'blockTag'> & {
    /** ENS name to get Text for. */
    name: string
    /** Text record(s) to retrieve. */
    key: TKeys
    /** Address of ENS Universal Resolver Contract. */
    universalResolverAddress?: Address
  }
>

// if a single key is passed, return a single string or null. otherwise, return an array of strings or nulls.
export type GetEnsTextReturnType<T> = T extends string
  ? string | null
  : (string | null)[] | null

/**
 * Gets a text record(s) for specified ENS name.
 *
 * - Docs: https://viem.sh/docs/ens/actions/getEnsResolver.html
 * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/ens
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
 *   name: normalize('wagmi-dev.eth'),
 *   key: 'com.twitter',
 * })
 * // 'wagmi_sh'
 */
export async function getEnsText<
  TChain extends Chain | undefined,
  TKeys extends string | string[],
>(
  client: Client<Transport, TChain>,
  {
    blockNumber,
    blockTag,
    name,
    key,
    universalResolverAddress: universalResolverAddress_,
  }: GetEnsTextParameters<TKeys>,
): Promise<GetEnsTextReturnType<TKeys>> {
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

  // If a single key is passed, push it into an array so we can use the same logic for both cases
  const keys: string[] = Array.isArray(key) ? key : [key]

  try {
    const res = await readContract(client, {
      address: universalResolverAddress,
      abi: universalResolverResolveArrayAbi,
      functionName: 'resolve',
      args: [
        toHex(packetToBytes(name)),
        keys.map((k) =>
          encodeFunctionData({
            abi: textResolverAbi,
            functionName: 'text',
            args: [namehash(name), k],
          }),
        ),
      ],
      blockNumber,
      blockTag,
    })

    const decodedRecords: (string | null)[] = []

    for (const encodedRecord of res[0]) {
      if (encodedRecord === '0x') {
        decodedRecords.push(null)
        continue
      }

      const record = decodeFunctionResult({
        abi: textResolverAbi,
        functionName: 'text',
        data: encodedRecord,
      })

      decodedRecords.push(record === '' ? null : record)
    }

    return (
      decodedRecords.length === 1 ? decodedRecords[0] : decodedRecords
    ) as GetEnsTextReturnType<TKeys>
  } catch (err) {
    if (isNullUniversalResolverError(err, 'resolve')) return null
    throw err
  }
}
