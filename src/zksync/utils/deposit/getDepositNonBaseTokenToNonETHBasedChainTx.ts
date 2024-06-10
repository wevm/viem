import type { Address } from 'abitype'
import type { Hex } from '../../../types/misc.js'
import type {
  DepositTransactionExtended,
  DepositTypeValues,
  SecondBridgeEncodeData,
} from '../../types/deposit.js'
import { checkBaseCost } from './checkBaseCost.js'

export type GetDepositNonBaseTokenOnNonETHBasedChain =
  DepositTransactionExtended & { baseCost: bigint }

export type GetDepositNonBaseTokenOnNonETHBasedChainReturnType =
  GetDepositNonBaseTokenOnNonETHBasedChain & {
    contractAddress: Address
    calldata: Hex
  } & DepositTypeValues & { secondBridgeEncodeData: SecondBridgeEncodeData }

export async function getDepositNonBaseTokenToNonEthBasedChainTx(
  parameters: GetDepositNonBaseTokenOnNonETHBasedChain,
): Promise<GetDepositNonBaseTokenOnNonETHBasedChainReturnType> {
  const tx = parameters

  const { operatorTip, overrides, to } = tx
  const mintValue = parameters.baseCost + BigInt(operatorTip || 0n)
  await checkBaseCost({ baseCost: parameters.baseCost, value: mintValue })

  overrides!.value ??= 0n

  return {
    contractAddress: to!,
    calldata: '0x' as Hex,
    mintValue: mintValue,
    l2Value: 0n,
    ...tx,
    secondBridgeEncodeData: {
      secondBridgeValue: 0n,
      token: parameters.token!,
      amount: parameters.amount,
      to: to!,
    },
    txValue: 0n,
  }
}
