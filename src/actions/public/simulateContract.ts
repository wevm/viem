import type { Abi } from 'abitype'

import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { PublicClient } from '../../clients/createPublicClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseError } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type {
  ContractFunctionConfig,
  ContractFunctionResult,
  GetValue,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import {
  type DecodeFunctionResultParameters,
  decodeFunctionResult,
} from '../../utils/abi/decodeFunctionResult.js'
import {
  type EncodeFunctionDataParameters,
  encodeFunctionData,
} from '../../utils/abi/encodeFunctionData.js'
import { getContractError } from '../../utils/errors/getContractError.js'
import type { WriteContractParameters } from '../wallet/writeContract.js'

import { type CallParameters, call } from './call.js'

export type SimulateContractParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = any,
  TChain extends Chain | undefined = Chain | undefined,
  TChainOverride extends Chain | undefined = undefined,
> = {
  chain?: TChainOverride
  /** Data to append to the end of the calldata. Useful for adding a ["domain" tag](https://opensea.notion.site/opensea/Seaport-Order-Attributions-ec2d69bf455041a5baa490941aad307f). */
  dataSuffix?: Hex
} & ContractFunctionConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'> &
  Omit<
    CallParameters<TChainOverride extends Chain ? TChainOverride : TChain>,
    'batch' | 'to' | 'data' | 'value'
  > &
  GetValue<TAbi, TFunctionName, CallParameters<TChain>['value']>

export type SimulateContractReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TChain extends Chain | undefined = Chain | undefined,
  TChainOverride extends Chain | undefined = undefined,
> = {
  result: ContractFunctionResult<TAbi, TFunctionName>
  request: Omit<
    WriteContractParameters<
      TAbi,
      TFunctionName,
      TChain,
      undefined,
      TChainOverride
    >,
    'chain' | 'functionName'
  > & {
    chain: TChainOverride
    functionName: TFunctionName
  } & ContractFunctionConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'>
}

/**
 * Simulates/validates a contract interaction. This is useful for retrieving **return data** and **revert reasons** of contract write functions.
 *
 * - Docs: https://viem.sh/docs/contract/simulateContract.html
 * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/contracts/writing-to-contracts
 *
 * This function does not require gas to execute and _**does not**_ change the state of the blockchain. It is almost identical to [`readContract`](https://viem.sh/docs/contract/readContract), but also supports contract write functions.
 *
 * Internally, uses a [Public Client](https://viem.sh/docs/clients/public) to call the [`call` action](https://viem.sh/docs/actions/public/call) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
 *
 * @param client - Client to use
 * @param parameters - {@link SimulateContractParameters}
 * @returns The simulation result and write request. {@link SimulateContractReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { simulateContract } from 'viem/contract'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const result = await simulateContract(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint(uint32) view returns (uint32)']),
 *   functionName: 'mint',
 *   args: ['69420'],
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 * })
 */
export async function simulateContract<
  TChain extends Chain | undefined,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChainOverride extends Chain | undefined,
>(
  client: PublicClient<Transport, TChain>,
  {
    abi,
    address,
    args,
    dataSuffix,
    functionName,
    ...callRequest
  }: SimulateContractParameters<TAbi, TFunctionName, TChain, TChainOverride>,
): Promise<
  SimulateContractReturnType<TAbi, TFunctionName, TChain, TChainOverride>
> {
  const account = callRequest.account
    ? parseAccount(callRequest.account)
    : undefined
  const calldata = encodeFunctionData({
    abi,
    args,
    functionName,
  } as unknown as EncodeFunctionDataParameters<TAbi, TFunctionName>)
  try {
    const { data } = await call(client, {
      batch: false,
      data: `${calldata}${dataSuffix ? dataSuffix.replace('0x', '') : ''}`,
      to: address,
      ...callRequest,
    } as unknown as CallParameters<TChain>)
    const result = decodeFunctionResult({
      abi,
      args,
      functionName,
      data: data || '0x',
    } as DecodeFunctionResultParameters)
    return {
      result,
      request: {
        abi,
        address,
        args,
        functionName,
        ...callRequest,
      },
    } as unknown as SimulateContractReturnType<
      TAbi,
      TFunctionName,
      TChain,
      TChainOverride
    >
  } catch (err) {
    throw getContractError(err as BaseError, {
      abi: abi as Abi,
      address,
      args,
      docsPath: '/docs/contract/simulateContract',
      functionName,
      sender: account?.address,
    })
  }
}
