import type { Address } from 'abitype'

import type { Client, WalletClient } from '../../clients'
import type { Account, Chain } from '../../types'
import { getAddress } from '../../utils'

export type RequestAddressesReturnType = Address[]

export async function requestAddresses<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined = undefined,
>(
  client: WalletClient<TChain, TAccount> | Client<TChain>,
): Promise<RequestAddressesReturnType> {
  const addresses = await client.request({ method: 'eth_requestAccounts' })
  return addresses.map((address) => getAddress(address))
}
