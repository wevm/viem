import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'
import type { Overrides } from '../types/deposit.js'

export type GetDepositETHOnETHBasedChainTxParamters = {
  token: Address
  amount: bigint
  to?: Address
  operatorTip?: bigint
  bridgeAddress?: Address
  l2GasLimit?: bigint
  gasPerPubdataByte?: bigint
  customBridgeData?: Hex
  refundRecipient?: Address
  overrides?: Overrides
  baseCost: bigint
  bridgehubContractAddress: Address
  l2ChainId: bigint
}

export type DepositETHOnETHBasedChainTxReturnType =
  GetDepositETHOnETHBasedChainTxParamters & {
    contractAddress: Address
    calldata: Hex
    mintValue: bigint
    l2Value: bigint
  }

export function getDepositETHOnETHBasedChainTx(
  parameters: GetDepositETHOnETHBasedChainTxParamters,
): DepositETHOnETHBasedChainTxReturnType {
  const tx = parameters

  const { operatorTip, amount, overrides, to } = tx

  overrides!.value ??=
    parameters.baseCost + BigInt(operatorTip || 0) + BigInt(amount)

  return {
    contractAddress: to!,
    calldata: '0x' as Hex,
    mintValue: overrides!.value,
    l2Value: amount,
    ...tx,
  }
}
