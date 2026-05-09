import type { Abi } from 'abitype'

import type { Account } from '../../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseError } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionParameters,
  GetValue,
} from '../../types/contract.js'
import type { UnionOmit } from '../../types/utils.js'
import {
  type EncodeFunctionDataErrorType,
  type EncodeFunctionDataParameters,
  encodeFunctionData,
} from '../../utils/abi/encodeFunctionData.js'
import {
  type GetContractErrorReturnType,
  getContractError,
} from '../../utils/errors/getContractError.js'
import {
  type EstimateTotalGasErrorType,
  type EstimateTotalGasParameters,
  estimateTotalGas,
} from './estimateTotalGas.js'

export type EstimateContractTotalGasParameters<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends ContractFunctionName<
    abi,
    'nonpayable' | 'payable'
  > = ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  > = ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
> = ContractFunctionParameters<
  abi,
  'nonpayable' | 'payable',
  functionName,
  args
> &
  UnionOmit<
    EstimateTotalGasParameters<chain, account, chainOverride>,
    'data' | 'to' | 'value'
  > &
  GetValue<
    abi,
    functionName,
    EstimateTotalGasParameters<
      chain,
      account,
      chainOverride
    > extends EstimateTotalGasParameters
      ? EstimateTotalGasParameters<chain, account, chainOverride>['value']
      : EstimateTotalGasParameters['value']
  >

export type EstimateContractTotalGasReturnType = bigint

export type EstimateContractTotalGasErrorType = GetContractErrorReturnType<
  | EncodeFunctionDataErrorType
  | EstimateTotalGasErrorType
  | ParseAccountErrorType
>

/**
 * Estimates the L1 data gas + L2 gas required to successfully execute a contract write function call.
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateContractTotalGasParameters}
 * @returns The gas estimate (in wei). {@link EstimateContractTotalGasReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbi } from 'viem'
 * import { optimism } from 'viem/chains'
 * import { estimateContractTotalGas } from 'viem/op-stack'
 *
 * const client = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 * const totalGas = await estimateContractTotalGas(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint() public']),
 *   functionName: 'mint',
 *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 * })
 */
export async function estimateContractTotalGas<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
  chain extends Chain | undefined,
  account extends Account | undefined = undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: EstimateContractTotalGasParameters<
    abi,
    functionName,
    args,
    chain,
    account,
    chainOverride
  >,
): Promise<EstimateContractTotalGasReturnType> {
  const { abi, address, args, functionName, ...request } =
    parameters as EstimateContractTotalGasParameters
  const data = encodeFunctionData({
    abi,
    args,
    functionName,
  } as EncodeFunctionDataParameters)
  try {
    const gas = await estimateTotalGas(client, {
      data,
      to: address,
      ...request,
    } as unknown as EstimateTotalGasParameters)
    return gas
  } catch (error) {
    const account = request.account ? parseAccount(request.account) : undefined
    throw getContractError(error as BaseError, {
      abi,
      address,
      args,
      docsPath: '/docs/chains/op-stack/estimateTotalGas',
      functionName,
      sender: account?.address,
    })
  }
}
