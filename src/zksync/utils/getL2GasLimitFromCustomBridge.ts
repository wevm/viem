import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import { getL2BridgeAddress } from '../actions/getL2BridgeAddress.js'
import type { DepositTransactionExtended } from '../types/deposit.js'
import { estimateCustomBridgeDepositL2Gas } from './estimateCustomBridgeDepositL2Gas.js'

export type GetL2GasLimitFromCustomBridgeParameters = {
  depositTransaction: DepositTransactionExtended
  erc20DefaultBridgeData: Hex
}

export async function getL2GasLimitFromCustomBridge<
  TChain extends Chain | undefined,
>(
  clientL2: Client<Transport, TChain, Account>,
  parameters: GetL2GasLimitFromCustomBridgeParameters,
): Promise<bigint> {
  const customBridgeData =
    parameters.depositTransaction.customBridgeData ??
    parameters.erc20DefaultBridgeData

  const l2Address = await getL2BridgeAddress(clientL2, {
    bridgeAddress: parameters.depositTransaction.bridgeAddress!,
  })

  return await estimateCustomBridgeDepositL2Gas(clientL2, {
    l1BridgeAddress: parameters.depositTransaction.bridgeAddress!,
    l2BridgeAddress: l2Address,
    token: parameters.depositTransaction.token,
    amount: parameters.depositTransaction.amount,
    to: parameters.depositTransaction.to!,
    bridgeData: customBridgeData,
    from: clientL2.account.address,
    gasPerPubdataByte: parameters.depositTransaction.gasPerPubdataByte!,
    l2Value: parameters.depositTransaction.amount!,
  })
}
