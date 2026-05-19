import type * as Address from 'ox/Address'
import * as ox_Address from 'ox/Address'
import type * as Authorization from 'ox/Authorization'
import * as ox_Authorization from 'ox/Authorization'
import type * as Bytes from 'ox/Bytes'
import * as Hex from 'ox/Hex'
import type * as HdKey from 'ox/HdKey'
import * as ox_Mnemonic from 'ox/Mnemonic'
import * as PersonalMessage from 'ox/PersonalMessage'
import type * as PublicKey from 'ox/PublicKey'
import * as Secp256k1 from 'ox/Secp256k1'
import * as Signature from 'ox/Signature'
import type * as TxEnvelope from 'ox/TxEnvelope'
import * as ox_TxEnvelope from 'ox/TxEnvelope'
import type * as TypedData from 'ox/TypedData'
import * as ox_TypedData from 'ox/TypedData'

import type * as NonceManager from '../utils/NonceManager.js'
import { BaseError } from './BaseError.js'
import type { Prettify } from './internal/types.js'

/** Account used by viem clients and actions. */
export type Account<address extends Address.Address = Address.Address> =
  | JsonRpc<address>
  | Local<string, address>

/** JSON-RPC account managed by a wallet/provider. */
export type JsonRpc<address extends Address.Address = Address.Address> = {
  /** Account address. */
  address: address
  /** Account type. */
  type: 'json-rpc'
}

/** Local account with signing capabilities. */
export type Local<
  source extends string = string,
  address extends Address.Address = Address.Address,
> = Prettify<
  {
    /** Account address. */
    address: address
    /** Optional nonce manager for local transaction sending. */
    nonceManager?: NonceManager.NonceManager | undefined
    /** Public key when known. */
    publicKey?: PublicKey.PublicKey | undefined
    /** Account source metadata. */
    source: source
    /** Account type. */
    type: 'local'
    /** Signs a raw payload. */
    sign(options: sign.Options): Promise<Hex.Hex>
    /** Signs an EIP-191 personal message. */
    signMessage(options: signMessage.Options): Promise<Hex.Hex>
    /** Signs a transaction envelope. */
    signTransaction<const transaction extends TxEnvelope.TxEnvelope>(
      transaction: transaction,
      options?: signTransaction.Options | undefined,
    ): Promise<signTransaction.ReturnType<transaction>>
    /** Signs EIP-712 typed data. */
    signTypedData<
      const typedData extends TypedData.TypedData | Record<string, unknown>,
      primaryType extends keyof typedData | 'EIP712Domain',
    >(
      options: signTypedData.Options<typedData, primaryType>,
    ): Promise<Hex.Hex>
    /** Signs an EIP-7702 authorization. */
    signAuthorization(
      authorization: signAuthorization.Options,
    ): Promise<Authorization.Signed>
  } & (source extends 'hd' | 'mnemonic'
    ? { getHdKey(): HdKey.HdKey }
    : Record<never, never>)
>

/** Private-key local account. */
export type PrivateKey<address extends Address.Address = Address.Address> =
  Local<'privateKey', address> & {
    publicKey: PublicKey.PublicKey
  }

/** HD local account. */
export type Hd<address extends Address.Address = Address.Address> = Local<
  'hd',
  address
> & {
  getHdKey(): HdKey.HdKey
  publicKey: PublicKey.PublicKey
}

/** Mnemonic-derived local account. */
export type Mnemonic<address extends Address.Address = Address.Address> = Local<
  'mnemonic',
  address
> & {
  getHdKey(): HdKey.HdKey
  publicKey: PublicKey.PublicKey
}

/** Account input accepted by {@link from}. */
export type Source =
  | Address.Address
  | Account
  | (LocalSource & { source?: string | undefined })

/** Local account source accepted by {@link fromLocal}. */
export type LocalSource<
  address extends Address.Address = Address.Address,
  source extends string = string,
