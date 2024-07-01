import type { Address } from 'abitype'
import type { Hex } from '../../../types/misc.js'
import { encodeFunctionData } from '../../../utils/index.js'
import { l2BridgeAbi } from '../../constants/abis.js'

export type GetERC20BridgeCalldataParameters = {
  l1TokenAddress: Address
  l1Sender: Address
  l2Receiver: Address
  amount: bigint
  bridgeData: Hex
}

export type GetERC20BridgeCalldataReturnType = Hex

export async function getERC20BridgeCalldata(
  parameters: GetERC20BridgeCalldataParameters,
): Promise<GetERC20BridgeCalldataReturnType> {
  return encodeFunctionData({
    abi: l2BridgeAbi,
    functionName: 'finalizeDeposit',
    args: [
      parameters.l1Sender,
      parameters.l2Receiver,
      parameters.l1TokenAddress,
      parameters.amount,
      parameters.bridgeData,
    ],
  })
}
