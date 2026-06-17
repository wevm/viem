import * as Address from 'ox/Address'
import * as Authorization from 'ox/Authorization'
import type * as Bytes from 'ox/Bytes'
import type * as Errors from 'ox/Errors'
import * as HdKey from 'ox/HdKey'
import * as Hex from 'ox/Hex'
import * as Mnemonic from 'ox/Mnemonic'
import * as PersonalMessage from 'ox/PersonalMessage'
import * as PublicKey from 'ox/PublicKey'
import * as Secp256k1 from 'ox/Secp256k1'
import * as Signature from 'ox/Signature'
import * as TxEnvelope from 'ox/TxEnvelope'
import * as TypedData from 'ox/TypedData'
import type { OneOf } from './internal/types.js'

/** A viem Account: a local signer, or a json-rpc account referenced by address. */
export type Account<address extends Address.Address = Address.Address> = OneOf<
  JsonRpc<address> | Local<string, address>
>

/** An account whose signing is delegated to a json-rpc provider (e.g. a browser wallet). */
export type JsonRpc<address extends Address.Address = Address.Address> = {
  address: address
  type: 'json-rpc'
}

/** An account that signs locally from injected signing logic (private key, mnemonic, KMS, …). */
export type Local<
  source extends string = string,
  address extends Address.Address = Address.Address,
> = CustomSource & {
  address: address
  publicKey?: Hex.Hex | undefined
  source: source
  type: 'local'
}

/** A private-key-backed local account. */
export type PrivateKey = Local<'privateKey'> & {
  publicKey: Hex.Hex
}

/** A mnemonic/HD-derived local account. */
export type Hd = Local<'hd'> & {
  publicKey: Hex.Hex
  /** Returns the underlying HD key. */
  getHdKey: () => HdKey.HdKey
}

/** Custom signing logic backing a {@link Local}. */
export type CustomSource = {
  /** Address of the account. */
  address: Address.Address
  /** Signs a hash. */
  sign: (options: { hash: Hex.Hex }) => Hex.Hex | Promise<Hex.Hex>
  /** Signs an [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702) authorization. */
  signAuthorization?:
    | ((
        authorization: Authorization.Authorization,
      ) =>
        | Authorization.Authorization<true>
        | Promise<Authorization.Authorization<true>>)
    | undefined
  /** Signs an [EIP-191](https://eips.ethereum.org/EIPS/eip-191) personal message. */
  signMessage: (options: {
    message: SignableMessage
  }) => Hex.Hex | Promise<Hex.Hex>
  /** Signs a transaction, returning the serialized signed transaction. */
  signTransaction: (
    transaction: TxEnvelope.TxEnvelope,
  ) => Hex.Hex | Promise<Hex.Hex>
  /** Signs [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed data. */
  signTypedData: <
    const typedData extends TypedData.TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  >(
    typedData: TypedData.encode.Value<typedData, primaryType>,
  ) => Hex.Hex | Promise<Hex.Hex>
}

/** Message accepted by signing helpers: a UTF-8 string, or a raw payload signed as-is. */
export type SignableMessage = string | { raw: Hex.Hex | Bytes.Bytes }

/**
 * Creates an {@link Account} from an address (json-rpc) or custom signing logic (local).
 *
 * @example
 * ```ts
 * import { Account } from 'viem'
 *
 * const jsonRpc = Account.from('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
 * const local = Account.from({
 *   address: '0x…',
 *   async sign({ hash }) { return await kms.sign(hash) },
 *   async signMessage({ message }) { … },
 *   async signTransaction(transaction) { … },
 *   async signTypedData(typedData) { … },
 * })
 * ```
 */
export function from<const source extends Address.Address | CustomSource>(
  source: source,
): from.ReturnType<source> {
  if (typeof source === 'string') {
    Address.assert(source, { strict: false })
    return { address: source, type: 'json-rpc' } as never
  }
  Address.assert(source.address, { strict: false })
  return { ...source, source: 'custom', type: 'local' } as never
}

export declare namespace from {
  type ReturnType<source extends Address.Address | CustomSource> =
    | (source extends Address.Address ? JsonRpc : never)
    | (source extends CustomSource ? Local<'custom'> : never)

  type ErrorType = Address.assert.ErrorType | Errors.GlobalErrorType
}

/**
 * Creates a {@link PrivateKey} from a private key.
 *
 * @example
 * ```ts
 * import { Account } from 'viem'
 *
 * const account = Account.fromPrivateKey('0x…')
 * ```
 */
