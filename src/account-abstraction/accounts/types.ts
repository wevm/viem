import type { Abi, Address, TypedData } from 'abitype'
import type { SignReturnType as WebAuthnSignReturnType } from 'webauthn-p256'

import type { Client } from '../../clients/createClient.js'
import type { Hash, Hex, SignableMessage } from '../../types/misc.js'
import type { TypedDataDefinition } from '../../types/typedData.js'
import type { Assign, ExactPartial, UnionPartialBy } from '../../types/utils.js'
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
  abi extends Abi | readonly unknown[] = Abi,
  factoryAbi extends Abi | readonly unknown[] = Abi,
  entryPointAbi extends Abi | readonly unknown[] = Abi,
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = {
  /** ABI of the Smart Account implementation. */
  abi: abi
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
  /** Factory of the Smart Account. */
  factory: {
    /** Address of the Smart Account's Factory. */
    address: Address
    /** ABI of the Smart Account's Factory. */
    abi: factoryAbi
  }
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
  getNonce: () => Promise<bigint>
  /**
   * Retrieves the User Operation "stub" signature for gas estimation.
   *
   * ```ts
   * const signature = await account.getStubSignature()
   * // '0x...'
   * ```
   */
  getStubSignature: () => Promise<Hex>
  /**
   * Calculates an Ethereum-specific signature in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191): `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.
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
   * Signs typed data and calculates an Ethereum-specific signature in [https://eips.ethereum.org/EIPS/eip-712](https://eips.ethereum.org/EIPS/eip-712): `sign(keccak256("\x19\x01" ‖ domainSeparator ‖ hashStruct(message)))`
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
          | ((parameters: {
              userOperation: UserOperationRequest
            }) => Promise<
              ExactPartial<EstimateUserOperationGasReturnType> | undefined
            >)
          | undefined
      }
    | undefined
}

export type SmartAccount<
  abi extends Abi | readonly unknown[] = Abi,
  factoryAbi extends Abi | readonly unknown[] = Abi,
  entryPointAbi extends Abi | readonly unknown[] = Abi,
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = Assign<
  SmartAccountImplementation<abi, factoryAbi, entryPointAbi, entryPointVersion>,
  {
    /** Address of the Smart Account. */
    address: Address
    /** Whether or not the Smart Account has been deployed. */
    isDeployed: () => Promise<boolean>
    /** Type of account. */
    type: 'smart'
  }
>

export type WebAuthnAccount = {
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
