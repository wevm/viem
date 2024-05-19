import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import type { DepositTransactionExtended } from '../types/deposit.js'
import { estimateDefaultBridgeDepositL2Gas } from './estimateDefaultBridgeDepositL2Gas.js'
import { getL2GasLimitFromCustomBridge } from './getL2GasLimitFromCustomBridge.js'

export type GetL2GasLimitParameters = {
  depositTransaction: DepositTransactionExtended
  erc20DefaultBridgeData: Hex
}

export async function getL2GasLimit<TChain extends Chain | undefined>(
  clientL2: Client<Transport, TChain, Account>,
  parameters: GetL2GasLimitParameters,
): Promise<bigint> {
  if (parameters.depositTransaction.bridgeAddress) {
    return await getL2GasLimitFromCustomBridge(clientL2, {
      depositTransaction: parameters.depositTransaction,
      erc20DefaultBridgeData: parameters.erc20DefaultBridgeData,
    })
  }
  return await estimateDefaultBridgeDepositL2Gas(clientL2, {
    token: parameters.depositTransaction.token,
    amount: parameters.depositTransaction.amount,
    to: parameters.depositTransaction.to!,
    gasPerPubdataByte: parameters.depositTransaction.gasPerPubdataByte!,
    erc20DefaultBridgeData: parameters.erc20DefaultBridgeData,
  })
}
