import type { Abi, Address, TypedData } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Hex, SignableMessage } from '../../../types/misc.js'
import type { TypedDataDefinition } from '../../../types/typedData.js'
import type { OneOf, UnionPartialBy } from '../../../types/utils.js'
import type { EntryPointVersion } from '../types/entryPointVersion.js'
import type {
  PackedUserOperation,
  UserOperation,
} from '../types/userOperation.js'

type Call = {
  to: Hex
  data?: Hex | undefined
  value?: bigint | undefined
}

type SignMessageParameters = { message: SignableMessage }

type SignUserOperationParameters = {
  chainId?: number | undefined
  userOperation: UnionPartialBy<UserOperation, 'sender'>
}

export type SmartAccountImplementationFn<
  implementation extends
    SmartAccountImplementation = SmartAccountImplementation,
> = (parameters: {
  address?: Address | undefined
  client: Client<Transport>
}) => implementation

export type SmartAccountImplementation<
  abi extends Abi | readonly unknown[] = Abi,
  factoryAbi extends Abi | readonly unknown[] = Abi,
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = {
  /** ABI of the Smart Account implementation. */
  abi: abi
  /** Compatible EntryPoint address. */
  entryPointAddress: Address
  /** Compatible EntryPoint version. */
  entryPointVersion: entryPointVersion
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
   * Retrieves the calldata for executing a User Operation.
   *
   * @example
   * ```ts
   * const callData = await account.getCallData([
   *   { to: '0x...', data: '0x...' },
   *   { to: '0x...', data: '0x...', value: 100n },
   * ])
   * // '0x...'
   * ```
   */
  getCallData: (calls: readonly Call[]) => Promise<Hex>
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
   * Formats the User Operation signature.
   *
   * @example Dummy signature
   * ```ts
   * const signature = await account.getFormattedSignature()
   * // '0x...'
   * ```
   *
   * @example User Operation signature
   * ```ts
   * const signature = await account.getFormattedSignature(userOperation)
   * // '0x...'
   * ```
   */
  getFormattedSignature: (
    packedUserOperation?: Partial<PackedUserOperation> | undefined,
  ) => Promise<Hex>
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
  signMessage: (parameters: SignMessageParameters) => Promise<Hex>
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
  signUserOperation: (parameters: SignUserOperationParameters) => Promise<Hex>
}

export type SmartAccount<
  address extends Address | undefined = Address | undefined,
  initialized extends boolean = boolean,
  implementation extends
    SmartAccountImplementation = SmartAccountImplementation,
> = {
  /** Address of the Smart Account. */
  address: address extends Address ? address : Address
  /** Whether or not the Smart Account has invoked `initialize`. */
  initialized: initialized
  /** Function to initialize the Smart Account. */
  initialize: (
    client: Client<Transport>,
  ) => Promise<SmartAccount<address, true, implementation>>
  /** Whether or not the Smart Account has been deployed. */
  isDeployed: () => Promise<boolean>
  /** Type of account. */
  type: 'smart'
} & (initialized extends true
  ? implementation
  : OneOf<(implementation & { initialized: true }) | { initialized: false }>)
