import type { Abi, Address } from 'abitype'
import { toSmartAccount } from '../../../account-abstraction/accounts/toSmartAccount.js'
import type {
  SmartAccount,
  SmartAccountImplementation,
} from '../../../account-abstraction/accounts/types.js'
import { entryPoint07Abi } from '../../../account-abstraction/constants/abis.js'
import { entryPoint07Address } from '../../../account-abstraction/constants/address.js'
import type { EntryPointVersion } from '../../../account-abstraction/types/entryPointVersion.js'
import { getUserOperationHash } from '../../../account-abstraction/utils/userOperation/getUserOperationHash.js'
import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import { signMessage as signMessage_ } from '../../../actions/wallet/signMessage.js'
import { signTypedData as signTypedData_ } from '../../../actions/wallet/signTypedData.js'
import { BaseError } from '../../../errors/base.js'
import type { Account } from '../../../types/account.js'
import type { Hex } from '../../../types/misc.js'
import type { Prettify } from '../../../types/utils.js'
import { decodeFunctionData } from '../../../utils/abi/decodeFunctionData.js'
import { encodeFunctionData } from '../../../utils/abi/encodeFunctionData.js'
import { concatHex } from '../../../utils/data/concat.js'
import { getAction } from '../../../utils/getAction.js'
import { erc4337AccountAbi } from '../abis.js'
import {
  accountConfigAddress as defaultAccountConfigAddress,
  ecrecoverAuthenticator,
} from '../constants.js'
import type { AaActor } from '../types/transaction.js'
import { toFactoryArgs8130 } from '../utils/accountConfigCalls.js'
import { computeAddress8130 } from '../utils/computeAddress.js'
import { erc1167Bytecode } from '../utils/proxy.js'

export type ToSmartAccount8130Parameters<
  entryPointAbi extends Abi = Abi,
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = {
  /** Signer for the controlling actor. */
  owner: Address | Account
  client: Eip8130SmartAccountImplementation['client']
  entryPoint?:
    | {
        abi: entryPointAbi
        address: Address
        version: entryPointVersion | EntryPointVersion
      }
    | undefined
  getNonce?: SmartAccountImplementation['getNonce'] | undefined
  /**
   * Authenticator address that validates the owner's signatures. Defaults to the
   * native ECRECOVER authenticator (secp256k1 EOA).
   */
  authenticator?: Address | undefined
  /** Account Configuration contract (the ERC-4337 factory). */
  accountConfigAddress?: Address | undefined
} & (
  | {
      /** Pre-deployed / known account address. */
      address: Address
      userSalt?: Hex | undefined
      initialActors?: readonly AaActor[] | undefined
      implementation?: Address | undefined
      code?: Hex | undefined
    }
  | {
      address?: undefined
      /** User-chosen uniqueness factor (bytes32). */
      userSalt: Hex
      /** Initial actors (sorted by `actorId`, strictly ascending). */
      initialActors: readonly AaActor[]
      /** Wallet implementation address (proxied via ERC-1167). */
      implementation?: Address | undefined
      /** Deployment bytecode override (defaults to ERC-1167 proxy to `implementation`). */
      code?: Hex | undefined
    }
)

export type Eip8130SmartAccountImplementation<
  entryPointAbi extends Abi = Abi,
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = SmartAccountImplementation<
  entryPointAbi,
  entryPointVersion,
  { abi: typeof erc4337AccountAbi }
>

export type ToSmartAccount8130ReturnType<
  entryPointAbi extends Abi = Abi,
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = Prettify<
  SmartAccount<
    Eip8130SmartAccountImplementation<entryPointAbi, entryPointVersion>
  >
>

/**
 * Wraps an EIP-8130 account as a viem ERC-4337 Smart Account so the *same*
 * account can be used on non-8130 chains through a `bundlerClient`.
 *
 * Execution goes through `executeBatch(Call[])` on the canonical
 * `BackwardCompatibleERC4337Account` wallet; deployment uses the Account
 * Configuration contract as the ERC-4337 factory (`createAccount`); and
 * signature validation is delegated to the Account Configuration system via the
 * `authenticator || data` auth format.
 *
 * @example
 * import { toSmartAccount8130 } from 'viem/experimental'
 *
 * const account = await toSmartAccount8130({
 *   client,
 *   owner,
 *   userSalt: '0x...',
 *   initialActors: [{ actorId, authenticator }],
 *   implementation: '0x...', // ERC4337Account impl
 * })
 */
