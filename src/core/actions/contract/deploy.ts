import type { Abi } from 'abitype'
import * as AbiConstructor from 'ox/AbiConstructor'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import type { DistributiveOmit } from '../../internal/types.js'
import type {
  ContractConstructorArgs,
  UnionWiden,
} from '../internal/contract.js'
import { send } from '../transaction/send.js'

/**
 * Deploys a contract to the network.
 *
 * Constructor arguments are ABI-encoded with the deployment bytecode, then
 * broadcast as a contract creation transaction via {@link send}.
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
 * const hash = await Actions.contract.deploy(client, {
 *   abi: Abi.from(['constructor(address owner)']),
 *   args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
 *   bytecode: '0x608060405260405161083e38038061083e8339810160408190...',
 * })
 * ```
 */
export async function deploy<
  chain extends Chain.Chain | undefined,
  const abi extends Abi | readonly unknown[],
>(
  client: Client.Client<chain>,
  options: deploy.Options<abi, chain>,
): Promise<deploy.ReturnType> {
  const { abi, args, bytecode, ...rest } = options as deploy.Options
  const data = AbiConstructor.encode(abi, { args, bytecode })

  return await send(client, {
    ...rest,
    ...(rest.authorizationList ? { to: null } : {}),
    data,
  } as send.Options<chain>)
}

export declare namespace deploy {
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
  > = DistributiveOmit<send.Options<chain>, 'accessList' | 'data' | 'to'> & {
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

  type ReturnType = send.ReturnType

  type ErrorType =
    | send.ErrorType
    | AbiConstructor.encode.ErrorType
    | Errors.GlobalErrorType
}
