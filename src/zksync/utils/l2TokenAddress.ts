import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { isAddressEqualLite } from '../../utils/address/isAddressEqualLite.js'
import { l2TokenAddress } from '../actions/l2TokenAddress.js'
import {
  ethAddressInContracts,
  l2BaseTokenAddress,
  legacyEthAddress,
} from '../constants/address.js'

export type GetL2TokenAddressParameters = {
  token: Address
  sharedL2: Address
  baseTokenAddress: Address
}

export type GetL2TokenAddressReturnType = Address

export async function getL2TokenAddress<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL1: Client<Transport, TChain, TAccount>,
  parameters: GetL2TokenAddressParameters,
): Promise<GetL2TokenAddressReturnType> {
  if (isAddressEqualLite(parameters.token, legacyEthAddress)) {
    parameters.token = ethAddressInContracts
  }

  if (isAddressEqualLite(parameters.token, parameters.baseTokenAddress)) {
    return l2BaseTokenAddress
  }

  return await l2TokenAddress(clientL1, {
    token: parameters.token,
    sharedL2: parameters.sharedL2,
  })
}
