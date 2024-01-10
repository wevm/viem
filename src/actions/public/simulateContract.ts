import type { Abi, Address } from 'abitype'

import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseError } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account, ParseAccount } from '../../types/account.js'
import type { Chain, DeriveChain } from '../../types/chain.js'
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
import {
  type DecodeFunctionResultErrorType,
  decodeFunctionResult,
} from '../../utils/abi/decodeFunctionResult.js'
import {
  type EncodeFunctionDataErrorType,
  encodeFunctionData,
} from '../../utils/abi/encodeFunctionData.js'
import {
  type GetContractErrorReturnType,
  getContractError,
} from '../../utils/errors/getContractError.js'
import type { WriteContractParameters } from '../wallet/writeContract.js'

import { getAction } from '../../utils/getAction.js'
import { type CallErrorType, type CallParameters, call } from './call.js'

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
  accountOverride extends Account | Address | undefined = undefined,
  ///
  derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = {
  account?: accountOverride
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
    CallParameters<derivedChain>,
    'account' | 'batch' | 'to' | 'data' | 'value'
  > &
  GetValue<
    abi,
    functionName,
    CallParameters<derivedChain> extends CallParameters
      ? CallParameters<derivedChain>['value']
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
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  accountOverride extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
  ///
  minimizedAbi extends Abi = readonly [
    ExtractAbiFunctionForArgs<
      abi extends Abi ? abi : Abi,
      'nonpayable' | 'payable',
      functionName,
      args
    >,
  ],
  resolvedAccount extends Account | undefined = accountOverride extends
    | Account
    | Address
    ? ParseAccount<accountOverride>
    : account,
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
        'account' | 'abi' | 'args' | 'chain' | 'functionName'
      >
    > &
      ContractFunctionParameters<
        minimizedAbi,
        'nonpayable' | 'payable',
        functionName,
        args
      > & {
        chain: DeriveChain<chain, chainOverride>
      } & (resolvedAccount extends Account
        ? { account: resolvedAccount }
        : { account?: undefined })
  >
}

export type SimulateContractErrorType =
  | ParseAccountErrorType
  | EncodeFunctionDataErrorType
  | GetContractErrorReturnType<CallErrorType | DecodeFunctionResultErrorType>
  | ErrorType

/**
 * Simulates/validates a contract interaction. This is useful for retrieving **return data** and **revert reasons** of contract write functions.
 *
 * - Docs: https://viem.sh/docs/contract/simulateContract
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts/writing-to-contracts
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
  chain extends Chain | undefined,
  account extends Account | undefined,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
  chainOverride extends Chain | undefined = undefined,
  accountOverride extends Account | Address | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: SimulateContractParameters<
    abi,
    functionName,
    args,
    chain,
    chainOverride,
    accountOverride
  >,
): Promise<
  SimulateContractReturnType<
    abi,
    functionName,
    args,
    chain,
    account,
    chainOverride,
    accountOverride
  >
> {
  const { abi, address, args, dataSuffix, functionName, ...callRequest } =
    parameters as SimulateContractParameters

  const account = callRequest.account
    ? parseAccount(callRequest.account)
    : client.account
  const calldata = encodeFunctionData({ abi, args, functionName })
  try {
    const { data } = await getAction(
      client,
      call,
      'call',
    )({
      batch: false,
      data: `${calldata}${dataSuffix ? dataSuffix.replace('0x', '') : ''}`,
      to: address,
      ...callRequest,
      account,
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
        account,
      },
    } as unknown as SimulateContractReturnType<
      abi,
      functionName,
      args,
      chain,
      account,
      chainOverride,
      accountOverride
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
