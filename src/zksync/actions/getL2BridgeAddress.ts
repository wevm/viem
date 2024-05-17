import type { Address } from 'abitype'
import { readContract } from '../../actions/index.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { l1BridgeFactoryAbi } from '../constants/abis.js'

export type GetL2BridgeAddressParameters = {
  bridgeAddress: Address
}

export async function getL2BridgeAddress<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  parameters: GetL2BridgeAddressParameters,
): Promise<Address> {
  return (await readContract(client, {
    abi: l1BridgeFactoryAbi,
    functionName: 'l2BridgeAddress',
    address: parameters.bridgeAddress,
    args: [BigInt(client.chain!.id)],
  })) as Address
}
