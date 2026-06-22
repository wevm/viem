import type { Abi } from 'abitype'
import * as AbiFunction from 'ox/AbiFunction'
import type * as Errors from 'ox/Errors'

import type * as Client from '../../../Client.js'
import * as ContractError from '../../../ContractError.js'
import { isAbortError } from '../../../internal/errors.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionParameters,
  ContractFunctionReturnType,
} from '../../internal/contract.js'
import { call } from '../call.js'

/**
 * Calls a read-only (`pure`/`view`) function on a contract and returns the
 * decoded response.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { Abi } from 'viem/utils'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const balance = await Actions.contract.read(client, {
 *   abi: Abi.from(['function balanceOf(address) view returns (uint256)']),
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
 *   functionName: 'balanceOf',
 * })
 * ```
 */
export async function read<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'pure' | 'view'>,
  const args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
>(
  client: Client.Client,
  options: read.Options<abi, functionName, args>,
): Promise<read.ReturnType<abi, functionName, args>> {
  const { abi, address, args, functionName, ...rest } = options as read.Options

  const abiItem = AbiFunction.fromAbi(abi, functionName as never, {
    args: args as never,
  })
  const data = AbiFunction.encodeData(abiItem, args as never)

  try {
    const response = await call(client, {
      ...rest,
      data,
      to: address,
    } as call.Options)
    return AbiFunction.decodeResult(
      abiItem,
      response.data ?? '0x',
    ) as read.ReturnType<abi, functionName, args>
  } catch (error) {
    if (isAbortError(error)) throw error
    throw ContractError.fromError(error as Error, {
      abi,
      address,
      args,
      functionName,
    })
  }
}

export declare namespace read {
  type Options<
    abi extends Abi | readonly unknown[] = Abi,
    functionName extends ContractFunctionName<abi, 'pure' | 'view'> =
      ContractFunctionName<abi, 'pure' | 'view'>,
    args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName> =
      ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
  > = ContractFunctionParameters<
    abi,
    'pure' | 'view',
    functionName,
    args,
    boolean
  > &
    Pick<
      call.Options,
      | 'account'
      | 'authorizationList'
      | 'blockOverrides'
      | 'factory'
      | 'factoryData'
      | 'requestOptions'
      | 'stateOverride'
    > &
    blockOptions

  type ReturnType<
    abi extends Abi | readonly unknown[] = Abi,
    functionName extends ContractFunctionName<abi, 'pure' | 'view'> =
      ContractFunctionName<abi, 'pure' | 'view'>,
    args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName> =
      ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
  > = ContractFunctionReturnType<abi, 'pure' | 'view', functionName, args>

  type ErrorType =
    | ContractError.fromError.ErrorType
    | call.ErrorType
    | AbiFunction.encodeData.ErrorType
    | AbiFunction.decodeResult.ErrorType
    | Errors.GlobalErrorType
}

type blockOptions = Pick<
  call.Options,
  'blockHash' | 'blockNumber' | 'blockTag' | 'requireCanonical'
>
