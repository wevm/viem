import type { Abi } from 'abitype'

import type { Account } from '../../../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../../accounts/utils/parseAccount.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { BaseError } from '../../../errors/base.js'
import type { Chain } from '../../../types/chain.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionParameters,
  GetValue,
} from '../../../types/contract.js'
import type { UnionOmit } from '../../../types/utils.js'
import {
  type EncodeFunctionDataErrorType,
  type EncodeFunctionDataParameters,
  encodeFunctionData,
} from '../../../utils/abi/encodeFunctionData.js'
import {
  type GetContractErrorReturnType,
  getContractError,
} from '../../../utils/errors/getContractError.js'
import {
  type EstimateL1GasErrorType,
  type EstimateL1GasParameters,
  estimateL1Gas,
} from './estimateL1Gas.js'

export type EstimateContractL1GasParameters<
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
    EstimateL1GasParameters<chain, account, chainOverride>,
    'data' | 'to' | 'value'
  > &
  GetValue<
    abi,
    functionName,
    EstimateL1GasParameters<
      chain,
      account,
      chainOverride
    > extends EstimateL1GasParameters
      ? EstimateL1GasParameters<chain, account, chainOverride>['value']
      : EstimateL1GasParameters['value']
  >

export type EstimateContractL1GasReturnType = bigint

export type EstimateContractL1GasErrorType = GetContractErrorReturnType<
  EncodeFunctionDataErrorType | EstimateL1GasErrorType | ParseAccountErrorType
>

/**
 * Estimates the L1 data gas required to successfully execute a contract write function call.
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateContractL1GasParameters}
 * @returns The gas estimate (in wei). {@link EstimateContractL1GasReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbi } from 'viem'
 * import { optimism } from 'viem/chains'
 * import { estimateContractL1Gas } from 'viem/op-stack'
 *
 * const client = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 * const l1Gas = await estimateContractL1Gas(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint() public']),
 *   functionName: 'mint',
 *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 * })
 */
export async function estimateContractL1Gas<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
  chain extends Chain | undefined,
  account extends Account | undefined = undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: EstimateContractL1GasParameters<
    abi,
    functionName,
    args,
    chain,
    account,
    chainOverride
  >,
): Promise<EstimateContractL1GasReturnType> {
  const { abi, address, args, functionName, ...request } =
    parameters as EstimateContractL1GasParameters
  const data = encodeFunctionData({
    abi,
    args,
    functionName,
  } as EncodeFunctionDataParameters)
  try {
    const gas = await estimateL1Gas(client, {
      data,
      to: address,
      ...request,
    } as unknown as EstimateL1GasParameters)
    return gas
  } catch (error) {
    const account = request.account ? parseAccount(request.account) : undefined
    throw getContractError(error as BaseError, {
      abi,
      address,
      args,
      docsPath: '/docs/chains/op-stack/estimateContractL1Gas',
      functionName,
      sender: account?.address,
    })
  }
}
