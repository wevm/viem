import type { Address, TypedData } from 'abitype'
import type { SignReturnType as WebAuthnSignReturnType } from 'webauthn-p256'

import type { HDKey } from '../types/account.js'
import type { Hash, Hex, SignableMessage } from '../types/misc.js'
import type {
  TransactionSerializable,
  TransactionSerialized,
} from '../types/transaction.js'
import type { TypedDataDefinition } from '../types/typedData.js'
import type { Assign, IsNarrowable, OneOf } from '../types/utils.js'
import type { NonceManager } from '../utils/nonceManager.js'
import type { GetTransactionType } from '../utils/transaction/getTransactionType.js'
import type { SerializeTransactionFn } from '../utils/transaction/serializeTransaction.js'
import type { SmartAccountImplementation } from './implementations/defineImplementation.js'

export type Account<address extends Address = Address> = OneOf<
  JsonRpcAccount<address> | LocalAccount<string, address> | SmartAccount
>

///////////////////////////////////////////////////////////////////////////////////////////////////
// Sources
///////////////////////////////////////////////////////////////////////////////////////////////////

export type AccountSource = Address | CustomSource
export type CustomSource = {
  address: Address
  nonceManager?: NonceManager | undefined
  // TODO(v3): Make `sign` required.
  sign?: (({ hash }: { hash: Hash }) => Promise<Hash>) | undefined
  signMessage: ({ message }: { message: SignableMessage }) => Promise<Hash>
  signTransaction: <
    serializer extends
      SerializeTransactionFn<TransactionSerializable> = SerializeTransactionFn<TransactionSerializable>,
    transaction extends Parameters<serializer>[0] = Parameters<serializer>[0],
  >(
    transaction: transaction,
    args?:
      | {
          serializer?: serializer | undefined
        }
      | undefined,
  ) => Promise<
    IsNarrowable<
      TransactionSerialized<GetTransactionType<transaction>>,
      Hash
    > extends true
      ? TransactionSerialized<GetTransactionType<transaction>>
      : Hash
  >
  signTypedData: <
    const typedData extends TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  >(
    typedDataDefinition: TypedDataDefinition<typedData, primaryType>,
  ) => Promise<Hash>
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// Accounts
///////////////////////////////////////////////////////////////////////////////////////////////////

export type JsonRpcAccount<address extends Address = Address> = {
  address: address
  type: 'json-rpc'
}

export type LocalAccount<
  source extends string = string,
  address extends Address = Address,
> = Assign<
  CustomSource,
  {
    address: address
    publicKey: Hex
    sign: ({ hash }: { hash: Hash }) => Promise<Hash>
    source: source
    type: 'local'
  }
>

export type HDAccount = LocalAccount<'hd'> & {
  getHdKey(): HDKey
}

export type HDOptions =
  | {
      /** The account index to use in the path (`"m/44'/60'/${accountIndex}'/0/0"`). */
      accountIndex?: number | undefined
      /** The address index to use in the path (`"m/44'/60'/0'/0/${addressIndex}"`). */
      addressIndex?: number | undefined
      /** The change index to use in the path (`"m/44'/60'/0'/${changeIndex}/0"`). */
      changeIndex?: number | undefined
      path?: undefined
    }
  | {
      accountIndex?: undefined
      addressIndex?: undefined
      changeIndex?: undefined
      /** The HD path. */
      path: `m/44'/60'/${string}`
    }

export type PrivateKeyAccount = LocalAccount<'privateKey'>

export type WebAuthnAccount = {
  publicKey: Hex
  sign: ({ hash }: { hash: Hash }) => Promise<WebAuthnSignReturnType>
  signMessage: ({
    message,
  }: { message: SignableMessage }) => Promise<WebAuthnSignReturnType>
  signTypedData: <
    const typedData extends TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  >(
    typedDataDefinition: TypedDataDefinition<typedData, primaryType>,
  ) => Promise<WebAuthnSignReturnType>
  type: 'webAuthn'
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// Smart Account
///////////////////////////////////////////////////////////////////////////////////////////////////

export type SmartAccount<
  implementation extends
    SmartAccountImplementation = SmartAccountImplementation,
> = Assign<
  implementation,
  {
    /** Address of the Smart Account. */
    address: Address
    /** Whether or not the Smart Account has been deployed. */
    isDeployed: () => Promise<boolean>
    /** Type of account. */
    type: 'smart'
  }
>
