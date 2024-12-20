import type { Address } from 'abitype'
import { readContract } from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hash, Hex } from '../../../types/misc.js'
import { bridgehubAbi } from '../../constants/abis.js'

export type L2TransactionRequestDirectParameters = {
  mintValue: bigint
  l2Contract: Address
  l2Value: bigint
  l2Calldata: Hex
  l2GasLimit: bigint
  l2GasPerPubdataByteLimit: bigint
  factoryDeps: Hex[]
  refundRecipient: Address
  bridgehubContractAddress: Address
  l2ChainId: bigint
}

export async function requestL2TransactionDirect<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  parameters: L2TransactionRequestDirectParameters,
): Promise<Hash> {
  return (await readContract(client, {
    abi: bridgehubAbi,
    functionName: 'requestL2TransactionDirect',
    address: parameters.bridgehubContractAddress,
    args: [
      {
        chainId: parameters.l2ChainId,
        mintValue: parameters.mintValue,
        l2Contract: parameters.l2Contract,
        l2Value: parameters.l2Value,
        l2Calldata: parameters.l2Calldata,
        l2GasLimit: parameters.l2GasLimit,
        l2GasPerPubdataByteLimit: parameters.l2GasPerPubdataByteLimit,
        factoryDeps: parameters.factoryDeps,
        refundRecipient: parameters.refundRecipient,
      },
    ],
  })) as Hash
}
