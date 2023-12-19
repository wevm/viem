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
import type { ContractFunctionConfig, GetValue } from '../../types/contract.js'
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
import { getAction } from '../../utils/getAction.js'
import {
  type EstimateGasErrorType,
  type EstimateGasParameters,
  estimateGas,
} from './estimateGas.js'

export type EstimateContractGasParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = undefined,
> = ContractFunctionConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'> &
  UnionOmit<EstimateGasParameters<TChain, TAccount>, 'data' | 'to' | 'value'> &
  GetValue<
    TAbi,
    TFunctionName,
    EstimateGasParameters<TChain> extends EstimateGasParameters
      ? EstimateGasParameters<TChain>['value']
      : EstimateGasParameters['value']
  >

export type EstimateContractGasReturnType = bigint

export type EstimateContractGasErrorType = GetContractErrorReturnType<
  EncodeFunctionDataErrorType | EstimateGasErrorType | ParseAccountErrorType
>

/**
 * Estimates the gas required to successfully execute a contract write function call.
 *
 * - Docs: https://viem.sh/docs/contract/estimateContractGas.html
 *
 * Internally, uses a [Public Client](https://viem.sh/docs/clients/public.html) to call the [`estimateGas` action](https://viem.sh/docs/actions/public/estimateGas.html) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData.html).
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateContractGasParameters}
 * @returns The gas estimate (in wei). {@link EstimateContractGasReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { estimateContractGas } from 'viem/contract'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const gas = await estimateContractGas(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint() public']),
 *   functionName: 'mint',
 *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 * })
 */
export async function estimateContractGas<
  const TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChain extends Chain | undefined,
  TAccount extends Account | undefined = undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  {
    abi,
    address,
    args,
    functionName,
    ...request
  }: EstimateContractGasParameters<TAbi, TFunctionName, TChain, TAccount>,
): Promise<EstimateContractGasReturnType> {
  const data = encodeFunctionData({
    abi,
    args,
    functionName,
  } as unknown as EncodeFunctionDataParameters<TAbi, TFunctionName>)
  try {
    const gas = await getAction(
      client,
      estimateGas,
      'estimateGas',
    )({
      data,
      to: address,
      ...request,
    } as unknown as EstimateGasParameters<TChain>)
    return gas
  } catch (err) {
    const account = request.account ? parseAccount(request.account) : undefined
    throw getContractError(err as BaseError, {
      abi: abi as Abi,
      address,
      args,
      docsPath: '/docs/contract/estimateContractGas',
      functionName,
      sender: account?.address,
    })
  }
}