> = {
  /** Account address. */
  address: address
  /** Optional nonce manager. */
  nonceManager?: NonceManager.NonceManager | undefined
  /** Public key when known. */
  publicKey?: PublicKey.PublicKey | undefined
  /** Account source metadata. */
  source?: source | undefined
  /** Signs a raw payload. */
  sign(options: sign.Options): Promise<Hex.Hex>
  /** Signs an EIP-191 personal message. */
  signMessage?: ((options: signMessage.Options) => Promise<Hex.Hex>) | undefined
  /** Signs a transaction envelope. */
  signTransaction?:
    | (<const transaction extends TxEnvelope.TxEnvelope>(
        transaction: transaction,
        options?: signTransaction.Options | undefined,
      ) => Promise<signTransaction.ReturnType<transaction>>)
    | undefined
  /** Signs EIP-712 typed data. */
  signTypedData?:
    | (<
        const typedData extends TypedData.TypedData | Record<string, unknown>,
        primaryType extends keyof typedData | 'EIP712Domain',
      >(
        options: signTypedData.Options<typedData, primaryType>,
      ) => Promise<Hex.Hex>)
    | undefined
  /** Signs an EIP-7702 authorization. */
  signAuthorization?:
    | ((
        authorization: signAuthorization.Options,
      ) => Promise<Authorization.Signed>)
    | undefined
}

/** HD derivation options. */
export type HdOptions = {
  /** Account index for the default Ethereum BIP-44 path. */
  accountIndex?: number | undefined
  /** Address index for the default Ethereum BIP-44 path. */
  addressIndex?: number | undefined
  /** Change index for the default Ethereum BIP-44 path. */
  changeIndex?: number | undefined
  /** Explicit HD derivation path. */
  path?: `m/44'/60'/${string}` | undefined
}

/** Creates an account from an address, local source, or existing account. */
export function from<const source extends Source>(
  source: source,
): from.ReturnType<source> {
  if (typeof source === 'string') return fromJsonRpc(source) as never
  if (typeof source === 'object' && 'type' in source) return source as never
  return fromLocal(source) as never
}

export declare namespace from {
  type ReturnType<source extends Source = Source> =
    source extends Address.Address
      ? JsonRpc<source>
      : source extends Account
        ? source
        : source extends LocalSource<infer address, infer sourceName>
          ? Local<sourceName, address>
          : Account

  type ErrorType = fromJsonRpc.ErrorType | fromLocal.ErrorType
}

/** Creates a JSON-RPC account from an address. */
export function fromJsonRpc<const address extends Address.Address>(
  address: address | Address.Address,
): JsonRpc<address> {
  assertAddress(address)
  return {
    address: address as address,
    type: 'json-rpc',
  }
}

export declare namespace fromJsonRpc {
  type ErrorType = InvalidAddressError
}

/** Creates a local account from a signing source. */
export function fromLocal<
  const source extends string = 'custom',
  const address extends Address.Address = Address.Address,
>(source: LocalSource<address, source>): Local<source, address> {
  assertAddress(source.address)

  const account = {
    address: source.address,
    nonceManager: source.nonceManager,
    publicKey: source.publicKey,
    source: source.source ?? 'custom',
    type: 'local',
  } as Local<source, address>

  return Object.assign(account, {
    sign: (options: sign.Options) => source.sign(options),
    signAuthorization:
      source.signAuthorization ??
      ((authorization: signAuthorization.Options) =>
        signAuthorizationWith(account, authorization)),
    signMessage:
      source.signMessage ??
      ((options: signMessage.Options) => signMessageWith(account, options)),
    signTransaction:
      source.signTransaction ??
      ((
        transaction: TxEnvelope.TxEnvelope,
        options?: signTransaction.Options,
      ) =>
        signTransactionWith(account, transaction as never, options) as never),
    signTypedData:
      source.signTypedData ??
      ((options: signTypedData.Options) =>
        signTypedDataWith(account, options as never)),
  })
}

export declare namespace fromLocal {
  type ErrorType = InvalidAddressError
}

