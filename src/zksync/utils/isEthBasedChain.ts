import { isAddressEqualLite } from '~viem/utils/address/isAddressEqualLite.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { getBaseTokenL1Address } from '../actions/getBaseTokenL1Address.js'
import { ETH_ADDRESS_IN_CONTRACTS } from '../constants/number.js'

export type GetIsEthBasedChainReturnType = boolean

export async function getIsEthBasedChain<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL2: Client<Transport, TChain, TAccount>,
): Promise<GetIsEthBasedChainReturnType> {
  const baseTokenL1Address = await getBaseTokenL1Address(clientL2)
  return isAddressEqualLite(baseTokenL1Address, ETH_ADDRESS_IN_CONTRACTS)
}
