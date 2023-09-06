import type { Abi } from 'abitype'

import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseError } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionParameters,
  ContractFunctionReturnType,
  ExtractAbiFunctionForArgs,
  GetValue,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type { Prettify, UnionEvaluate, UnionOmit } from '../../types/utils.js'
import { decodeFunctionResult } from '../../utils/abi/decodeFunctionResult.js'
import { encodeFunctionData } from '../../utils/abi/encodeFunctionData.js'
import { getContractError } from '../../utils/errors/getContractError.js'
import type { WriteContractParameters } from '../wallet/writeContract.js'

import { type CallParameters, call } from './call.js'

export type SimulateContractParameters<
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
  chainOverride extends Chain | undefined = Chain | undefined,
> = {
  chain?: chainOverride
  /** Data to append to the end of the calldata. Useful for adding a ["domain" tag](https://opensea.notion.site/opensea/Seaport-Order-Attributions-ec2d69bf455041a5baa490941aad307f). */
  dataSuffix?: Hex
} & ContractFunctionParameters<
  abi,
  'nonpayable' | 'payable',
  functionName,
  args
> &
  UnionOmit<
    CallParameters<chainOverride extends Chain ? chainOverride : chain>,
    'batch' | 'to' | 'data' | 'value'
  > &
  GetValue<
    abi,
    functionName,
    CallParameters<chain> extends CallParameters
      ? CallParameters<chain>['value']
      : CallParameters['value']
  >

export type SimulateContractReturnType<
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
  chainOverride extends Chain | undefined = Chain | undefined,
  ///
  minimizedAbi extends Abi = readonly [
    ExtractAbiFunctionForArgs<
      abi extends Abi ? abi : Abi,
      'nonpayable' | 'payable',
      functionName,
      args
    >,
  ],
> = {
  result: ContractFunctionReturnType<
    minimizedAbi,
    'nonpayable' | 'payable',
    functionName,
    args
  >
  request: Prettify<
    UnionEvaluate<
      UnionOmit<
        WriteContractParameters<
          minimizedAbi,
          functionName,
          args,
          chain,
          undefined,
          chainOverride
        >,
        'abi' | 'args' | 'chain' | 'functionName'
      >
    > &
      ContractFunctionParameters<
        minimizedAbi,
        'nonpayable' | 'payable',
        functionName,
        args
      > & {
        chain: chainOverride
      }
  >
}

/**
 * Simulates/validates a contract interaction. This is useful for retrieving **return data** and **revert reasons** of contract write functions.
 *
 * - Docs: https://viem.sh/docs/contract/simulateContract.html
 * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/contracts/writing-to-contracts
 *
 * This function does not require gas to execute and _**does not**_ change the state of the blockchain. It is almost identical to [`readContract`](https://viem.sh/docs/contract/readContract.html), but also supports contract write functions.
 *
 * Internally, uses a [Public Client](https://viem.sh/docs/clients/public.html) to call the [`call` action](https://viem.sh/docs/actions/public/call.html) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData.html).
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
  chain extends Chain | undefined,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain>,
  parameters: SimulateContractParameters<
    abi,
    functionName,
    args,
    chain,
    chainOverride
  >,
): Promise<
  SimulateContractReturnType<abi, functionName, args, chain, chainOverride>
> {
  const { abi, address, args, dataSuffix, functionName, ...callRequest } =
    parameters as SimulateContractParameters

  const account = callRequest.account
    ? parseAccount(callRequest.account)
    : undefined
  const calldata = encodeFunctionData({ abi, args, functionName })
  try {
    const { data } = await call(client, {
      batch: false,
      data: `${calldata}${dataSuffix ? dataSuffix.replace('0x', '') : ''}`,
      to: address,
      ...callRequest,
    })
    const result = decodeFunctionResult({
      abi,
      args,
      functionName,
      data: data || '0x',
    })
    const minimizedAbi = abi.filter(
      (abiItem) =>
        'name' in abiItem && abiItem.name === parameters.functionName,
    )
    return {
      result,
      request: {
        abi: minimizedAbi,
        address,
        args,
        dataSuffix,
        functionName,
        ...callRequest,
      },
    } as unknown as SimulateContractReturnType<
      abi,
      functionName,
      args,
      chain,
      chainOverride
    >
  } catch (error) {
    throw getContractError(error as BaseError, {
      abi,
      address,
      args,
      docsPath: '/docs/contract/simulateContract',
      functionName,
      sender: account?.address,
    })
  }
}