export function fromPrivateKey(privateKey: Hex.Hex): PrivateKey {
  const publicKey = Secp256k1.getPublicKey({ privateKey })
  const address = Address.fromPublicKey(publicKey, { checksum: true })

  function sign({ hash }: { hash: Hex.Hex }): Hex.Hex {
    return Signature.toHex(Secp256k1.sign({ payload: hash, privateKey }))
  }

  return {
    ...from({
      address,
      sign,
      signAuthorization(authorization) {
        const signature = Secp256k1.sign({
          payload: Authorization.getSignPayload(authorization),
          privateKey,
        })
        return Authorization.from(authorization, { signature })
      },
      signMessage({ message }) {
        return sign({
          hash: PersonalMessage.getSignPayload(toPayload(message)),
        })
      },
      signTransaction(transaction) {
        const signature = Secp256k1.sign({
          payload: TxEnvelope.getSignPayload(
            transaction as TxEnvelope.TxEnvelope<false>,
          ),
          privateKey,
        })
        return TxEnvelope.serialize(transaction, { signature })
      },
      signTypedData(typedData) {
        return sign({
          hash: TypedData.getSignPayload(typedData as TypedData.encode.Value),
        })
      },
    }),
    publicKey: PublicKey.toHex(publicKey),
    source: 'privateKey',
  }
}

export declare namespace fromPrivateKey {
  type ErrorType =
    | Secp256k1.getPublicKey.ErrorType
    | Address.fromPublicKey.ErrorType
    | PublicKey.toHex.ErrorType
    | Errors.GlobalErrorType
}

/**
 * Creates an {@link Hd} from an HD key.
 *
 * @example
 * ```ts
 * import { Account } from 'viem'
 * import { HdKey } from 'viem/utils'
 *
 * const account = Account.fromHdKey(HdKey.fromSeed('0x…'))
 * ```
 */
export function fromHdKey(
  hdKey: HdKey.HdKey,
  options: fromHdKey.Options = {},
): Hd {
  const { accountIndex, addressIndex, changeIndex, path } = options
  const derived = hdKey.derive(
    path ??
      HdKey.path({
        account: accountIndex,
        change: changeIndex,
        index: addressIndex,
      }),
  )
  return {
    ...fromPrivateKey(derived.privateKey),
    getHdKey: () => derived,
    source: 'hd',
  }
}

export declare namespace fromHdKey {
  type Options = {
    /** The account index to use in the path (`m/44'/60'/${accountIndex}'/0/0`). */
    accountIndex?: number | undefined
    /** The address index to use in the path (`m/44'/60'/0'/0/${addressIndex}`). */
    addressIndex?: number | undefined
    /** The change index to use in the path (`m/44'/60'/0'/${changeIndex}/0`). */
    changeIndex?: number | undefined
    /** The full HD path (overrides the index options). */
    path?: `m/44'/60'/${string}` | undefined
  }

  type ErrorType = fromPrivateKey.ErrorType | Errors.GlobalErrorType
}

/**
 * Creates an {@link Hd} from a mnemonic phrase.
 *
 * @example
 * ```ts
 * import { Account } from 'viem'
 *
 * const account = Account.fromMnemonic('test test test … junk')
 * ```
 */
export function fromMnemonic(
  mnemonic: string,
  options: fromMnemonic.Options = {},
): Hd {
  const { passphrase, ...rest } = options
  const hdKey = Mnemonic.toHdKey(mnemonic, { passphrase })
  return fromHdKey(hdKey, rest)
}

export declare namespace fromMnemonic {
  type Options = fromHdKey.Options & {
    /** Optional BIP-39 passphrase. */
    passphrase?: string | undefined
  }

  type ErrorType = fromHdKey.ErrorType | Errors.GlobalErrorType
}

/**
 * Creates a random {@link PrivateKey}.
 *
 * @example
 * ```ts
 * import { Account } from 'viem'
 *
 * const account = Account.random()
 * ```
 */
export function random(): PrivateKey {
  return fromPrivateKey(Secp256k1.randomPrivateKey())
}

export declare namespace random {
  type ErrorType =
    | Secp256k1.randomPrivateKey.ErrorType
    | fromPrivateKey.ErrorType
    | Errors.GlobalErrorType
}

/** @internal */
function toPayload(message: SignableMessage): Hex.Hex | Bytes.Bytes {
  if (typeof message === 'string') return Hex.fromString(message)
  return message.raw
}
