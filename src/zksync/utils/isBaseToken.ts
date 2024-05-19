import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { isAddressEqualLite } from '../../utils/address/isAddressEqualLite.js'
import { getBaseTokenL1Address } from '../actions/getBaseTokenL1Address.js'
import { L2_BASE_TOKEN_ADDRESS } from '../constants/number.js'

export async function isBaseToken<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL2: Client<Transport, TChain, TAccount>,
  token: Address,
): Promise<boolean> {
  return (
    isAddressEqualLite(token, await getBaseTokenL1Address(clientL2)) ||
    isAddressEqualLite(token, L2_BASE_TOKEN_ADDRESS)
  )
}
