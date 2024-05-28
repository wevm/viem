import type { Address } from 'abitype'
import { isAddressEqualLite } from '~viem/utils/address/isAddressEqualLite.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { l2TokenAddress } from '../actions/l2TokenAddress.js'
import {
  ETH_ADDRESS_IN_CONTRACTS,
  L2_BASE_TOKEN_ADDRESS,
  LEGACY_ETH_ADDRESS,
} from '../constants/number.js'

export type GetL2TokenAddressParameters = {
  token: Address
  sharedL2: Address
  baseTokenAddress: Address
}

export type GetL2TokenAddressReturnType = any

export async function getL2TokenAddress<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL1: Client<Transport, TChain, TAccount>,
  parameters: GetL2TokenAddressParameters,
): Promise<GetL2TokenAddressReturnType> {
  if (isAddressEqualLite(parameters.token, LEGACY_ETH_ADDRESS)) {
    parameters.token = ETH_ADDRESS_IN_CONTRACTS
  }

  if (isAddressEqualLite(parameters.token, parameters.baseTokenAddress)) {
    return L2_BASE_TOKEN_ADDRESS
  }

  return await l2TokenAddress(clientL1, {
    token: parameters.token,
    sharedL2: parameters.sharedL2,
  })
}
