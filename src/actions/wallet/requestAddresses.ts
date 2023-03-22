import type { Address } from 'abitype'

import type { Transport, WalletClient } from '../../clients'
import type { Account, Chain } from '../../types'
import { getAddress } from '../../utils'

export type RequestAddressesReturnType = Address[]

export async function requestAddresses<
  TTransport extends Transport,
  TChain extends Chain | undefined,
  TAccount extends Account | undefined = undefined,
>(
  client: WalletClient<TTransport, TChain, TAccount>,
): Promise<RequestAddressesReturnType> {
  const addresses = await client.request({ method: 'eth_requestAccounts' })
  return addresses.map((address) => getAddress(address))
}
