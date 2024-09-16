import type { Address } from 'abitype'
import { readContract } from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { bridgehubAbi } from '../../constants/abis.js'

export type GetBaseTokenParameters = {
  bridgehubContractAddress: Address
  l2ChainId: bigint
}

export async function getBaseToken<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL1: Client<Transport, TChain, TAccount>,
  parameters: GetBaseTokenParameters,
): Promise<Address> {
  return (await readContract(clientL1, {
    abi: bridgehubAbi,
    functionName: 'baseToken',
    args: [parameters.l2ChainId],
    address: parameters.bridgehubContractAddress,
  })) as Address
}
