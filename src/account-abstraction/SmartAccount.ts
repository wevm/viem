import type { Abi } from 'abitype'
import { Abi as ox_Abi } from 'ox'
import type { Address, Errors, Hex } from 'ox'
import { SignatureErc6492 } from 'ox/erc6492'

import type * as Account from '../core/Account.js'
import type * as Client from '../core/Client.js'
import * as NonceManager from '../core/NonceManager.js'
import { getCode } from '../core/actions/address/getCode.js'
import { getId } from '../core/actions/chains/getId.js'
import { read } from '../core/actions/contract/read.js'
import type {
  Assign,
  ExactPartial,
  MaybePromise,
  Omit,
} from '../core/internal/types.js'
import type * as EntryPoint from './EntryPoint.js'
import type * as UserOperation from './UserOperation.js'
import type * as UserOperationGas from './UserOperationGas.js'

const getNonceAbi = /*#__PURE__*/ ox_Abi.from([
  'function getNonce(address, uint192) view returns (uint256)',
])

/** A call encoded and executed by a {@link SmartAccount}. */
export type Call = {
  /** Calldata sent to the target. */
  data?: Hex.Hex | undefined
  /** Target address. */
  to: Address.Address
  /** Native value sent to the target. */
  value?: bigint | undefined
}

/** Factory data used to deploy a {@link SmartAccount}. */
export type FactoryArgs = {
  /** Account factory, or the EIP-7702 factory sentinel. */
  factory?: Address.Address | '0x7702' | undefined
  /** Calldata passed to the factory. */
  factoryData?: Hex.Hex | undefined
}

/** Definition used to create a {@link SmartAccount}. */
export type Implementation<
  entryPointAbi extends Abi | readonly unknown[] = Abi,
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
  extend extends object = object,
  eip7702 extends boolean = boolean,
> = {
  /** Client used to read account and EntryPoint state. */
  client: Client.Client
  /** EntryPoint supported by the account implementation. */
  entryPoint: {
    /** EntryPoint ABI. */
    abi: entryPointAbi
    /** EntryPoint address. */
    address: Address.Address
    /** EntryPoint version. */
    version: entryPointVersion
  }
  /** Additional properties exposed by the account. */
  extend?: extend | undefined
  /** Decodes execution calldata into calls. */
  decodeCalls?: ((data: Hex.Hex) => MaybePromise<readonly Call[]>) | undefined
  /** Encodes calls as account execution calldata. */
  encodeCalls: (calls: readonly Call[]) => MaybePromise<Hex.Hex>
  /** Returns the account address. */
  getAddress: () => MaybePromise<Address.Address>
  /** Returns account deployment factory data. */
  getFactoryArgs: () => MaybePromise<FactoryArgs>
  /** Returns the account nonce. */
  getNonce?:
    | ((options?: getNonce.Options | undefined) => MaybePromise<bigint>)
    | undefined
  /** Returns a placeholder signature for gas estimation. */
  getStubSignature: (
    userOperation?:
      | ExactPartial<UserOperation.UserOperation<entryPointVersion>>
      | undefined,
  ) => MaybePromise<Hex.Hex>
  /** Manages automatically allocated EntryPoint nonce keys. */
  nonceKeyManager?: NonceManager.NonceManager | undefined
  /** Signs a hash with the account owner. */
  sign?: ((options: { hash: Hex.Hex }) => MaybePromise<Hex.Hex>) | undefined
  /** Signs an EIP-191 personal message with the account owner. */
  signMessage: Account.Local['signMessage']
  /** Signs EIP-712 typed data with the account owner. */
  signTypedData: Account.Local['signTypedData']
  /** Signs a User Operation with the account owner. */
  signUserOperation: (
    userOperation: WithOptionalSender<
      UserOperation.UserOperation<entryPointVersion>
    > & { chainId?: number | undefined },
  ) => MaybePromise<Hex.Hex>
  /** User Operation preparation hooks. */
  userOperation?:
    | {
        /** Overrides User Operation gas estimation. */
        estimateGas?:
          | ((
              userOperation: ExactPartial<
                UserOperation.UserOperation<entryPointVersion>
              >,
            ) =>
              | Promise<
                  | ExactPartial<
                      UserOperationGas.UserOperationGas<entryPointVersion>
                    >
                  | undefined
                >
              | ExactPartial<
                  UserOperationGas.UserOperationGas<entryPointVersion>
                >
              | undefined)
          | undefined
      }
    | undefined
} & (eip7702 extends true
  ? {
      /** EIP-7702 delegation used to deploy the account. */
      authorization: {
        /** Account that signs the authorization. */
        account: Account.PrivateKey
        /** Delegated implementation address. */
        address: Address.Address
      }
    }
  : { authorization?: undefined })

/** A fully resolved ERC-4337 smart account. */
export type SmartAccount<
  implementation extends ImplementationShape = Implementation,