export async function toSmartAccount8130<
  entryPointAbi extends Abi = typeof entryPoint07Abi,
  entryPointVersion extends EntryPointVersion = '0.7',
>(
  parameters: ToSmartAccount8130Parameters<entryPointAbi, entryPointVersion>,
): Promise<ToSmartAccount8130ReturnType<entryPointAbi, entryPointVersion>> {
  const {
    client,
    entryPoint: entryPoint_ = {
      abi: entryPoint07Abi,
      address: entryPoint07Address,
      version: '0.7',
    },
    getNonce,
    authenticator = ecrecoverAuthenticator,
    accountConfigAddress = defaultAccountConfigAddress,
  } = parameters

  const entryPoint = {
    abi: entryPoint_.abi as entryPointAbi,
    address: entryPoint_.address,
    version: entryPoint_.version as entryPointVersion,
  } as const
  const owner = parseAccount(parameters.owner)

  // Resolve the account's deployment bytecode (ERC-1167 proxy to the wallet impl).
  const code =
    parameters.code ??
    (parameters.implementation
      ? erc1167Bytecode(parameters.implementation)
      : undefined)

  function getCreateParameters() {
    if (!parameters.userSalt || !parameters.initialActors)
      throw new BaseError(
        '`userSalt` and `initialActors` are required to derive factory args / address.',
      )
    if (!code)
      throw new BaseError(
        'Provide `implementation` (wallet impl address) or `code` (deployment bytecode).',
      )
    return {
      userSalt: parameters.userSalt,
      code,
      initialActors: parameters.initialActors,
      accountConfigAddress,
    }
  }

  return toSmartAccount({
    client,
    entryPoint,
    getNonce,

    extend: { abi: erc4337AccountAbi },

    async decodeCalls(data) {
      const result = decodeFunctionData({ abi: erc4337AccountAbi, data })
      if (result.functionName === 'executeBatch')
        return result.args[0].map((call) => ({
          to: call.target,
          value: call.value,
          data: call.data,
        }))
      throw new BaseError(`unable to decode calls for "${result.functionName}"`)
    },

    async encodeCalls(calls) {
      return encodeFunctionData({
        abi: erc4337AccountAbi,
        functionName: 'executeBatch',
        args: [
          calls.map((call) => ({
            target: call.to,
            value: call.value ?? 0n,
            data: call.data ?? '0x',
          })),
        ],
      })
    },

    async getAddress() {
      if (parameters.address) return parameters.address
      return computeAddress8130(getCreateParameters())
    },

    async getFactoryArgs() {
      return toFactoryArgs8130(getCreateParameters())
    },

    async getStubSignature() {
      return concatHex([
        authenticator,
        '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c',
      ])
    },

    async signMessage(parameters_) {
      const signature = await getAction(
        client,
        signMessage_,
        'signMessage',
      )({ account: owner, message: parameters_.message })
      return concatHex([authenticator, signature])
    },

    async signTypedData(parameters_) {
      const signature = await getAction(
        client,
        signTypedData_,
        'signTypedData',
      )({ account: owner, ...(parameters_ as any) })
      return concatHex([authenticator, signature])
    },

    async signUserOperation(parameters_) {
      const { chainId = client.chain!.id, ...userOperation } = parameters_
      const address = await this.getAddress()
      const userOpHash = getUserOperationHash({
        chainId,
        entryPointAddress: entryPoint.address,
        entryPointVersion: entryPoint.version,
        userOperation: {
          ...(userOperation as any),
          sender: address,
        },
      })
      const signature = await getAction(
        client,
        signMessage_,
        'signMessage',
      )({ account: owner, message: { raw: userOpHash } })
      return concatHex([authenticator, signature])
    },
  })
}
