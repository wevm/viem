import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'
import { ETH_ADDRESS_IN_CONTRACTS } from '../constants/number.js'
import type {
  DepositTypeValues,
  SecondBridgeEncodeData,
} from '../types/deposit.js'
import { checkBaseCost } from './checkBaseCost.js'
import type { GetDepositTxWithDefaultsReturnType } from './getDepositTxWithDefaults.js'

export type GetDepositETHOnETHBasedChainTxParamters =
  GetDepositTxWithDefaultsReturnType & {
    baseCost: bigint
  }

export type DepositETHOnNonETHBasedChainTxReturnType =
  GetDepositETHOnETHBasedChainTxParamters & {
    contractAddress: Address
    calldata: Hex
  } & DepositTypeValues & { secondBridgeEncodeData: SecondBridgeEncodeData }

export async function getDepositETHOnNonETHBasedChainTx(
  parameters: GetDepositETHOnETHBasedChainTxParamters,
): Promise<DepositETHOnNonETHBasedChainTxReturnType> {
  const tx = parameters

  const { operatorTip, amount, overrides, to } = tx

  overrides!.value ??= amount
  const mintValue = parameters.baseCost + BigInt(operatorTip || 0n)
  await checkBaseCost({ baseCost: parameters.baseCost, value: mintValue })

  return {
    contractAddress: to!,
    calldata: '0x' as Hex,
    mintValue: mintValue,
    l2Value: 0n,
    ...tx,
    secondBridgeEncodeData: {
      secondBridgeValue: parameters.amount,
      token: ETH_ADDRESS_IN_CONTRACTS,
      amount: 0n,
      to: to!,
    },
    txValue: parameters.amount,
  }
}
