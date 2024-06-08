import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { isAddressEqualLite } from '../../utils/address/isAddressEqualLite.js'
import { getBaseTokenL1Address } from '../actions/getBaseTokenL1Address.js'
import { ethAddressInContracts } from '../constants/address.js'

export type GetIsEthBasedChainReturnType = boolean

export async function getIsEthBasedChain<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL2: Client<Transport, TChain, TAccount>,
): Promise<GetIsEthBasedChainReturnType> {
  const baseTokenL1Address = await getBaseTokenL1Address(clientL2)
  return isAddressEqualLite(baseTokenL1Address, ethAddressInContracts)
}
