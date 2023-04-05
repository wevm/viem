import type { Address } from 'abitype'

import type { Transport, WalletClient } from '../../clients/index.js'
import type { Account, Chain } from '../../types/index.js'
import { getAddress } from '../../utils/index.js'

export type RequestAddressesReturnType = Address[]

export async function requestAddresses<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined = undefined,
>(
  client: WalletClient<Transport, TChain, TAccount>,
): Promise<RequestAddressesReturnType> {
  const addresses = await client.request({ method: 'eth_requestAccounts' })
  return addresses.map((address) => getAddress(address))
}
