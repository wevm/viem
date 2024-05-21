import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import { isAddressEqualLite } from '../../utils/address/isAddressEqualLite.js'
import {
  ETH_ADDRESS_IN_CONTRACTS,
  LEGACY_ETH_ADDRESS,
} from '../constants/number.js'
import { getERC20DefaultBridgeData } from './getERC20DefaultBridgeData.js'

export type ConstructDepositSpecificationParameters = {
  token: Address
  amount: bigint
  refundRecipient: Address
}

export type ConstructDepositSpecificationReturnType = {
  token: Address
  amount: bigint
  refundRecipient: Address
  eRC20DefaultBridgeData: Hex
}

export async function constructDepositSpecification<
  TChain extends Chain | undefined,
>(
  clientL1: Client<Transport, TChain, Account>,
  parameters: ConstructDepositSpecificationParameters,
) {
  if (isAddressEqualLite(parameters.token, LEGACY_ETH_ADDRESS)) {
    parameters.token = ETH_ADDRESS_IN_CONTRACTS
  }

  return {
    token: parameters.token,
    amount: parameters.amount,
    eRC20DefaultBridgeData: await getERC20DefaultBridgeData(
      clientL1,
      parameters.token,
    ),
    refundRecipient: parameters.refundRecipient,
  }
}
