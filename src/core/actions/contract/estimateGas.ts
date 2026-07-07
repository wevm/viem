import type { Abi } from 'abitype'
import * as AbiFunction from 'ox/AbiFunction'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'

import type * as Client from '../../Client.js'
import * as ContractError from '../../ContractError.js'
import * as dataSuffix_ from '../../internal/dataSuffix.js'
import { isAbortError } from '../../internal/errors.js'
import { estimateGas as estimateGas_ } from '../transaction/estimateGas.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionParameters,
  GetMutabilityAwareValue,
} from '../internal/contract.js'

/**
 * Estimates the gas required to successfully execute a contract write
 * (`nonpayable`/`payable`) function call.
 *
 * Encodes the call (via {@link AbiFunction.encodeData}) and delegates to
 * {@link estimateGas_}. Failures are mapped to a rich
 * {@link ContractError.ContractFunctionExecutionError} with the decoded revert
 * reason where possible.
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
 * const gas = await Actions.contract.estimateGas(client, {
 *   abi: Abi.from(['function mint()']),
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 *   functionName: 'mint',
 * })
 * ```
 */
export async function estimateGas<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  const args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
>(
  client: Client.Client,
  options: estimateGas.Options<abi, functionName, args>,
): Promise<estimateGas.ReturnType> {
  const {
    abi,
    address,
    args,
    dataSuffix = client.dataSuffix,
    functionName,
    ...rest
  } = options as estimateGas.Options

  const data = dataSuffix_.append(
    AbiFunction.encodeData(
      AbiFunction.fromAbi(abi, functionName, { args: args }),
      args,
    ),
    dataSuffix,
  )

  const account = rest.account ?? client.account
  const sender = account
    ? typeof account === 'string'
      ? account
      : account.address
    : undefined

  try {
    return await estimateGas_(client, {
      ...rest,
      data,
      to: address,
    } as estimateGas_.Options)
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

export declare namespace estimateGas {
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
    args
  > &
    Omit<estimateGas_.Options, 'data' | 'to' | 'value'> &
    GetMutabilityAwareValue<
      abi,
      'nonpayable' | 'payable',
      functionName,
      NonNullable<estimateGas_.Options['value']>,
      args
    > & {
      /** Data to append to the end of the calldata. */
      dataSuffix?: Hex.Hex | undefined
    }

  type ReturnType = bigint

  type ErrorType =
    | ContractError.fromError.ErrorType
    | estimateGas_.ErrorType
    | AbiFunction.encodeData.ErrorType
    | AbiFunction.fromAbi.ErrorType
    | Errors.GlobalErrorType
}
