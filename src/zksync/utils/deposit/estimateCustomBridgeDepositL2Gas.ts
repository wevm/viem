import type { Address } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { estimateL1ToL2Execute } from './estimateL1ToL2Execute.js'
import { getERC20BridgeCalldata } from './getErc20BridgeCalldata.js'

export type EstimateCustomBridgeDepositL2GasParameters = {
  l1BridgeAddress: Address
  l2BridgeAddress: Address
  token: Address
  amount: bigint
  to: Address
  bridgeData: Hex
  from: Address
  gasPerPubdataByte?: bigint
  l2Value?: bigint
}

export type EstimateCustomBridgeDepositL2GasReturnType = bigint

export async function estimateCustomBridgeDepositL2Gas<
  TChain extends Chain | undefined,
>(
  clientL2: Client<Transport, TChain, Account>,
  parameters: EstimateCustomBridgeDepositL2GasParameters,
): Promise<EstimateCustomBridgeDepositL2GasReturnType> {
  const calldata = await getERC20BridgeCalldata({
    l1TokenAddress: parameters.token,
    l1Sender: parameters.from,
    l2Receiver: parameters.to,
    amount: parameters.amount,
    bridgeData: parameters.bridgeData,
  })

  return await estimateL1ToL2Execute(clientL2, {
    caller: parameters.l1BridgeAddress,
    contractAddress: parameters.l2BridgeAddress,
    gasPerPubdataByte: parameters.gasPerPubdataByte!,
    calldata: calldata,
    l2Value: parameters.l2Value || 0n,
  })
}
