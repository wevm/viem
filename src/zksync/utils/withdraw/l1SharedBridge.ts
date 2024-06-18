import type { Address } from 'abitype'
import { readContract } from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { l2SharedBridgeAbi } from '../../../zksync/constants/abis.js'

export type l1BridgeParameters = {
  address: Address
}

export async function l1SharedBridge<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL2: Client<Transport, TChain, TAccount>,
  parameters: l1BridgeParameters,
): Promise<Address> {
  return (await readContract(clientL2, {
    abi: l2SharedBridgeAbi,
    functionName: 'l1SharedBridge',
    args: [],
    address: parameters.address,
  })) as Address
}
