import type { Abi } from 'abitype'
import * as AbiFunction from 'ox/AbiFunction'
import type * as Errors from 'ox/Errors'

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
import { send } from '../transaction/send.js'

/**
 * Executes a write (`nonpayable`/`payable`) function on a contract.
 *
 * A "write" function modifies blockchain state, so it requires gas and is
 * broadcast as a transaction (via {@link send}). It does **not** validate that
 * the call will succeed: simulate first with `contract.simulate` when you need
 * that guarantee.
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
 * const hash = await Actions.contract.write(client, {
 *   abi: Abi.from(['function mint(uint32 tokenId)']),
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   args: [69420],
 *   functionName: 'mint',
 * })
 * ```
 */
export async function write<
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
  options: write.Options<abi, functionName, args, chain>,
): Promise<write.ReturnType> {
  const { abi, address, args, functionName, ...rest } = options as write.Options

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
    return await send(client, {
      ...rest,
      data,
      to: address,
    } as send.Options<chain>)
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

export declare namespace write {
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
    Omit<send.Options<chain>, 'data' | 'to' | 'value'> &
    GetMutabilityAwareValue<
      abi,
      'nonpayable' | 'payable',
      functionName,
      NonNullable<send.Options<chain>['value']>,
      args
    >

  type ReturnType = send.ReturnType

  type ErrorType =
    | ContractError.fromError.ErrorType
    | send.ErrorType
    | AbiFunction.encodeData.ErrorType
    | AbiFunction.fromAbi.ErrorType
    | Errors.GlobalErrorType
}
