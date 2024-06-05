import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import type { DepositTransaction, Overrides } from '../types/deposit.js'
import { getERC20DefaultBridgeData } from './getERC20DefaultBridgeData.js'

export type ConstructDepositSpecificationParameters = DepositTransaction
export type ConstructDepositSpecificationReturnType =
  ConstructDepositSpecificationParameters & {
    eRC20DefaultBridgeData: Hex
  }

export async function constructDepositSpecification<
  TChain extends Chain | undefined,
>(
  clientL1: Client<Transport, TChain, Account>,
  parameters: ConstructDepositSpecificationParameters,
): Promise<ConstructDepositSpecificationReturnType> {
  return {
    ...parameters,
    approveOverrides: parameters.approveOverrides ?? ({} as Overrides),
    approveBaseOverrides: parameters.approveBaseOverrides ?? ({} as Overrides),
    eRC20DefaultBridgeData: await getERC20DefaultBridgeData(
      clientL1,
      parameters.token!,
    ),
  }
}
