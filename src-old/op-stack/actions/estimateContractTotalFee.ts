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
  type EstimateTotalFeeErrorType,
  type EstimateTotalFeeParameters,
  estimateTotalFee,
} from './estimateTotalFee.js'

export type EstimateContractTotalFeeParameters<
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
    EstimateTotalFeeParameters<chain, account, chainOverride>,
    'data' | 'to' | 'value'
  > &
  GetValue<
    abi,
    functionName,
    EstimateTotalFeeParameters<
      chain,
      account,
      chainOverride
    > extends EstimateTotalFeeParameters
      ? EstimateTotalFeeParameters<chain, account, chainOverride>['value']
      : EstimateTotalFeeParameters['value']
  >

export type EstimateContractTotalFeeReturnType = bigint

export type EstimateContractTotalFeeErrorType = GetContractErrorReturnType<
  | EncodeFunctionDataErrorType
  | EstimateTotalFeeErrorType
  | ParseAccountErrorType
>

/**
 * Estimates the L1 data fee + L2 fee to execute an L2 contract write.
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateContractTotalFeeParameters}
 * @returns The gas estimate (in wei). {@link EstimateContractTotalFeeReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbi } from 'viem'
 * import { optimism } from 'viem/chains'
 * import { estimateContractTotalFee } from 'viem/op-stack'
 *
 * const client = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 * const totalFee = await estimateContractTotalFee(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint() public']),
 *   functionName: 'mint',
 *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 * })
 */
export async function estimateContractTotalFee<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
  chain extends Chain | undefined,
  account extends Account | undefined = undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: EstimateContractTotalFeeParameters<
    abi,
    functionName,
    args,
    chain,
    account,
    chainOverride
  >,
): Promise<EstimateContractTotalFeeReturnType> {
  const { abi, address, args, functionName, ...request } =
    parameters as EstimateContractTotalFeeParameters
  const data = encodeFunctionData({
    abi,
    args,
    functionName,
  } as EncodeFunctionDataParameters)
  try {
    const fee = await estimateTotalFee(client, {
      data,
      to: address,
      ...request,
    } as unknown as EstimateTotalFeeParameters)
    return fee
  } catch (error) {
    const account = request.account ? parseAccount(request.account) : undefined
    throw getContractError(error as BaseError, {
      abi,
      address,
      args,
      docsPath: '/docs/chains/op-stack/estimateTotalFee',
      functionName,
      sender: account?.address,
    })
  }
}
