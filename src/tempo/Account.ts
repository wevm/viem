import {
  Address,
  Authorization,
  Hash,
  Hex,
  P256,
  PersonalMessage,
  PublicKey,
  Secp256k1,
  Signature,
  TransactionEnvelope as TxEnvelope,
  TypedData,
  WebAuthnP256,
  WebCryptoP256,
} from 'ox'
import type { Bytes } from 'ox'
import {
  Channel,
  KeyAuthorization,
  MultisigConfig,
  SignatureEnvelope,
  TxEnvelopeTempo,
} from 'ox/tempo'

import type * as viem_Account from '../core/Account.js'
import type { OneOf, RequiredBy } from '../core/internal/types.js'
import type * as KeyAuthorizationManager from './KeyAuthorizationManager.js'

/** Base shape shared by Tempo accounts. */
export type Base<source extends string = string> = RequiredBy<
  viem_Account.Local<SignatureEnvelope.Type>,
  'publicKey' | 'signAuthorization'
> & {
  /**
   * Signs a hash.
   *
   * Access key accounts sign through a keychain envelope by default (so the
   * signature authorizes the parent account). Set `raw` to `true` to sign
   * directly with the key, without keychain hashing or enveloping.
   */
  sign: (parameters: {
    /** Hash to sign. */
    hash: Hex.Hex
    /** Sign directly with the key, without keychain hashing or enveloping. */
    raw?: boolean | undefined
  }) => Promise<Hex.Hex>
  /** Signs a payment-channel voucher (TIP-1054). */
  signVoucher: (
    parameters: signVoucher.Parameters,
  ) => Promise<signVoucher.ReturnValue>
  /** Account source. */
  source: source
}

/** A root Tempo account (signs for its own address). */
export type RootAccount = Base<'root'> & {
  /** Signs a key authorization for an access key (TIP-1044). */
  signKeyAuthorization: (
    key: resolveAccessKey.Parameters,
    parameters: Omit<signKeyAuthorization.Parameters, 'key'>,
  ) => Promise<KeyAuthorization.Signed>
}

/** An access key Tempo account (signs on behalf of a parent account). */
export type AccessKeyAccount = Base<'accessKey'> & {
  /** Access key address. */
  accessKeyAddress: Address.Address
  /** Pending key authorization manager. */
  keyAuthorizationManager?:
    | KeyAuthorizationManager.KeyAuthorizationManager
    | undefined
}

/** A Tempo account. */
export type Account = OneOf<RootAccount | AccessKeyAccount | MultisigAccount>

/** A synthetic account for a native multisig (TIP-1061) config. */
export type MultisigAccount = viem_Account.Local<'multisig'> & {
  /** Multisig config (from `MultisigConfig.from`). */
  config: MultisigConfig.Config
  /** Account source. */
  source: 'multisig'
}

/**
 * Instantiates an Account from a sign function and public key.
 *
 * Pass `access` to instantiate an access key account that signs on behalf of
 * the parent account through a keychain envelope.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.from({
 *   keyType: 'secp256k1',
 *   publicKey,
 *   async sign({ hash }) { … },
 * })
 * ```
 */
export function from<const parameters extends from.Parameters>(
  parameters: parameters | from.Parameters,
): from.ReturnValue<parameters> {
  const { access } = parameters
  if (access) return fromAccessKey(parameters as never) as never
  return fromRoot(parameters) as never
}

export declare namespace from {
  type Parameters = OneOf<fromRoot.Parameters | fromAccessKey.Parameters>

  type ReturnValue<
    parameters extends {
      access?: fromAccessKey.Parameters['access'] | undefined
    } = {
      access?: fromAccessKey.Parameters['access'] | undefined
    },
  > = parameters extends {
    access: fromAccessKey.Parameters['access']
  }
    ? AccessKeyAccount
    : RootAccount
}

/**
 * Instantiates an Account from a headless WebAuthn credential (P256 private key).
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromHeadlessWebAuthn('0x…', {
 *   rpId: 'example.com',
 *   origin: 'https://example.com',
 * })
 * ```
 *
 * @param privateKey P256 private key.
 * @returns Account.
 */
export function fromHeadlessWebAuthn<
  const options extends fromHeadlessWebAuthn.Options,
