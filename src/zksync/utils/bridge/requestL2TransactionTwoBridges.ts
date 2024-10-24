import type { Address } from 'abitype'
import { readContract } from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hash, Hex } from '../../../types/misc.js'
import { bridgehubAbi } from '../../constants/abis.js'

export type L2TransactionRequestTwoBridgesParameters = {
  mintValue: bigint
  l2Value: bigint
  l2GasLimit: bigint
  l2GasPerPubdataByteLimit: bigint
  refundRecipient: Address
  secondBridgeAddress: Address
  secondBridgeValue: bigint
  secondBridgeCalldata: Hex
  bridgehubContractAddress: Address
  l2ChainId: bigint
}

export async function requestL2TransactionTwoBridges<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  parameters: L2TransactionRequestTwoBridgesParameters,
): Promise<Hash> {
  return (await readContract(client, {
    abi: bridgehubAbi,
    functionName: 'requestL2TransactionTwoBridges',
    address: parameters.bridgehubContractAddress,
    args: [
      {
        chainId: parameters.l2ChainId,
        mintValue: parameters.mintValue,
        l2Value: parameters.l2Value,
        l2GasLimit: parameters.l2GasLimit,
        l2GasPerPubdataByteLimit: parameters.l2GasPerPubdataByteLimit,
        refundRecipient: parameters.refundRecipient,
        secondBridgeAddress: parameters.secondBridgeAddress,
        secondBridgeValue: parameters.secondBridgeValue,
        secondBridgeCalldata: parameters.secondBridgeCalldata,
      },
    ],
  })) as Hash
}
