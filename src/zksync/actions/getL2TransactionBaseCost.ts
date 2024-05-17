import type { Address } from 'abitype'
import { readContract } from '../../actions/index.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { bridgehubAbi } from '../constants/abis.js'

export type GetL2TransactionBaseCostParameters = {
  gasPriceForEstimation: bigint
  l2GasLimit: bigint
  gasPerPubdataByte: bigint
  bridgehubContractAddress: Address
}

export async function getL2TransactionBaseCost<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  parameters: GetL2TransactionBaseCostParameters,
): Promise<bigint> {
  return (await readContract(client, {
    abi: bridgehubAbi,
    functionName: 'l2TransactionBaseCost',
    address: parameters.bridgehubContractAddress,
    args: [
      BigInt(client.chain!.id),
      parameters.gasPriceForEstimation,
      parameters.l2GasLimit,
      parameters.gasPerPubdataByte,
    ],
  })) as bigint
}