>(
  privateKey: Hex.Hex,
  options: options | fromHeadlessWebAuthn.Options,
): fromHeadlessWebAuthn.ReturnValue<options> {
  const { access, keyAuthorizationManager, rpId, origin } = options

  const publicKey = P256.getPublicKey({ privateKey })

  return from({
    ...(access ? { access, keyAuthorizationManager } : {}),
    keyType: 'webAuthn',
    publicKey,
    async sign({ hash }) {
      const { metadata, payload } = WebAuthnP256.getSignPayload({
        ...options,
        challenge: hash,
        rpId,
        origin,
      })
      const signature = P256.sign({
        payload,
        privateKey,
        hash: true,
      })
      return SignatureEnvelope.serialize({
        metadata,
        signature,
        publicKey,
        type: 'webAuthn',
      })
    },
  }) as never
}

export declare namespace fromHeadlessWebAuthn {
  type Options = Omit<
    WebAuthnP256.getSignPayload.Options,
    'challenge' | 'rpId' | 'origin'
  > &
    Pick<from.Parameters, 'access' | 'keyAuthorizationManager'> & {
      /** Relying Party ID. */
      rpId: string
      /** Origin. */
      origin: string
    }

  type ReturnValue<options extends Options = Options> =
    from.ReturnValue<options>
}

/**
 * Instantiates an Account from a P256 private key.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromP256('0x…')
 * ```
 *
 * @param privateKey P256 private key.
 * @returns Account.
 */
export function fromP256<const options extends fromP256.Options>(
  privateKey: Hex.Hex,
  options: options | fromP256.Options = {},
): fromP256.ReturnValue<options> {
  const { access, keyAuthorizationManager } = options
  const publicKey = P256.getPublicKey({ privateKey })

  return from({
    ...(access ? { access, keyAuthorizationManager } : {}),
    keyType: 'p256',
    publicKey,
    async sign({ hash }) {
      const signature = P256.sign({ payload: hash, privateKey })
      return SignatureEnvelope.serialize({
        signature,
        publicKey,
        type: 'p256',
      })
    },
  }) as never
}

export declare namespace fromP256 {
  type Options = Pick<from.Parameters, 'access' | 'keyAuthorizationManager'>

  type ReturnValue<options extends Options = Options> =
    from.ReturnValue<options>
}

/**
 * Instantiates an Account from a Secp256k1 private key.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromSecp256k1('0x…')
 * ```
 *
 * @param privateKey Secp256k1 private key.
 * @returns Account.
 */
export function fromSecp256k1<const options extends fromSecp256k1.Options>(
  privateKey: Hex.Hex,
  options: options | fromSecp256k1.Options = {},
): fromSecp256k1.ReturnValue<options> {
  const { access, keyAuthorizationManager } = options
  const publicKey = Secp256k1.getPublicKey({ privateKey })

  return from({
    ...(access ? { access, keyAuthorizationManager } : {}),
    keyType: 'secp256k1',
    publicKey,
    async sign(parameters) {
      const { hash } = parameters
      const signature = Secp256k1.sign({ payload: hash, privateKey })
      return Signature.toHex(signature)
    },
  }) as never
}

export declare namespace fromSecp256k1 {
  type Options = Pick<from.Parameters, 'access' | 'keyAuthorizationManager'>

  type ReturnValue<options extends Options = Options> =
    from.ReturnValue<options>
}

/**
 * Instantiates a synthetic Account for a native multisig (TIP-1061) config.
 *
 * The returned account does not hold a key. It is used purely to drive the
 * standard transaction flow: it derives the multisig address from the config
 * and passes the prepared envelope (carrying the collected owner
 * `signatures`) through to the chain serializer, which combines the approvals
 * into the multisig signature envelope.
 *
 * Owner approvals are produced separately by signing with `multisig` request
 * metadata (see `signTransaction`), and provided via `signatures`.
 *
 * Accepts a raw config and normalizes it internally (via
 * `MultisigConfig.from`), so callers don't need to call `MultisigConfig.from`
 * themselves.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromMultisig({
 *   threshold: 2,
 *   owners: [
 *     { owner: owner_1.address, weight: 1 },
 *     { owner: owner_2.address, weight: 1 },
 *   ],
 * })
 * ```
 *
 * @param config Multisig config (raw or from `MultisigConfig.from`).
 * @returns Multisig account.
 */
