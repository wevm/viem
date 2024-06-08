import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { isAddressEqualLite } from '../../utils/address/isAddressEqualLite.js'
import { getBaseTokenL1Address } from '../actions/getBaseTokenL1Address.js'
import { l2BaseTokenAddress } from '../constants/address.js'

export type IsBaseTokenParameters = {
  token: Address
}

export type IsBaseTokenReturnType = boolean

export async function isBaseToken<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL2: Client<Transport, TChain, TAccount>,
  parameters: IsBaseTokenParameters,
): Promise<IsBaseTokenReturnType> {
  return (
    isAddressEqualLite(
      parameters.token,
      await getBaseTokenL1Address(clientL2),
    ) || isAddressEqualLite(parameters.token, l2BaseTokenAddress)
  )
}
