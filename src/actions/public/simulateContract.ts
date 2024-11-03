import type { Abi, AbiFunction, AbiStateMutability, Address } from 'abitype'

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
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type {
  IsNarrowable,
  NoInfer,
  Prettify,
  UnionEvaluate,
  UnionOmit,
} from '../../types/utils.js'
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

import type { TransactionRequest } from '../../types/transaction.js'
import { getAction } from '../../utils/getAction.js'
import { type CallErrorType, type CallParameters, call } from './call.js'

export type GetMutabilityAwareValue<
  abi extends Abi | readonly unknown[],
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<
    abi,
    mutability
  > = ContractFunctionName<abi, mutability>,
  valueType = TransactionRequest['value'],
  args extends ContractFunctionArgs<
    abi,
    mutability,
    functionName
  > = ContractFunctionArgs<abi, mutability, functionName>,
  abiFunction extends AbiFunction = abi extends Abi
    ? ExtractAbiFunctionForArgs<abi, mutability, functionName, args>
    : AbiFunction,
  _Narrowable extends boolean = IsNarrowable<abi, Abi>,
> = _Narrowable extends true
  ? abiFunction['stateMutability'] extends 'payable'
    ? { value?: NoInfer<valueType> | undefined }
    : abiFunction['payable'] extends true
      ? { value?: NoInfer<valueType> | undefined }
      : { value?: undefined }
  : { value?: NoInfer<valueType> | undefined }

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
  account?: accountOverride | undefined
  chain?: chainOverride | undefined
  /** Data to append to the end of the calldata. Useful for adding a ["domain" tag](https://opensea.notion.site/opensea/Seaport-Order-Attributions-ec2d69bf455041a5baa490941aad307f). */
  dataSuffix?: Hex | undefined
} & ContractFunctionParameters<
  abi,
  'nonpayable' | 'payable',
  functionName,
  args
> &
  UnionOmit<
    CallParameters<derivedChain>,
    | 'account'
    | 'batch'
    | 'code'
    | 'to'
    | 'data'
    | 'factory'
    | 'factoryData'
    | 'value'
  > &
  GetMutabilityAwareValue<
    abi,
    'nonpayable' | 'payable',
    functionName,
    CallParameters<derivedChain> extends CallParameters
      ? CallParameters<derivedChain>['value']
      : CallParameters['value'],
    args
  >

export type SimulateContractReturnType<
  out abi extends Abi | readonly unknown[] = Abi,
  in out functionName extends ContractFunctionName<
    abi,
    'nonpayable' | 'payable'
  > = ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  in out args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  > = ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
  /** @ts-expect-error cast variance */
  out chain extends Chain | undefined = Chain | undefined,
  out account extends Account | undefined = Account | undefined,
  out chainOverride extends Chain | undefined = Chain | undefined,
  out accountOverride extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
  ///
  in out minimizedAbi extends Abi = readonly [
    ExtractAbiFunctionForArgs<
      abi extends Abi ? abi : Abi,
      'nonpayable' | 'payable',
      functionName,
      args
    >,
  ],
  out resolvedAccount extends Account | undefined = accountOverride extends
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
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_writing-to-contracts
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
  const args extends ContractFunctionArgs<
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
