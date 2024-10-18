import type { Address } from 'abitype'
import { readContract } from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { bridgehubAbi } from '../../constants/abis.js'

export type SharedBridgeParameters = {
  bridgehubContractAddress: Address
}

export async function sharedBridge<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  parameters: SharedBridgeParameters,
): Promise<Address> {
  return (await readContract(client, {
    abi: bridgehubAbi,
    functionName: 'sharedBridge',
    args: [],
    address: parameters.bridgehubContractAddress,
  })) as Address
}
