import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'
import { encodeFunctionData } from '../../utils/index.js'
import { l2BridgeAbi } from '../constants/abis.js'

export async function getERC20BridgeCalldata(
  l1TokenAddress: Address,
  l1Sender: Address,
  l2Receiver: Address,
  amount: bigint,
  bridgeData: Hex,
): Promise<Hex> {
  return encodeFunctionData({
    abi: l2BridgeAbi,
    functionName: 'finalizeDeposit',
    args: [l1Sender, l2Receiver, l1TokenAddress, amount, bridgeData],
  })
}
