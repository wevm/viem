import type { Address } from 'abitype'
import type { Hex } from '../../../types/misc.js'
import type { GetDepositTxWithDefaultsReturnType } from './getDepositTxWithDefaults.js'

export type GetDepositETHOnETHBasedChainTxParamters =
  GetDepositTxWithDefaultsReturnType & {
    baseCost: bigint
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