export function fromMultisig(config: MultisigConfig.Config): MultisigAccount {
  const normalized = MultisigConfig.from(config)
  const address = Address.checksum(MultisigConfig.getAddress(normalized))
  return {
    address,
    config: normalized,
    keyType: 'multisig',
    publicKey: '0x',
    source: 'multisig',
    type: 'local',
    async sign() {
      throw new Error('`sign` is not supported for multisig accounts.')
    },
    async signMessage() {
      throw new Error('`signMessage` is not supported for multisig accounts.')
    },
    async signTransaction(envelope, options) {
      const serialize = options?.chain?.transaction?.serialize as
        | ((envelope: unknown) => Hex.Hex | undefined)
        | undefined
      return (
        serialize?.(envelope) ??
        TxEnvelopeTempo.serialize(
          envelope as unknown as TxEnvelopeTempo.TxEnvelopeTempo,
        )
      )
    },
    async signTypedData() {
      throw new Error('`signTypedData` is not supported for multisig accounts.')
    },
  }
}

/**
 * Instantiates an Account from a WebAuthn credential.
 *
 * @example
 * ```ts
 * import { Account, WebAuthnP256 } from 'viem/tempo'
 *
 * const credential = await WebAuthnP256.createCredential({ label: 'Example' })
 * const account = Account.fromWebAuthnP256(credential)
 * ```
 *
 * @param credential WebAuthnP256 credential.
 * @returns Account.
 */
export function fromWebAuthnP256(
  credential: fromWebAuthnP256.Credential,
  options: fromWebAuthnP256.Options = {},
): fromWebAuthnP256.ReturnValue {
  const { id } = credential
  const publicKey = PublicKey.fromHex(credential.publicKey)
  return from({
    keyType: 'webAuthn',
    publicKey,
    async sign({ hash }) {
      const { metadata, signature } = await WebAuthnP256.sign({
        ...options,
        challenge: hash,
        credentialId: id,
      })
      return SignatureEnvelope.serialize({
        publicKey,
        metadata,
        signature,
        type: 'webAuthn',
      })
    },
  })
}

export declare namespace fromWebAuthnP256 {
  type Credential = {
    id: WebAuthnP256.P256Credential['id']
    publicKey: Hex.Hex
  }

  type Options = {
    /** Credential request function. */
    getFn?: WebAuthnP256.sign.Options['getFn'] | undefined
    /** Relying Party ID. */
    rpId?: WebAuthnP256.sign.Options['rpId'] | undefined
  }

  type ReturnValue = from.ReturnValue
}

/**
 * Instantiates an Account from a WebCrypto P256 key pair.
 *
 * @example
 * ```ts
 * import { Account, WebCryptoP256 } from 'viem/tempo'
 *
 * const keyPair = await WebCryptoP256.createKeyPair()
 * const account = Account.fromWebCryptoP256(keyPair)
 * ```
 *
 * @param keyPair WebCryptoP256 key pair.
 * @returns Account.
 */
export function fromWebCryptoP256<
  const options extends fromWebCryptoP256.Options,
>(
  keyPair: Awaited<ReturnType<typeof WebCryptoP256.createKeyPair>>,
  options: options | fromWebCryptoP256.Options = {},
): fromWebCryptoP256.ReturnValue<options> {
  const { access, keyAuthorizationManager } = options
  const { publicKey, privateKey } = keyPair

  return from({
    ...(access ? { access, keyAuthorizationManager } : {}),
    keyType: 'p256',
    publicKey,
    async sign({ hash }) {
      const signature = await WebCryptoP256.sign({ payload: hash, privateKey })
      return SignatureEnvelope.serialize({
        signature,
        prehash: true,
        publicKey,
        type: 'p256',
      })
    },
  }) as never
}

export declare namespace fromWebCryptoP256 {
  type Options = Pick<from.Parameters, 'access' | 'keyAuthorizationManager'>

  type ReturnValue<options extends Options = Options> =
    from.ReturnValue<options>
}

/**
 * Signs a payment-channel voucher (TIP-1054).
 *
 * Access key accounts sign the voucher payload directly (without keychain
 * enveloping).
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const signature = await Account.signVoucher(account, {
 *   chainId: 1337,
 *   channel: channelId,
 *   cumulativeAmount: 100n,
 * })
 * ```
 */
export async function signVoucher(
  account: viem_Account.Local,
  parameters: signVoucher.Parameters,
): Promise<signVoucher.ReturnValue> {
  const hash = getVoucherSignPayload(parameters)
  if (isAccessKeyAccount(account)) return account.sign({ hash, raw: true })
  return await account.sign({ hash })
}