> = Assign<
  NonNullable<implementation['extend']>,
  Assign<
    Omit<implementation, 'extend' | 'nonceKeyManager'>,
    {
      /** Account address. */
      address: Awaited<ReturnType<implementation['getAddress']>>
      /** Returns account deployment factory data when undeployed. */
      getFactoryArgs: () => Promise<FactoryArgs>
      /** Returns the account nonce. */
      getNonce: (options?: getNonce.Options | undefined) => Promise<bigint>
      /** Whether the account is deployed. */
      isDeployed: () => Promise<boolean>
      /** Signs an EIP-191 personal message with the account owner. */
      signMessage: Account.Local['signMessage']
      /** Signs EIP-712 typed data with the account owner. */
      signTypedData: Account.Local['signTypedData']
      /** Account type. */
      type: 'smart'
    } & ResolvedSign<implementation>
  >
>

/**
 * Creates a {@link SmartAccount} from an implementation definition.
 *
 * @example
 * ```ts
 * import { SmartAccount } from 'viem/account-abstraction'
 *
 * const account = await SmartAccount.from({
 *   // ...implementation
 * })
 * ```
 *
 * @param implementation - Account implementation.
 * @returns The resolved Smart Account.
 */
export async function from<const implementation extends Implementation>(
  implementation: implementation,
): Promise<from.ReturnType<implementation>> {
  const {
    extend,
    nonceKeyManager = NonceManager.from({
      source: {
        get() {
          return Date.now()
        },
        set() {},
      },
    }),
    ...rest
  } = implementation

  let deployed = false
  type ResolvedAddress = Awaited<ReturnType<implementation['getAddress']>>
  const address = (await implementation.getAddress()) as ResolvedAddress

  async function isDeployed() {
    if (deployed) return true
    deployed = Boolean(await getCode(implementation.client, { address }))
    return deployed
  }

  async function getFactoryArgs() {
    if (await isDeployed())
      return { factory: undefined, factoryData: undefined }
    return implementation.getFactoryArgs()
  }

  async function getNonce(options: getNonce.Options = {}) {
    const chainId =
      implementation.client.chain?.id ?? (await getId(implementation.client))
    const key =
      options.key ??
      BigInt(
        await nonceKeyManager.consume({
          address,
          chainId,
          client: implementation.client,
        }),
      )

    if (implementation.getNonce)
      return await implementation.getNonce({ ...options, key })

    return await read(implementation.client, {
      abi: getNonceAbi,
      address: implementation.entryPoint.address,
      args: [address, key],
      functionName: 'getNonce',
    })
  }

  const account = {
    ...extend,
    ...rest,
    address,
    getFactoryArgs,
    getNonce,
    isDeployed,
    ...(implementation.sign
      ? {
          async sign(options: { hash: Hex.Hex }) {
            const [factoryArgs, signature] = await Promise.all([
              getFactoryArgs(),
              implementation.sign!(options),
            ])
            const { factory, factoryData } = factoryArgs
            if (factory && factoryData)
              return SignatureErc6492.wrap({
                data: factoryData,
                signature,
                to: factory,
              })
            return signature
          },
        }
      : {}),
    async signMessage(options: Parameters<Account.Local['signMessage']>[0]) {
      const [factoryArgs, signature] = await Promise.all([
        getFactoryArgs(),
        implementation.signMessage(options),
      ])
      const { factory, factoryData } = factoryArgs
      if (factory && factoryData && factory !== '0x7702')
        return SignatureErc6492.wrap({
          data: factoryData,
          signature,
          to: factory,
        })
      return signature
    },
    async signTypedData(
      options: Parameters<Account.Local['signTypedData']>[0],
    ) {
      const [factoryArgs, signature] = await Promise.all([
        getFactoryArgs(),
        implementation.signTypedData(options),
      ])
      const { factory, factoryData } = factoryArgs
      if (factory && factoryData && factory !== '0x7702')
        return SignatureErc6492.wrap({
          data: factoryData,
          signature,
          to: factory,
        })
      return signature
    },
    type: 'smart',
  }

  return account as from.ReturnType<implementation>
}

export declare namespace from {
  /** Return type of {@link from}. */
  type ReturnType<implementation extends Implementation = Implementation> =
    SmartAccount<implementation>

  /** Errors thrown by {@link from}. */
  type ErrorType =
    | getCode.ErrorType
    | getId.ErrorType
    | read.ErrorType
    | SignatureErc6492.wrap.ErrorType
    | Errors.GlobalErrorType
}

export declare namespace getNonce {
  /** Options for {@link SmartAccount.getNonce}. */
  type Options = {
    /** EntryPoint nonce key. */
    key?: bigint | undefined
  }
}

type WithOptionalSender<userOperation> = userOperation extends {
  sender: infer sender
}
  ? Omit<userOperation, 'sender'> & { sender?: sender | undefined }
  : userOperation

type ResolvedSign<implementation> = implementation extends {
  sign: NonNullable<Implementation['sign']>
}
  ? {
      sign: (options: { hash: Hex.Hex }) => Promise<Hex.Hex>
    }
  : {}

type ImplementationShape = {
  extend?: object | undefined
  getAddress: () => MaybePromise<Address.Address>
  nonceKeyManager?: unknown | undefined
}
