import type { Address } from 'abitype'
import { readContract } from '../../actions/index.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { l2BridgeAbi } from '../constants/abis.js'

export type GetL2TokenAddressParameters = {
  token: Address
  sharedL2: Address
}

export type GetL2TokenAddressReturnType = Address

export async function l2TokenAddress<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL2: Client<Transport, TChain, TAccount>,
  parameters: GetL2TokenAddressParameters,
): Promise<GetL2TokenAddressReturnType> {
  return (await readContract(clientL2, {
    abi: l2BridgeAbi,
    functionName: 'l2TokenAddress',
    address: parameters.sharedL2,
    args: [parameters.token],
  })) as Address
}
