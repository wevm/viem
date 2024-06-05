import type { Address } from 'abitype'
import { readContract } from '../../actions/index.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { l2BridgeAbi } from '../constants/abis.js'

export type l1BridgeParameters = {
  l2BridgeAddress: Address
}

export async function l1Bridge<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL1: Client<Transport, TChain, TAccount>,
  parameters: l1BridgeParameters,
): Promise<Address> {
  return (await readContract(clientL1, {
    abi: l2BridgeAbi,
    functionName: 'l1Bridge',
    args: [],
    address: parameters.l2BridgeAddress,
  })) as Address
}
