import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import {
  type GetL2TransactionBaseCostParameters,
  getL2TransactionBaseCost,
} from '../../actions/getL2TransactionBaseCost.js'
import { layer1TxDefaults } from './layer1TxDefaults.js'

export type GetBaseCostParameters = GetL2TransactionBaseCostParameters

export type GetBaseCostReturnType = bigint

export async function getBaseCost<TChain extends Chain | undefined>(
  clientL1: Client<Transport, TChain, Account>,
  params: GetBaseCostParameters,
): Promise<GetBaseCostReturnType> {
  const parameters = { ...layer1TxDefaults(), ...params }

  return await getL2TransactionBaseCost(clientL1, parameters)
}
