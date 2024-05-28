import type { Address } from 'abitype'
import { zeroAddress } from '../../constants/address.js'
import type { Hex } from '../../types/misc.js'
import { encodeAbiParameters, encodeFunctionData } from '../../utils/index.js'
import { bridgehubAbi } from '../constants/abis.js'
import type {
  DepositTransactionExtended,
  DepositTypeValues,
  SecondBridgeEncodeData,
} from '../types/deposit.js'

export type ConstructRequestL2TransactionTwoBridgesParameters =
  DepositTransactionExtended & {
    secondBridgeEncodeData: SecondBridgeEncodeData
  } & DepositTypeValues

export function constructRequestL2TransactionTwoBridges(
  parameters: ConstructRequestL2TransactionTwoBridgesParameters,
) {
  let secondBridgeAddress: Address
  let secondBridgeCalldata: Hex

  if (parameters.bridgeAddress) {
    secondBridgeAddress = parameters.bridgeAddress
    secondBridgeCalldata = parameters.eRC20DefaultBridgeData
  } else {
    secondBridgeAddress = parameters.bridgeAddresses!.sharedL1

    secondBridgeCalldata = encodeAbiParameters(
      [{ type: 'address' }, { type: 'uint256' }, { type: 'address' }],
      [
        parameters.secondBridgeEncodeData.token!,
        parameters.secondBridgeEncodeData.amount,
        parameters.secondBridgeEncodeData.to,
      ],
    )
  }

  const data = encodeFunctionData({
    abi: bridgehubAbi,
    functionName: 'requestL2TransactionTwoBridges',
    args: [
      {
        chainId: parameters.l2ChainId,
        mintValue: parameters.mintValue,
        l2Value: parameters.l2Value,
        l2GasLimit: parameters.l2GasLimit,
        l2GasPerPubdataByteLimit: parameters.gasPerPubdataByte,
        refundRecipient: parameters.refundRecipient ?? zeroAddress,
        secondBridgeAddress,
        secondBridgeValue: parameters.secondBridgeEncodeData.secondBridgeValue,
        secondBridgeCalldata,
      },
    ],
  })

  return {
    maxFeePerGas: parameters.overrides!.maxFeePerGas!,
    maxPriorityFeePerGas: parameters.overrides!.maxPriorityFeePerGas!,
    value: parameters.txValue,
    to: parameters.bridgehubContractAddress,
    data: data,
  }
}
