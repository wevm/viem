import type { Abi } from 'abitype'
import { AbiFunction } from 'ox'
import type { Errors } from 'ox'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import * as ContractError from '../../ContractError.js'
import { isAbortError } from '../../internal/errors.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionParameters,
  GetMutabilityAwareValue,
} from '../internal/contract.js'
import { getAction } from '../getAction.js'
import { sendSync } from '../transaction/sendSync.js'

/**
 * Executes a write (`nonpayable`/`payable`) function on a contract
 * synchronously, returning the transaction receipt.
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
 * const receipt = await Actions.contract.writeSync(client, {
 *   abi: Abi.from(['function mint(uint32 tokenId)']),
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   args: [69420],
 *   functionName: 'mint',
 * })
 * ```
 */
export async function writeSync<
  chain extends Chain.Chain | undefined,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  const args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
>(
  client: Client.Client<chain>,
  options: writeSync.Options<abi, functionName, args, chain>,
): Promise<writeSync.ReturnType<chain>> {
  const { abi, address, args, functionName, ...rest } =
    options as writeSync.Options

  const data = AbiFunction.encodeData(
    AbiFunction.fromAbi(abi, functionName, { args: args }),
    args,
  )

  const account = rest.account ?? client.account
  const sender = account
    ? typeof account === 'string'
      ? account
      : account.address
    : undefined

  try {
    return await getAction(
      client,
      sendSync<chain>,
      'transaction.sendSync',
    )({
      ...rest,
      data,
      to: address,
    } as sendSync.Options<chain>)
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

export declare namespace writeSync {
  type Options<
    abi extends Abi | readonly unknown[] = Abi,
    functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'> =
      ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    args extends ContractFunctionArgs<
      abi,
      'nonpayable' | 'payable',
      functionName
    > = ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  > = ContractFunctionParameters<
    abi,
    'nonpayable' | 'payable',
    functionName,
    args,
    boolean
  > &
    Omit<sendSync.Options<chain>, 'data' | 'to' | 'value'> &
    GetMutabilityAwareValue<
      abi,
      'nonpayable' | 'payable',
      functionName,
      NonNullable<sendSync.Options<chain>['value']>,
      args
    >

  type ReturnType<chain extends Chain.Chain | undefined = undefined> =
    sendSync.ReturnType<chain>

  type ErrorType =
    | ContractError.fromError.ErrorType
    | sendSync.ErrorType
    | AbiFunction.encodeData.ErrorType
    | AbiFunction.fromAbi.ErrorType
    | Errors.GlobalErrorType
}
