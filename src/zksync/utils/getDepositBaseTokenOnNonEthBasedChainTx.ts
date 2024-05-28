import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'
import { checkBaseCost } from './checkBaseCost.js'
import type { GetDepositTxWithDefaultsReturnType } from './getDepositTxWithDefaults.js'

export type GetDepositBaseTokenOnNonEthBasedChainTxParameters =
  GetDepositTxWithDefaultsReturnType & {
    baseCost: bigint
  }

export type GetDepositBaseTokenOnNonEthBasedChainTxReturnType =
  GetDepositBaseTokenOnNonEthBasedChainTxParameters & {
    contractAddress: Address
    calldata: Hex
    mintValue: bigint
    l2Value: bigint
  } & { approveMintValue: bigint }

export async function getDepositBaseTokenOnNonEthBasedChainTx(
  parameters: GetDepositBaseTokenOnNonEthBasedChainTxParameters,
): Promise<GetDepositBaseTokenOnNonEthBasedChainTxReturnType> {
  const tx = parameters

  const { operatorTip, amount, overrides, to } = tx

  overrides!.value = 0n
  const mintValue =
    parameters.baseCost + BigInt(operatorTip || 0n) + BigInt(amount)
  await checkBaseCost({ baseCost: parameters.baseCost, value: mintValue })

  return {
    contractAddress: to!,
    calldata: '0x' as Hex,
    mintValue: 0n,
    l2Value: amount,
    ...tx,
    approveMintValue: mintValue,
  }
}