/** Creates a local account from a private key. */
export function fromPrivateKey(
  privateKey: Hex.Hex | Bytes.Bytes,
  options: fromPrivateKey.Options = {},
): PrivateKey {
  const { nonceManager } = options
  const publicKey = Secp256k1.getPublicKey({ privateKey })
  const address = ox_Address.fromPublicKey(publicKey, { checksum: true })

  return fromLocal({
    address,
    nonceManager,
    publicKey,
    source: 'privateKey',
    async sign(options) {
      return Secp256k1.sign({
        ...options,
        as: 'Hex',
        privateKey,
      })
    },
  }) as PrivateKey
}

export declare namespace fromPrivateKey {
  type Options = {
    /** Optional nonce manager. */
    nonceManager?: NonceManager.NonceManager | undefined
  }

  type ErrorType =
    | Secp256k1.getPublicKey.ErrorType
    | Secp256k1.sign.ErrorType
    | ox_Address.fromPublicKey.ErrorType
}

/** Creates a local account from a mnemonic. */
export function fromMnemonic(
  mnemonic: string,
  options: fromMnemonic.Options = {},
): Mnemonic {
  const { passphrase, ...hdOptions } = options
  return fromHdKey(ox_Mnemonic.toHdKey(mnemonic, { passphrase }), {
    ...hdOptions,
    source: 'mnemonic',
  }) as unknown as Mnemonic
}

export declare namespace fromMnemonic {
  type Options = HdOptions &
    fromPrivateKey.Options & {
      /** Optional BIP-39 passphrase. */
      passphrase?: string | undefined
    }

  type ErrorType = ox_Mnemonic.toHdKey.ErrorType | fromHdKey.ErrorType
}

/** Creates a local account from a HD key. */
export function fromHdKey(
  hdKey: HdKey.HdKey,
  options: fromHdKey.Options = {},
): Hd {
  const {
    accountIndex = 0,
    addressIndex = 0,
    changeIndex = 0,
    path = `m/44'/60'/${accountIndex}'/${changeIndex}/${addressIndex}`,
    source = 'hd',
    ...privateKeyOptions
  } = options

  const derivedKey = hdKey.derive(path)
  const account = fromPrivateKey(derivedKey.privateKey, privateKeyOptions)
  return {
    ...account,
    getHdKey: () => derivedKey,
    source,
  } as Hd
}

export declare namespace fromHdKey {
  type Options = HdOptions &
    fromPrivateKey.Options & {
      /** Account source metadata. */
      source?: 'hd' | 'mnemonic' | undefined
    }

  type ErrorType = fromPrivateKey.ErrorType
}

/** Signs a raw payload with a local account. */
export async function sign(
  account: Account,
  options: sign.Options,
): Promise<Hex.Hex> {
  if (account.type !== 'local') throw new SignNotSupportedError()
  return account.sign(options)
}

export declare namespace sign {
  type Options = {
    /** Payload to sign. */
    payload: Hex.Hex | Bytes.Bytes
    /** Extra entropy to add to the signing process. */
    extraEntropy?: boolean | Hex.Hex | Bytes.Bytes | undefined
  }

  type ErrorType = SignNotSupportedError
}

/** Signs an EIP-191 personal message with a local account. */
export async function signMessage(
  account: Account,
  options: signMessage.Options,
): Promise<Hex.Hex> {
  if (account.type !== 'local') throw new SignNotSupportedError()
  return account.signMessage(options)
}

export declare namespace signMessage {
  type Options = {
    /** Message to sign. */
    message: Message
  }

  type ErrorType = sign.ErrorType | PersonalMessage.getSignPayload.ErrorType
}

/** Signs EIP-712 typed data with a local account. */
export async function signTypedData<
  const typedData extends TypedData.TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
>(
  account: Account,
  options: signTypedData.Options<typedData, primaryType>,
): Promise<Hex.Hex> {
  if (account.type !== 'local') throw new SignNotSupportedError()
  return account.signTypedData(options)
}

export declare namespace signTypedData {
  type Options<
    typedData extends TypedData.TypedData | Record<string, unknown> =
      TypedData.TypedData,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  > = TypedData.Definition<typedData, primaryType>

  type ErrorType = sign.ErrorType | ox_TypedData.getSignPayload.ErrorType
}

