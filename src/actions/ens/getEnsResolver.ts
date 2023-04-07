import type { PublicClient, Transport } from '../../clients/index.js'
import type { Address, Chain, Prettify } from '../../types/index.js'
import { getChainContractAddress, toHex } from '../../utils/index.js'
import { packetToBytes } from '../../utils/ens/index.js'
import { readContract } from '../public/index.js'
import type { ReadContractParameters } from '../public/index.js'

export type GetEnsResolverParameters = Prettify<
  Pick<ReadContractParameters, 'blockNumber' | 'blockTag'> & {
    /** ENS name to get resolver. */
    name: string
    /** Address of ENS Universal Resolver Contract */
    universalResolverAddress?: Address
  }
>

export type GetEnsResolverReturnType = Address

/**
 * @description Gets resolver for ENS name.
 */
export async function getEnsResolver<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  {
    blockNumber,
    blockTag,
    name,
    universalResolverAddress: universalResolverAddress_,
  }: GetEnsResolverParameters,
) {
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

  const [resolverAddress] = await readContract(client, {
    address: universalResolverAddress,
    abi: [
      {
        inputs: [{ type: 'bytes' }],
        name: 'findResolver',
        outputs: [{ type: 'address' }, { type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'findResolver',
    args: [toHex(packetToBytes(name))],
    blockNumber,
    blockTag,
  })
  return resolverAddress
}
