import type { Abi, Address, TypedData } from 'abitype'
import type { SignReturnType as WebAuthnSignReturnType } from 'webauthn-p256'

import type { Client } from '../../clients/createClient.js'
import type { Hash, Hex, SignableMessage } from '../../types/misc.js'
import type { TypedDataDefinition } from '../../types/typedData.js'
import type { Assign, ExactPartial, UnionPartialBy } from '../../types/utils.js'
import type { NonceManager } from '../../utils/nonceManager.js'
import type { EntryPointVersion } from '../types/entryPointVersion.js'
import type {
  EstimateUserOperationGasReturnType,
  UserOperation,
  UserOperationRequest,
} from '../types/userOperation.js'

type Call = {
  to: Hex
  data?: Hex | undefined
  value?: bigint | undefined
}

export type SmartAccountImplementation<
  entryPointAbi extends Abi | readonly unknown[] = Abi,
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
  extend extends object = object,
> = {
  /** Client used to retrieve Smart Account data, and perform signing (if owner is a JSON-RPC Account). */
  client: Client
  /** Compatible EntryPoint of the Smart Account. */
  entryPoint: {
    /** Compatible EntryPoint ABI. */
    abi: entryPointAbi
    /** Compatible EntryPoint address. */
    address: Address
    /** Compatible EntryPoint version. */
    version: entryPointVersion
  }
  /** Extend the Smart Account with custom properties. */
  extend?: extend | undefined
  /**
   * Retrieves the Smart Account's address.
   *
   * @example
   * ```ts
   * const address = await account.getAddress()
   * // '0x...'
   * ```
   */
  getAddress: () => Promise<Address>
  /**
   * Decodes calldata into structured calls.
   *
   * @example
   * ```ts
   * const calls = await account.decodeCalls('0x...')
   * // [{ to: '0x...', data: '0x...', value: 100n }, ...]
   * ```
   */
  decodeCalls?: ((data: Hex) => Promise<readonly Call[]>) | undefined
  /**
   * Encodes the calls into calldata for executing a User Operation.
   *
   * @example
   * ```ts
   * const callData = await account.encodeCalls([
   *   { to: '0x...', data: '0x...' },
   *   { to: '0x...', data: '0x...', value: 100n },
   * ])
   * // '0x...'
   * ```
   */
  encodeCalls: (calls: readonly Call[]) => Promise<Hex>
  /**
   * Retrieves the calldata for factory call to deploy a Smart Account.
   * If the Smart Account has already been deployed, this will return undefined values.
   *
   * @example Counterfactual account
   * ```ts
   * const { factory, factoryData } = await account.getFactoryArgs()
   * // { factory: '0x...', factoryData: '0x...' }
   * ```
   *
   * @example Deployed account
   * ```ts
   * const { factory, factoryData } = await account.getFactoryArgs()
   * // { factory: undefined, factoryData: undefined }
   * ```
   */
  getFactoryArgs: () => Promise<{
    factory?: Address | undefined
    factoryData?: Hex | undefined
  }>
  /**
   * Retrieves the nonce of the Account.
   *
   * @example
   * ```ts
   * const nonce = await account.getNonce()
   * // 1n
   * ```
   */
  getNonce?:
    | ((
        parameters?: { key?: bigint | undefined } | undefined,
      ) => Promise<bigint>)
    | undefined
  /**
   * Retrieves the User Operation "stub" signature for gas estimation.
   *
   * ```ts
   * const signature = await account.getStubSignature()
   * // '0x...'
   * ```
   */
  getStubSignature: (
    parameters?: UserOperationRequest | undefined,
  ) => Promise<Hex>
  /** Custom nonce key manager. */
  nonceKeyManager?: NonceManager | undefined
  /**
   * Signs a hash via the Smart Account's owner.
   *
   * @example
   * ```ts
   * const signature = await account.sign({
   *   hash: '0x...'
   * })
   * // '0x...'
   * ```
   */
  sign?: ((parameters: { hash: Hash }) => Promise<Hex>) | undefined
  /**
   * Signs a [EIP-191 Personal Sign message](https://eips.ethereum.org/EIPS/eip-191).
   *
   * @example
   * ```ts
   * const signature = await account.signMessage({
   *   message: 'Hello, World!'
   * })
   * // '0x...'
   * ```
   */
  signMessage: (parameters: { message: SignableMessage }) => Promise<Hex>
  /**
   * Signs [EIP-712 Typed Data](https://eips.ethereum.org/EIPS/eip-712).
   *
   * @example
   * ```ts
   * const signature = await account.signTypedData({
   *   domain,
   *   types,
   *   primaryType: 'Mail',
   *   message,
   * })
   * ```
   */
  signTypedData: <
    const typedData extends TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  >(
    parameters: TypedDataDefinition<typedData, primaryType>,
  ) => Promise<Hex>
  /**
   * Signs the User Operation.
   *
   * @example
   * ```ts
   * const signature = await account.signUserOperation({
   *   chainId: 1,
   *   userOperation,
   * })
   * ```
   */
  signUserOperation: (
    parameters: UnionPartialBy<UserOperation, 'sender'> & {
      chainId?: number | undefined
    },
  ) => Promise<Hex>
  /** User Operation configuration properties. */
  userOperation?:
    | {
        /** Prepares gas properties for the User Operation request. */
        estimateGas?:
          | ((
              userOperation: UserOperationRequest,
            ) => Promise<
              ExactPartial<EstimateUserOperationGasReturnType> | undefined
            >)
          | undefined
      }
    | undefined
}

export type SmartAccount<
  implementation extends
    SmartAccountImplementation = SmartAccountImplementation,
> = Assign<
  implementation['extend'],
  Assign<
    implementation,
    {
      /** Address of the Smart Account. */
      address: Address
      /**
       * Retrieves the nonce of the Account.
       *
       * @example
       * ```ts
       * const nonce = await account.getNonce()
       * // 1n
       * ```
       */
      getNonce: NonNullable<SmartAccountImplementation['getNonce']>
      /** Whether or not the Smart Account has been deployed. */
      isDeployed: () => Promise<boolean>
      /** Type of account. */
      type: 'smart'
    }
  >
>

export type WebAuthnAccount = {
  id: string
  publicKey: Hex
  sign: ({ hash }: { hash: Hash }) => Promise<WebAuthnSignReturnType>
  signMessage: ({
    message,
  }: { message: SignableMessage }) => Promise<WebAuthnSignReturnType>
  signTypedData: <
    const typedData extends TypedDataDefinition | Record<string, unknown>,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  >(
    typedDataDefinition: TypedDataDefinition<typedData, primaryType>,
  ) => Promise<WebAuthnSignReturnType>
  type: 'webAuthn'
}
