import type { Address } from 'abitype'
import { erc20Abi } from 'abitype/abis'
import { readContract } from '../../actions/index.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'

export type GetErc20ContractValueParameters = {
  l1TokenAddress: Address
  functionName: 'name' | 'symbol' | 'totalSupply' | 'decimals'
}

export async function getErc20ContractValue<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  parameters: GetErc20ContractValueParameters,
): Promise<string> {
  return (await readContract(client, {
    abi: erc20Abi,
    functionName: parameters.functionName,
    address: parameters.l1TokenAddress,
    args: [],
  })) as string
}
