import type { Abi } from 'abitype'
import { AbiConstructor, Hex } from 'ox'
import type { Address, Errors } from 'ox'

import * as Chain from '../../Chain.js'
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
 * When `salt` is provided, the contract is deployed with CREATE2 through
 * `create2Address`, or the target chain's `contracts.create2` address.
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
  const { abi, args, bytecode, create2Address, salt, ...rest } =
    options as deploySync.Options
  const initCode = AbiConstructor.encode(abi, { args, bytecode })
  const data =
    salt === undefined ? initCode : Hex.concat(Hex.padLeft(salt, 32), initCode)
  const to = (() => {
    if (salt === undefined) return rest.authorizationList ? null : undefined
    if (create2Address !== undefined) return create2Address

    const chain = rest.chain ?? client.chain
    if (!chain) throw new Chain.NotFoundError()
    return Chain.getContractAddress({ chain, contract: 'create2' })
  })()

  return await getAction(
    client,
    sendSync<chain>,
    'transaction.sendSync',
  )({
    ...rest,
    ...(to !== undefined ? { to } : {}),
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
    'accessList' | 'chain' | 'data' | 'to'
  > & {
    /** Contract ABI. */
    abi: abi
    /** Contract deployment bytecode. */
    bytecode: Hex.Hex
  } & Create2Options<chain> &
    (hasConstructor extends false
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
    | Chain.NotFoundError
    | Chain.getContractAddress.ErrorType
    | Hex.concat.ErrorType
    | Hex.padLeft.ErrorType
    | Errors.GlobalErrorType
}

type Create2Options<chain extends Chain.Chain | undefined> =
  | (ChainOptions & {
      /** CREATE2 deployer address. */
      create2Address?: undefined
      /** CREATE2 deployment salt. */
      salt?: undefined
    })
  | (ChainOptions & {
      /** CREATE2 deployer address. */
      create2Address: Address.Address
      /** CREATE2 deployment salt. */
      salt: Hex.Hex
    })
  | {
      /** Chain the transaction targets. */
      chain: Create2Chain
      /** CREATE2 deployer address. @default chain.contracts.create2.address */
      create2Address?: Address.Address | undefined
      /** CREATE2 deployment salt. */
      salt: Hex.Hex
    }
  | ([chain] extends [Create2Chain]
      ? {
          /** Pass `null` to skip the current-chain assertion. @default client.chain */
          chain?: null | undefined
          /** CREATE2 deployer address. @default client.chain.contracts.create2.address */
          create2Address?: Address.Address | undefined
          /** CREATE2 deployment salt. */
          salt: Hex.Hex
        }
      : never)

type ChainOptions = {
  /**
   * Chain the transaction targets. Pass `null` to skip the current-chain
   * assertion.
   * @default client.chain
   */
  chain?: Chain.Chain | null | undefined
}

type Create2Chain = Chain.Chain & {
  contracts: { create2: { address: Address.Address } }
}
