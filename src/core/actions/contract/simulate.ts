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
  GetMutabilityAwareValue,
} from '../internal/contract.js'
import { call } from '../call.js'

/**
 * Simulates a write (`nonpayable`/`payable`) function on a contract without
 * broadcasting a transaction, returning the decoded `result` and a `request`
 * that can be passed to {@link write}.
 *
 * Unlike {@link write}, this validates the call against current state (surfacing
 * return data and revert reasons) via `eth_call`, so it does not require gas or
 * change chain state.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { Abi } from 'viem/utils'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const { request, result } = await Actions.contract.simulate(client, {
 *   abi: Abi.from(['function mint(uint32 tokenId) returns (uint32)']),
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   args: [69420],
 *   functionName: 'mint',
 * })
 * const hash = await Actions.contract.write(client, request)
 * ```
 */
export async function simulate<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  const args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
>(
  client: Client.Client,
  options: simulate.Options<abi, functionName, args>,
): Promise<simulate.ReturnType<abi, functionName, args>> {
  const { abi, address, args, functionName, ...rest } =
    options as simulate.Options

  const abiItem = AbiFunction.fromAbi(abi, functionName, {
    args: args,
  })
  const data = AbiFunction.encodeData(abiItem, args)

  const account = rest.account ?? client.account
  const sender = account
    ? typeof account === 'string'
      ? account
      : account.address
    : undefined

  try {
    const response = await call(client, {
      ...rest,
      data,
      to: address,
    } as call.Options)
    const result = AbiFunction.decodeResult(abiItem, response.data ?? '0x')

    // Minimize the ABI to the called function so the returned `request` decodes
    // unambiguously when handed to `write`.
    const minimizedAbi = (abi as readonly unknown[]).filter(
      (item) => (item as { name?: string }).name === functionName,
    )

    return {
      request: {
        ...rest,
        abi: minimizedAbi,
        address,
        args,
        functionName,
      },
      result,
    } as unknown as simulate.ReturnType<abi, functionName, args>
  } catch (error) {
    if (isAbortError(error)) throw error
    throw ContractError.fromError(error as Error, {
      abi,
      address,
      args,
      functionName,
      sender,
    })
  }
}

export declare namespace simulate {
  type Options<
    abi extends Abi | readonly unknown[] = Abi,
    functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'> =
      ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    args extends ContractFunctionArgs<
      abi,
      'nonpayable' | 'payable',
      functionName
    > = ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
  > = ContractFunctionParameters<
    abi,
    'nonpayable' | 'payable',
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
    GetMutabilityAwareValue<
      abi,
      'nonpayable' | 'payable',
      functionName,
      NonNullable<call.Options['value']>,
      args
    > &
    blockOptions

  type ReturnType<
    abi extends Abi | readonly unknown[] = Abi,
    functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'> =
      ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    args extends ContractFunctionArgs<
      abi,
      'nonpayable' | 'payable',
      functionName
    > = ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
  > = {
    /** Request that can be passed to {@link write}. */
    request: Options<abi, functionName, args>
    /** Decoded return value of the simulated call. */
    result: ContractFunctionReturnType<
      abi,
      'nonpayable' | 'payable',
      functionName,
      args
    >
  }

  type ErrorType =
    | ContractError.fromError.ErrorType
    | call.ErrorType
    | AbiFunction.encodeData.ErrorType
    | AbiFunction.decodeResult.ErrorType
    | AbiFunction.fromAbi.ErrorType
    | Errors.GlobalErrorType
}

type blockOptions = Pick<
  call.Options,
  'blockHash' | 'blockNumber' | 'blockTag' | 'requireCanonical'
>