/** Signs an EIP-7702 authorization with a local account. */
export async function signAuthorization(
  account: Account,
  authorization: signAuthorization.Options,
): Promise<Authorization.Signed> {
  if (account.type !== 'local') throw new SignNotSupportedError()
  return account.signAuthorization(authorization)
}

export declare namespace signAuthorization {
  type Options = Authorization.Authorization<false, bigint | number, number>

  type ErrorType =
    | sign.ErrorType
    | ox_Authorization.getSignPayload.ErrorType
    | Signature.fromHex.ErrorType
}

/** Signs a transaction envelope with a local account. */
export async function signTransaction<
  const transaction extends TxEnvelope.TxEnvelope,
>(
  account: Account,
  transaction: transaction,
  options: signTransaction.Options = {},
): Promise<signTransaction.ReturnType<transaction>> {
  if (account.type !== 'local') throw new SignNotSupportedError()
  return account.signTransaction(transaction, options)
}

export declare namespace signTransaction {
  type Options = Omit<ox_TxEnvelope.serialize.Options, 'signature'>

  type ReturnType<
    transaction extends TxEnvelope.TxEnvelope = TxEnvelope.TxEnvelope,
  > = ox_TxEnvelope.serialize.ReturnType<transaction>

  type ErrorType =
    | sign.ErrorType
    | ox_TxEnvelope.from.ErrorType
    | ox_TxEnvelope.getSignPayload.ErrorType
    | ox_TxEnvelope.serialize.ErrorType
    | Signature.fromHex.ErrorType
}

/** Message accepted by {@link signMessage}. */
export type Message =
  | string
  | {
      /** Raw message data. */
      raw: Hex.Hex | Bytes.Bytes
    }

function signMessageWith(
  account: Local,
  options: signMessage.Options,
): Promise<Hex.Hex> {
  return sign(account, {
    payload: PersonalMessage.getSignPayload(toMessageData(options.message)),
  })
}

async function signTypedDataWith<
  const typedData extends TypedData.TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
>(account: Local, options: signTypedData.Options<typedData, primaryType>) {
  return sign(account, {
    payload: ox_TypedData.getSignPayload(options),
  })
}

async function signAuthorizationWith(
  account: Local,
  authorization: signAuthorization.Options,
) {
  const authorization_ = {
    ...authorization,
    nonce: BigInt(authorization.nonce),
  } as Authorization.Authorization<false>
  const signature = Signature.fromHex(
    await sign(account, {
      payload: ox_Authorization.getSignPayload(authorization_),
    }),
  )
  return ox_Authorization.from(authorization_, { signature })
}

async function signTransactionWith<
  const transaction extends TxEnvelope.TxEnvelope,
>(
  account: Local,
  transaction: transaction,
  options: signTransaction.Options = {},
): Promise<signTransaction.ReturnType<transaction>> {
  const envelope = ox_TxEnvelope.from(transaction)
  const signature = Signature.fromHex(
    await sign(account, {
      payload: ox_TxEnvelope.getSignPayload(envelope),
    }),
  )
  return ox_TxEnvelope.serialize(envelope, {
    ...options,
    signature,
  }) as signTransaction.ReturnType<transaction>
}

function toMessageData(message: Message) {
  if (typeof message === 'string') return Hex.fromString(message)
  return message.raw
}

function assertAddress(
  address: Address.Address | string | undefined,
): asserts address is Address.Address {
  if (!address || !ox_Address.validate(address, { strict: false }))
    throw new InvalidAddressError({ address })
}

/** Thrown when an account address is invalid. */
export class InvalidAddressError extends BaseError {
  override name = 'Account.InvalidAddressError'

  constructor({ address }: { address: string | undefined }) {
    super(`Address "${address}" is invalid.`, {
      metaMessages: ['Address must be a hex value of 20 bytes.'],
    })
  }
}

/** Thrown when an account cannot sign locally. */
export class SignNotSupportedError extends BaseError {
  override name = 'Account.SignNotSupportedError'

  constructor() {
    super('Account does not support local signing.')
  }
}