function getVoucherSignPayload(parameters: signVoucher.Parameters) {
  const { chainId, channel, cumulativeAmount } = parameters
  const channelId =
    typeof channel === 'string'
      ? channel
      : Channel.computeId(channel, {
          chainId,
        })

  return Channel.getVoucherSignPayload({
    chainId,
    channelId,
    cumulativeAmount,
  })
}

export declare namespace signVoucher {
  type Parameters = {
    /** Chain ID. */
    chainId: number | bigint
    /** Channel descriptor or ID. */
    channel: Channel.computeId.Channel | Hex.Hex
    /** Total voucher amount signed for the channel. */
    cumulativeAmount: bigint
  }

  type ReturnValue = Hex.Hex
}

function isAccessKeyAccount(
  account: viem_Account.Local,
): account is AccessKeyAccount {
  return (
    (account as AccessKeyAccount).source === 'accessKey' &&
    'accessKeyAddress' in account
  )
}

/**
 * Signs a key authorization for an access key (TIP-1044).
 *
 * When the signer is an admin access key, the authorization is signed
 * directly by that key and bound to the parent account it acts on behalf of,
 * so the signed payload cannot be replayed against another account (TIP-1049).
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const keyAuthorization = await Account.signKeyAuthorization(account, {
 *   chainId: 1337,
 *   key: accessKey,
 * })
 * ```
 */
export async function signKeyAuthorization(
  account: viem_Account.Local,
  parameters: signKeyAuthorization.Parameters,
): Promise<signKeyAuthorization.ReturnValue> {
  const { chainId, key, expiry, limits, scopes, witness, admin } = parameters
  const { accessKeyAddress, keyType: type } = resolveAccessKey(key)

  // When the signer is an admin access key, the authorization must be
  // signed directly by that key and bound to the parent account it acts
  // on behalf of, so the signed payload cannot be replayed against another
  // account. [TIP-1049]
  const isAccessKey = isAccessKeyAccount(account)
  const boundFields = isAccessKey ? { account: account.address } : {}

  // Admin key authorizations are unrestricted and must not carry expiry,
  // limits, or call scopes (the protocol rejects them). [TIP-1049]
  const restrictions = admin ? {} : { expiry, limits, scopes }

  const hash = KeyAuthorization.getSignPayload({
    address: accessKeyAddress,
    chainId,
    type,
    witness,
    ...(admin ? { isAdmin: true } : {}),
    ...boundFields,
    ...restrictions,
  } as never)
  const signature = isAccessKey
    ? await account.sign({ hash, raw: true })
    : await account.sign({ hash })
  return KeyAuthorization.from({
    address: accessKeyAddress,
    chainId,
    signature: SignatureEnvelope.from(signature),
    type,
    ...(witness ? { witness } : {}),
    ...(admin ? { isAdmin: true } : {}),
    ...boundFields,
    ...restrictions,
  } as never)
}

export declare namespace signKeyAuthorization {
  type Parameters = Pick<
    KeyAuthorization.KeyAuthorization,
    'expiry' | 'limits' | 'scopes' | 'witness'
  > & {
    /** Chain ID for replay protection. */
    chainId: number | bigint
    /** Access key to authorize. */
    key: resolveAccessKey.Parameters
    /**
     * Whether to authorize the key as an admin key. Admin keys are
     * unrestricted and can manage the account's other access keys; `expiry`,
     * `limits`, and `scopes` are ignored. Requires the T6 hardfork.
     *
     * [TIP-1049](https://tips.sh/1049)
     */
    admin?: boolean | undefined
  }

  type ReturnValue = KeyAuthorization.Signed
}

/** Resolves an access key input into its address and key type. @internal */
export function resolveAccessKey(
  accessKey: resolveAccessKey.Parameters,
): resolveAccessKey.ReturnType {
  if ('accessKeyAddress' in accessKey)
    return {
      accessKeyAddress: accessKey.accessKeyAddress,
      keyType: accessKey.keyType,
    }
  if ('publicKey' in accessKey && accessKey.publicKey)
    return {
      accessKeyAddress: Address.checksum(
        Address.fromPublicKey(PublicKey.fromHex(accessKey.publicKey)),
      ),
      keyType: accessKey.type,
    }
  return {
    accessKeyAddress: accessKey.address,
    keyType: accessKey.type,
  }
}

