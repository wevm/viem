import type { Address } from 'abitype'
import { estimateFeesPerGas } from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { getBridgehubContractAddress } from '../../actions/getBridgehubContractAddress.js'
import { getDefaultBridgeAddresses } from '../../actions/getDefaultBridgeAddresses.js'
import { REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT } from '../../constants/number.js'
import type {
  DepositTransactionExtended,
  Overrides,
} from '../../types/deposit.js'
import { getL2GasLimit } from './getL2GasLimit.js'

export type GetDepositTxWithDefaultsParameters = Omit<
  DepositTransactionExtended,
  'bridgehubContractAddress' | 'l2ChainId'
>

export type GetDepositTxWithDefaultsReturnType = DepositTransactionExtended & {
  bridgehubContractAddress: Address
  l2ChainId: bigint
}

export async function getDepositTxWithDefaults<
  TChain extends Chain | undefined,
>(
  clientL2: Client<Transport, TChain, Account>,
  parameters: GetDepositTxWithDefaultsParameters,
): Promise<GetDepositTxWithDefaultsReturnType> {
  const bridgehubContractAddress = await getBridgehubContractAddress(clientL2)
  const bridgeAddresses = await getDefaultBridgeAddresses(clientL2)
  const l2ChainId = BigInt(clientL2.chain!.id)

  const { ...tx } = parameters as GetDepositTxWithDefaultsReturnType
  tx.to = tx.to ?? clientL2.account.address
  tx.operatorTip ??= 0n
  tx.overrides ??= {} as Overrides
  tx.overrides.from = clientL2.account.address
  tx.gasPerPubdataByte ??= REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT
  tx.bridgehubContractAddress = bridgehubContractAddress
  tx.l2ChainId = l2ChainId
  tx.bridgeAddresses = bridgeAddresses
  tx.l2GasLimit ??= await getL2GasLimit(clientL2, {
    depositTransaction: tx,
    erc20DefaultBridgeData: parameters.eRC20DefaultBridgeData,
  })
  const fees = await estimateFeesPerGas(clientL2)

  tx.overrides.maxFeePerGas = fees.maxFeePerGas
  tx.overrides.maxPriorityFeePerGas = fees.maxPriorityFeePerGas

  return tx
}
