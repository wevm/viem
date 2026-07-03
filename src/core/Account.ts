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
import type * as Chain from './Chain.js'
import { BaseError } from './Errors.js'
import type * as NonceManager from './NonceManager.js'
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
  keyType extends string = string,
  address extends Address.Address = Address.Address,
> = {
  /** Address of the account. */
  address: address
  /** Key type used for signing (e.g. `'secp256k1'`, or `'custom'` for injected signers). */
  keyType: keyType
  /** Nonce manager used to derive the transaction nonce. */
  nonceManager?: NonceManager.NonceManager | undefined
  /** Public key of the account. */
  publicKey?: Hex.Hex | undefined
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
    options?: Local.SignTransactionOptions | undefined,
  ) => Hex.Hex | Promise<Hex.Hex>
  /** Signs [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed data. */
  signTypedData: <
    const typedData extends TypedData.TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  >(
    typedData: TypedData.encode.Value<typedData, primaryType>,
  ) => Hex.Hex | Promise<Hex.Hex>
  /** Account type. */
  type: 'local'
}

export declare namespace Local {
  /** Options for {@link Local.signTransaction}. */
  type SignTransactionOptions = {
    /**
     * Chain the transaction targets. When provided, its
     * {@link Chain.Chain.Transaction} hooks override the default sign-payload
     * derivation and serialization.
     */
    chain?: Chain.Chain | undefined
  }
}

/** A private-key-backed local account. */
export type PrivateKey = Local<'secp256k1'> & {
  publicKey: Hex.Hex
}

/** A mnemonic/HD-derived local account. */
export type Hd = Local<'secp256k1'> & {
  publicKey: Hex.Hex
  /** Returns the underlying HD key. */
  getHdKey: () => HdKey.HdKey
}

/** Message accepted by signing helpers: a UTF-8 string, or a raw payload signed as-is. */
export type SignableMessage = string | { raw: Hex.Hex | Bytes.Bytes }

/**
 * Creates an {@link Account} from an address (json-rpc) or custom signing logic (local).
 *
 * Local accounts require a `sign` primitive plus either an `address` or a
 * `publicKey` (the `address` is derived from `publicKey` when omitted); the
 * `signMessage`, `signTransaction`, `signTypedData`, and `signAuthorization`
 * methods are derived from `sign` when omitted.
 *
 * @example
 * ```ts
 * import { Account } from 'viem'
 *
 * const jsonRpc = Account.from('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
 * const local = Account.from({
 *   address: '0x…',
 *   async sign({ hash }) { return await kms.sign(hash) },
 * })
 * ```
 */
export function from<const account extends Address.Address | from.Account>(
  account: account,
): from.ReturnType<account> {
  if (typeof account === 'string') {
    Address.assert(account, { strict: false })
    return { address: account, type: 'json-rpc' } as never
  }

  const { publicKey, sign } = account
  const address =
    account.address ??
    Address.fromPublicKey(PublicKey.fromHex(publicKey!), { checksum: true })
  Address.assert(address, { strict: false })

  return {
    ...({
      signAuthorization(authorization) {
        return withSignature(
          sign({ hash: Authorization.getSignPayload(authorization) }),
          (signature) => Authorization.from(authorization, { signature }),
        )
      },
      signMessage({ message }) {
        return sign({
          hash: PersonalMessage.getSignPayload(toPayload(message)),
        })
      },
      signTransaction(transaction, options) {
        const chain = options?.chain
        // Chain hooks take their own (opaque) envelope type; the envelope
        // originates from the same chain's `toEnvelope`.
        const payload = chain?.transaction?.getSignPayload
          ? chain.transaction.getSignPayload(transaction as never)
          : TxEnvelope.getSignPayload(
              transaction as TxEnvelope.TxEnvelope<false>,
            )
        return withSignature(sign({ hash: payload }), (signature) =>
          chain?.transaction?.serialize
            ? chain.transaction.serialize(transaction as never, { signature })
            : TxEnvelope.serialize(transaction, { signature }),
        )
      },
      signTypedData(typedData) {
        return sign({
          hash: TypedData.getSignPayload(typedData as TypedData.encode.Value),
        })
      },
    } satisfies Pick<
      Local,
      'signAuthorization' | 'signMessage' | 'signTransaction' | 'signTypedData'
    >),
    keyType: 'custom',
    type: 'local',
    ...account,
    address,
  } as never
}

export declare namespace from {
  /**
   * Account definition passed to {@link from} to create a {@link Local} account.
   * A `sign` primitive plus either an `address` or a `publicKey` is required
   * (the `address` is derived from `publicKey` when omitted); `signMessage`,
   * `signTransaction`, `signTypedData`, and `signAuthorization` are derived from
   * `sign` when omitted (or overridden when provided). `keyType` defaults to
   * `'custom'`.
   */
  type Account = {
    keyType?: string | undefined
    nonceManager?: NonceManager.NonceManager | undefined
    sign: Local['sign']
    signAuthorization?: Local['signAuthorization']
    signMessage?: Local['signMessage'] | undefined
    signTransaction?: Local['signTransaction'] | undefined
    signTypedData?: Local['signTypedData'] | undefined
  } & OneOf<{ address: Address.Address } | { publicKey: Hex.Hex }>

  type ReturnType<account extends Address.Address | Account> =
    | (account extends Address.Address ? JsonRpc : never)
    | (account extends Account
        ? Local<
            account extends { keyType: infer keyType extends string }
              ? keyType
              : 'custom'
          > &
            // Carry through a supplied `publicKey` (as a required property).
            (account extends { publicKey: infer publicKey extends Hex.Hex }
              ? { publicKey: publicKey }
              : unknown)
        : never)

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
  const publicKey = PublicKey.toHex(Secp256k1.getPublicKey({ privateKey }))
  function sign({ hash }: { hash: Hex.Hex }): Hex.Hex {
    return Signature.toHex(Secp256k1.sign({ payload: hash, privateKey }))
  }
  return from({ keyType: 'secp256k1', publicKey, sign })
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

/**
 * Finalizes a (possibly async) signature hex into a derived value (e.g. a
 * serialized transaction or signed authorization).
 *
 * @internal
 */
function withSignature<type>(
  signature: Hex.Hex | Promise<Hex.Hex>,
  fn: (signature: Signature.Signature) => type,
): type | Promise<type> {
  if (signature instanceof Promise)
    return signature.then((value) => fn(Signature.fromHex(value)))
  return fn(Signature.fromHex(signature))
}

/** Thrown when an Action requires an Account but none was provided. */
export class NotFoundError extends BaseError {
  override readonly name = 'Account.NotFoundError'

  constructor() {
    super('Could not find an Account to execute with this Action.', {
      metaMessages: [
        'Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the Client.',
      ],
    })
  }
}
