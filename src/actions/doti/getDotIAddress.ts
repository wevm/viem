import type { Address } from 'viem';
import type { Client } from '../../clients/createClient.js';
import type { Transport } from '../../clients/transports/createTransport.js';
import type { Chain } from '../../types/chain.js';
import { readContract } from '../public/readContract.js';
import { namehash } from '../../utils/ens/namehash.js';

export type GetDotIAddressParameters = {
  /** The .i name to resolve (e.g. 'alex.i') */
  name: string;
  /** Optional custom registry contract address */
  registryAddress?: Address;
};

export type GetDotIAddressReturnType = Address | null;

const DOTI_REGISTRY_ARBITRUM = '0xf853F8243F10a57CF5e43A49F156F132c05C21a6' as const;

const registryAbi = [
  {
    name: 'resolver',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

const resolverAbi = [
  {
    name: 'addr',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

/**
 * Resolves a DotI (.i) domain name to an EVM address on Arbitrum One.
 */
export async function getDotIAddress<TChain extends Chain | undefined, TTransport extends Transport>(
  client: Client<TTransport, TChain>,
  { name, registryAddress = DOTI_REGISTRY_ARBITRUM }: GetDotIAddressParameters,
): Promise<GetDotIAddressReturnType> {
  const node = namehash(name);

  // 1. Get Resolver address from DotI Registry
  const resolverAddress = await readContract(client, {
    address: registryAddress,
    abi: registryAbi,
    functionName: 'resolver',
    args: [node],
  });

  if (!resolverAddress || resolverAddress === '0x0000000000000000000000000000000000000000') {
    return null;
  }

  // 2. Query the resolver for the address
  const resolvedAddress = await readContract(client, {
    address: resolverAddress,
    abi: resolverAbi,
    functionName: 'addr',
    args: [node],
  });

  return resolvedAddress;
}