export declare namespace resolveAccessKey {
  type Parameters =
    | Pick<AccessKeyAccount, 'accessKeyAddress' | 'keyType'>
    | OneOf<
        | {
            /** Access key address. */
            address: Address.Address
            /** Key type. */
            type: SignatureEnvelope.Type
          }
        | {
            /** Access key public key. */
            publicKey: Hex.Hex
            /** Key type. */
            type: SignatureEnvelope.Type
          }
      >

  type ReturnType = {
    accessKeyAddress: Address.Address
    keyType: SignatureEnvelope.Type
  }
}

function fromBase(parameters: fromBase.Parameters): Base {
  const { keyType = 'secp256k1', parentAddress } = parameters

  const address = Address.checksum(
    parentAddress ?? Address.fromPublicKey(parameters.publicKey),
  )
  const publicKey = PublicKey.toHex(parameters.publicKey, {
    includePrefix: false,
  })

  async function sign(options: {
    hash: Hex.Hex
    raw?: boolean | undefined
  }): Promise<Hex.Hex> {
    const { hash, raw } = options
    if (raw) return await parameters.sign({ hash })
    if (!parentAddress) return await parameters.sign({ hash })
    // Keychain (v2) inner hash: binds the signature to the parent account.
    const innerHash = Hash.keccak256(Hex.concat('0x04', hash, parentAddress))
    const signature = await parameters.sign({ hash: innerHash })
    return SignatureEnvelope.serialize(
      SignatureEnvelope.from({
        inner: SignatureEnvelope.from(signature),
        type: 'keychain',
        userAddress: parentAddress,
        version: 'v2',
      }),
    )
  }

  return {
    address,
    keyType,
    sign,
    async signAuthorization(authorization) {
      const signature = await sign({
        hash: Authorization.getSignPayload(authorization),
      })
      const envelope = SignatureEnvelope.from(signature)
      if (envelope.type !== 'secp256k1')
        throw new Error(
          'Unsupported signature type. Expected `secp256k1` but got `' +
            envelope.type +
            '`.',
        )
      return Authorization.from(authorization, {
        signature: envelope.signature,
      })
    },
    async signMessage({ message }) {
      return await sign({
        hash: PersonalMessage.getSignPayload(toPayload(message)),
      })
    },
    async signTransaction(envelope_, options) {
      const chain = options?.chain
      // The envelope originates from the tempo chain's `toEnvelope` (or is a
      // Tempo envelope directly); `feePayer` and `multisig` ride it as
      // request metadata.
      const envelope =
        envelope_ as unknown as TxEnvelopeTempo.TxEnvelopeTempo & {
          feePayer?: viem_Account.Account | boolean | undefined
          multisig?: MultisigConfig.Config | undefined
        }

      // Non-tempo envelopes take the generic path (secp256k1 signatures
      // only; other key types cannot produce valid signatures for them).
      if (envelope.type && envelope.type !== 'tempo') {
        const signature = SignatureEnvelope.from(
          await sign({
            hash: TxEnvelope.getSignPayload(
              envelope_ as TxEnvelope.TxEnvelope<false>,
            ),
          }),
        )
        if (signature.type !== 'secp256k1')
          throw new Error(
            'Unsupported signature type. Expected `secp256k1` but got `' +
              signature.type +
              '`.',
          )
        return TxEnvelope.serialize(envelope_, {
          signature: signature.signature,
        })
      }

      const getSignPayload = chain?.transaction?.getSignPayload as
        | ((envelope: unknown) => Hex.Hex | undefined)
        | undefined
      const payload =
        getSignPayload?.(envelope) ?? TxEnvelopeTempo.getSignPayload(envelope)

      // Native multisig (TIP-1061): return this owner's approval — a
      // primitive signature over the multisig owner approval digest — instead
      // of a full serialized transaction. Approvals are combined later via
      // `signatures`.
      if (envelope.multisig) {
        const digest = MultisigConfig.getSignPayload({
          payload,
          genesisConfig: envelope.multisig,
        })
        return await sign({ hash: digest, raw: true })
      }

      const signature = await sign({ hash: payload })

      if (typeof envelope.feePayer === 'object') {
        const feePayer = envelope.feePayer
        if (!feePayer.sign)
          throw new Error('`feePayer` account does not implement `sign`.')

        const tx = TxEnvelopeTempo.from(envelope, {
          signature: SignatureEnvelope.from(signature),
        })
        const sender =
          envelope.from ??
          SignatureEnvelope.extractAddress({
            payload: TxEnvelopeTempo.getSignPayload(tx),
            root: true,
            signature: tx.signature,
          })
        const feePayerSignature = await feePayer.sign({
          hash: TxEnvelopeTempo.getFeePayerSignPayload(tx, { sender }),
        })
        return TxEnvelopeTempo.serialize(tx, {
          feePayerSignature: Signature.from(feePayerSignature),
        })
      }

      const serialize = chain?.transaction?.serialize as
        | ((envelope: unknown, options?: unknown) => Hex.Hex | undefined)
        | undefined
      const signatureEnvelope = SignatureEnvelope.from(signature)
      return (
        serialize?.(envelope, { signature: signatureEnvelope }) ??
        TxEnvelopeTempo.serialize(envelope, { signature: signatureEnvelope })
      )
    },
    async signTypedData(typedData) {
      return await sign({
        hash: TypedData.getSignPayload(typedData as TypedData.encode.Value),
      })
    },
    async signVoucher(parameters) {
      const hash = getVoucherSignPayload(parameters)
      if (parentAddress) return await sign({ hash, raw: true })
      return await sign({ hash })
    },
    publicKey,
    source: 'root',
    type: 'local',
  }
}

