import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT } from '../../constants/number.js'
import type { Overrides } from '../../types/deposit.js'
import { estimateL1ToL2Execute } from './estimateL1ToL2Execute.js'
import type { DepositETHOnETHBasedChainTxReturnType } from './getDepositETHOnETHBasedChainTx.js'

export type GetRequestExecuteTxDefaultsParameters =
  DepositETHOnETHBasedChainTxReturnType

export type GetRequestExecuteTxReturnType =
  DepositETHOnETHBasedChainTxReturnType

export async function getRequestExecuteTxDefaults<
  TChain extends Chain | undefined,
>(
  clientL2: Client<Transport, TChain, Account>,
  parameters: GetRequestExecuteTxReturnType,
): Promise<DepositETHOnETHBasedChainTxReturnType> {
  const { ...tx } = parameters
  tx.l2Value ??= 0n
  tx.mintValue ??= 0n
  tx.operatorTip ??= 0n
  tx.overrides ??= {} as Overrides
  tx.overrides.factoryDeps ??= []
  tx.overrides.from ??= clientL2.account.address
  tx.gasPerPubdataByte ??= REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT
  tx.refundRecipient ??= clientL2.account.address
  tx.l2GasLimit = await estimateL1ToL2Execute(clientL2, parameters)
  // TODO:
  // https://github.com/wevm/viem/discussions/239
  tx.overrides!.maxFeePerGas = 150000000100n
  tx.overrides!.maxPriorityFeePerGas = 150000000000n

  return tx
}
