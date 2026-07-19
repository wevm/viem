import type { Abi } from 'abitype'
import { AbiConstructor } from 'ox'
import type { Errors, Hex } from 'ox'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import type { DistributiveOmit } from '../../internal/types.js'
import type {
  ContractConstructorArgs,
  UnionWiden,
} from '../internal/contract.js'
import { getAction } from '../getAction.js'
import { sendSync } from '../transaction/sendSync.js'

/**
 * Deploys a contract to the network synchronously, returning the transaction
 * receipt.
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
 * const receipt = await Actions.contract.deploySync(client, {
 *   abi: Abi.from(['constructor(address owner)']),
 *   args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
 *   bytecode: '0x608060405260405161083e38038061083e8339810160408190...',
 * })
 * ```
 */
export async function deploySync<
  chain extends Chain.Chain | undefined,
  const abi extends Abi | readonly unknown[],
>(
  client: Client.Client<chain>,
  options: deploySync.Options<abi, chain>,
): Promise<deploySync.ReturnType<chain>> {
  const { abi, args, bytecode, ...rest } = options as deploySync.Options
  const data = AbiConstructor.encode(abi, { args, bytecode })

  return await getAction(
    client,
    sendSync<chain>,
    'transaction.sendSync',
  )({
    ...rest,
    ...(rest.authorizationList ? { to: null } : {}),
    data,
  } as sendSync.Options<chain>)
}

export declare namespace deploySync {
  type Options<
    abi extends Abi | readonly unknown[] = Abi,
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    ///
    allArgs = ContractConstructorArgs<abi>,
    hasConstructor = abi extends Abi
      ? Abi extends abi
        ? true
        : [Extract<abi[number], { type: 'constructor' }>] extends [never]
          ? false
          : true
      : true,
  > = DistributiveOmit<
    sendSync.Options<chain>,
    'accessList' | 'data' | 'to'
  > & {
    /** Contract ABI. */
    abi: abi
    /** Contract deployment bytecode. */
    bytecode: Hex.Hex
  } & (hasConstructor extends false
      ? { args?: undefined }
      : readonly [] extends allArgs
        ? {
            /** Constructor arguments. */
            args?:
              | allArgs
              | (abi extends Abi
                  ? Abi extends abi
                    ? never
                    : UnionWiden<allArgs>
                  : never)
              | undefined
          }
        : {
            /** Constructor arguments. */
            args: allArgs
          })

  type ReturnType<chain extends Chain.Chain | undefined = undefined> =
    sendSync.ReturnType<chain>

  type ErrorType =
    | sendSync.ErrorType
    | AbiConstructor.encode.ErrorType
    | Errors.GlobalErrorType
}
