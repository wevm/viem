import type { Abi } from 'abitype'
import { AbiFunction } from 'ox'
import type { Errors } from 'ox'

import type * as Client from '../../Client.js'
import * as ContractError from '../../ContractError.js'
import { isAbortError } from '../../internal/errors.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionParameters,
  ContractFunctionReturnType,
} from '../internal/contract.js'
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
  as extends 'Object' | 'Array' = 'Object',
>(
  client: Client.Client,
  options: read.Options<abi, functionName, args, as>,
): Promise<read.ReturnType<abi, functionName, args, as>> {
  const {
    abi,
    address,
    args,
    as = 'Object',
    functionName,
    ...rest
  } = options as read.Options

  const abiItem = AbiFunction.fromAbi(abi, functionName, {
    args: args,
  })
  const data = AbiFunction.encodeData(abiItem, args)

  try {
    const response = await call(client, {
      ...rest,
      data,
      to: address,
    } as call.Options)
    return AbiFunction.decodeResult(abiItem, response.data ?? '0x', {
      as,
    }) as read.ReturnType<abi, functionName, args, as>
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
    as extends 'Object' | 'Array' = 'Object',
  > = ContractFunctionParameters<
    abi,
    'pure' | 'view',
    functionName,
    args,
    boolean
  > & {
    /** Return multiple values as an object keyed by output name or as an array. @default 'Object' */
    as?: as | 'Object' | 'Array' | undefined
  } & Pick<
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
    as extends 'Object' | 'Array' = 'Object',
  > = ContractFunctionReturnType<abi, 'pure' | 'view', functionName, args, as>

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
