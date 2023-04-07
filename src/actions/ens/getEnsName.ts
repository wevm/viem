import type { PublicClient, Transport } from '../../clients/index.js'
import { panicReasons } from '../../constants/index.js'
import type { ContractFunctionRevertedError } from '../../errors/index.js'
import { ContractFunctionExecutionError } from '../../errors/index.js'
import type { Address, Chain, Prettify } from '../../types/index.js'
import { getChainContractAddress, toHex } from '../../utils/index.js'
import { packetToBytes } from '../../utils/ens/index.js'
import { readContract } from '../public/index.js'
import type { ReadContractParameters } from '../public/index.js'

export type GetEnsNameParameters = Prettify<
  Pick<ReadContractParameters, 'blockNumber' | 'blockTag'> & {
    /** Address to get ENS name for. */
    address: Address
    /** Address of ENS Universal Resolver Contract. */
    universalResolverAddress?: Address
  }
>

export type GetEnsNameReturnType = string | null

/**
 * @description Gets primary name for specified address.
 *
 * - Calls `reverse(bytes)` on ENS Universal Resolver Contract.
 *
 * @example
 * const ensName = await getEnsName(publicClient, {
 *   address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
 * })
 * // 'wagmi-dev.eth'
 */
export async function getEnsName<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  {
    address,
    blockNumber,
    blockTag,
    universalResolverAddress: universalResolverAddress_,
  }: GetEnsNameParameters,
): Promise<GetEnsNameReturnType> {
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
      args: [toHex(packetToBytes(reverseNode))],
      blockNumber,
      blockTag,
    })
    return res[0]
  } catch (error) {
    if (
      error instanceof ContractFunctionExecutionError &&
      (error.cause as ContractFunctionRevertedError).reason === panicReasons[50]
    )
      // No primary name set for address.
      return null
    throw error
  }
}
