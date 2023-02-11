import { PublicClient } from '../../clients'
import { panicReasons } from '../../constants'
import {
  ChainDoesNotSupportContract,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
} from '../../errors'
import type { Address, Prettify } from '../../types'
import { encodeHex } from '../../utils'
import { packetToBytes } from '../../utils/ens'
import { readContract, ReadContractArgs } from '../public'

export type GetEnsNameArgs = Prettify<
  Pick<ReadContractArgs, 'blockNumber' | 'blockTag'> & {
    /** Address to get ENS name for. */
    address: Address
    /** Address of ENS Universal Resolver Contract. */
    universalResolverAddress?: Address
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
 * })
 * // 'wagmi-dev.eth'
 */
export async function getEnsName(
  client: PublicClient,
  {
    address,
    blockNumber,
    blockTag,
    universalResolverAddress: universalResolverAddress_,
  }: GetEnsNameArgs,
) {
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
      args: [encodeHex(packetToBytes(reverseNode))],
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
