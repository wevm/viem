import type { Abi, Address } from 'abitype'
import { toSmartAccount as toSmartAccount_ } from '../../account-abstraction/accounts/toSmartAccount.js'
import type {
  SmartAccount,
  SmartAccountImplementation,
} from '../../account-abstraction/accounts/types.js'
import { entryPoint07Abi } from '../../account-abstraction/constants/abis.js'
import { entryPoint07Address } from '../../account-abstraction/constants/address.js'
import type { EntryPointVersion } from '../../account-abstraction/types/entryPointVersion.js'
import { getUserOperationHash } from '../../account-abstraction/utils/userOperation/getUserOperationHash.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import { BaseError } from '../../errors/base.js'
import type { Account } from '../../types/account.js'
import type { Hex } from '../../types/misc.js'
import type { Prettify } from '../../types/utils.js'
import { decodeFunctionData } from '../../utils/abi/decodeFunctionData.js'
import { encodeFunctionData } from '../../utils/abi/encodeFunctionData.js'
import { concatHex } from '../../utils/data/concat.js'
import { hashMessage } from '../../utils/signature/hashMessage.js'
import { hashTypedData } from '../../utils/signature/hashTypedData.js'
import { erc4337AccountAbi } from '../abis.js'
import { ecrecoverAuthenticator } from '../constants.js'
import type { AaActor } from '../types/transaction.js'
import { computeAddress } from '../utils/computeAddress.js'
import { toFactoryArgs } from '../utils/keystoreCalls.js'
import { erc1167Bytecode } from '../utils/proxy.js'
import {
  getSignatureEnvelopeHash,
  wrapSignatureEnvelope,
} from '../utils/signMessage.js'

export type ToSmartAccountParameters<
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
  /**
   * Produces the authenticator `data` (the bytes after the 20-byte authenticator
   * prefix) for a given hash. Defaults to raw ECDSA (`r || s || v`) over the hash
   * via `owner`. Override for non-ECDSA authenticators (e.g. P-256), where the
   * account validates the signature over the raw `userOpHash`.
   */
  sign?: ((hash: Hex) => Promise<Hex>) | undefined
  /**
   * Stub authenticator `data` used for gas estimation. Defaults to a 65-byte
   * ECDSA-shaped stub; override to match the `data` length of a custom
   * {@link sign} (e.g. 129 bytes for P-256).
   */
  stubData?: Hex | undefined
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

export type ToSmartAccountReturnType<
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
 * `BackwardCompatibleERC4337Account` wallet; deployment uses the Keystore
 * contract as the ERC-4337 factory (`createAccount`); and
 * signature validation is delegated to the Keystore system via the
 * `authenticator || data` auth format.
 *
 * @example
 * import { toSmartAccount } from 'viem/eip8130'
 *
 * const account = await toSmartAccount({
 *   client,
 *   owner,
 *   userSalt: '0x...',
 *   initialActors: [{ actorId, authenticator }],
 *   implementation: '0x...', // ERC4337Account impl
 * })
 */
export async function toSmartAccount<
  entryPointAbi extends Abi = typeof entryPoint07Abi,
  entryPointVersion extends EntryPointVersion = '0.7',
>(
  parameters: ToSmartAccountParameters<entryPointAbi, entryPointVersion>,
): Promise<ToSmartAccountReturnType<entryPointAbi, entryPointVersion>> {
  const {
    client,
    entryPoint: entryPoint_ = {
      abi: entryPoint07Abi,
      address: entryPoint07Address,
      version: '0.7',
    },
    getNonce,
    authenticator = ecrecoverAuthenticator,
  } = parameters

  const entryPoint = {
    abi: entryPoint_.abi as entryPointAbi,
    address: entryPoint_.address,
    version: entryPoint_.version as entryPointVersion,
  } as const
  const owner = parseAccount(parameters.owner)

  const stubData =
    parameters.stubData ??
    '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'

  // Produces the auth `data` (after the authenticator prefix). The account
  // validates this over the raw hash (no EIP-191 prefix), so the default path
  // raw-signs with the owner's key.
  const sign =
    parameters.sign ??
    (async (hash: Hex) => {
      if (!owner.sign)
        throw new BaseError(
          '`owner` must be a local account exposing `sign`, or pass a custom `sign` function. EIP-8130 validates the raw `userOpHash` (no EIP-191 prefix).',
        )
      return owner.sign({ hash })
    })

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
    }
  }

  return toSmartAccount_({
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
      return computeAddress(getCreateParameters())
    },

    async getFactoryArgs() {
      return toFactoryArgs(getCreateParameters())
    },

    async getStubSignature() {
      return concatHex([authenticator, stubData])
    },

    // ERC-1271 message signatures use the EIP-8130 `SignedMessageEnvelope`
    // (`sigType || authenticator || data` over `replaySafeHash`), which is what
    // the account's `isValidSignature` -> `Keystore.validateSignature` expects.
    // A multichain envelope (chainId 0) is used, matching the chain-agnostic
    // account address; `sign` produces the authenticator `data` over the digest.
    async signMessage(parameters_) {
      const address = await this.getAddress()
      const digest = getSignatureEnvelopeHash({
        account: address,
        hash: hashMessage(parameters_.message),
      })
      return wrapSignatureEnvelope({
        sigType: 'multichain',
        authenticator,
        signature: await sign(digest),
      })
    },

    async signTypedData(parameters_) {
      const address = await this.getAddress()
      const digest = getSignatureEnvelopeHash({
        account: address,
        hash: hashTypedData(parameters_ as never),
      })
      return wrapSignatureEnvelope({
        sigType: 'multichain',
        authenticator,
        signature: await sign(digest),
      })
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
      return concatHex([authenticator, await sign(userOpHash)])
    },
  })
}
