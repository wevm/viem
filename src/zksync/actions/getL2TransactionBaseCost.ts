import { readContract } from '../../actions/index.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { bridgehubAbi } from '../constants/abis.js'
import type { DepositTransactionExtended } from '../types/deposit.js'

export type GetL2TransactionBaseCostParameters = Pick<
  DepositTransactionExtended,
  | 'gasPerPubdataByte'
  | 'l2GasLimit'
  | 'bridgehubContractAddress'
  | 'l2ChainId'
  | 'overrides'
>

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
      parameters.l2ChainId,
      parameters.overrides?.maxFeePerGas || parameters.overrides?.gasPrice,
      parameters.l2GasLimit,
      parameters.gasPerPubdataByte,
    ],
  })) as bigint
}