declare namespace fromBase {
  type Parameters = {
    /** Parent address (access key accounts). */
    parentAddress?: Address.Address | undefined
    /** Public key. */
    publicKey: PublicKey.PublicKey
    /** Key type. */
    keyType?: SignatureEnvelope.Type | undefined
    /** Pending key authorization manager. */
    keyAuthorizationManager?:
      | KeyAuthorizationManager.KeyAuthorizationManager
      | undefined
    /** Sign function. */
    sign: (parameters: { hash: Hex.Hex }) => Hex.Hex | Promise<Hex.Hex>
  }

  type ReturnValue = Base
}

function fromRoot(parameters: fromRoot.Parameters): RootAccount {
  const account = fromBase(parameters)
  return {
    ...account,
    source: 'root',
    async signKeyAuthorization(key, parameters) {
      const { chainId, expiry, limits, scopes, witness, admin } = parameters
      const { accessKeyAddress, keyType: type } = resolveAccessKey(key)

      // Admin key authorizations are unrestricted and must not carry expiry,
      // limits, or call scopes (the protocol rejects them). [TIP-1049]
      const restrictions = admin ? {} : { expiry, limits, scopes }

      const signature = await account.sign({
        hash: KeyAuthorization.getSignPayload({
          address: accessKeyAddress,
          chainId,
          type,
          witness,
          ...(admin ? { isAdmin: true } : {}),
          ...restrictions,
        } as never),
      })
      return KeyAuthorization.from({
        address: accessKeyAddress,
        chainId,
        signature: SignatureEnvelope.from(signature),
        type,
        ...(witness ? { witness } : {}),
        ...(admin ? { isAdmin: true } : {}),
        ...restrictions,
      } as never)
    },
  }
}

declare namespace fromRoot {
  type Parameters = fromBase.Parameters

  type ReturnValue = RootAccount
}

function fromAccessKey(parameters: fromAccessKey.Parameters): AccessKeyAccount {
  const { access, keyAuthorizationManager } = parameters
  const parentAddress = typeof access === 'string' ? access : access.address
  const account = fromBase({ ...parameters, parentAddress })
  return {
    ...account,
    accessKeyAddress: Address.checksum(
      Address.fromPublicKey(parameters.publicKey),
    ),
    keyAuthorizationManager,
    source: 'accessKey',
  }
}

declare namespace fromAccessKey {
  type Parameters = fromBase.Parameters & {
    /**
     * Parent account to access.
     * If defined, this account will act as an "access key", and use
     * the parent account's address as the keychain address.
     */
    access: viem_Account.Account | Address.Address
    /** Pending key authorization manager. */
    keyAuthorizationManager?:
      | KeyAuthorizationManager.KeyAuthorizationManager
      | undefined
  }

  type ReturnValue = AccessKeyAccount
}

function toPayload(
  message: viem_Account.SignableMessage,
): Hex.Hex | Bytes.Bytes {
  if (typeof message === 'string') return Hex.fromString(message)
  return message.raw
}
