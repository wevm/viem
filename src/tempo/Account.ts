import * as Address from 'ox/Address'
import * as Hex from 'ox/Hex'
import * as P256 from 'ox/P256'
import * as PublicKey from 'ox/PublicKey'
import * as Secp256k1 from 'ox/Secp256k1'
import * as Signature from 'ox/Signature'
import { KeyAuthorization, SignatureEnvelope } from 'ox/tempo'
import * as WebAuthnP256 from 'ox/WebAuthnP256'
import * as WebCryptoP256 from 'ox/WebCryptoP256'
import type {
  LocalAccount,
  Account as viem_Account,
} from '../accounts/types.js'
import { parseAccount } from '../accounts/utils/parseAccount.js'
import type { TransactionSerializable } from '../types/transaction.js'
import type { OneOf, RequiredBy } from '../types/utils.js'
import { hashAuthorization } from '../utils/authorization/hashAuthorization.js'
import { keccak256 } from '../utils/hash/keccak256.js'
import { hashMessage } from '../utils/signature/hashMessage.js'
import { hashTypedData } from '../utils/signature/hashTypedData.js'
import type { SerializeTransactionFn } from '../utils/transaction/serializeTransaction.js'
import * as Transaction from './Transaction.js'

export type Account_base<source extends string = string> = RequiredBy<
  LocalAccount<source>,
  'sign' | 'signAuthorization' | 'signTransaction'
> & {
  /** Key type. */
  keyType: SignatureEnvelope.Type
  /** Sign transaction fn. */
  signTransaction: <
    serializer extends
      SerializeTransactionFn<TransactionSerializable> = SerializeTransactionFn<Transaction.TransactionSerializableTempo>,
    transaction extends Parameters<serializer>[0] = Parameters<serializer>[0],
  >(
    transaction: transaction,
    options?:
      | {
          serializer?: serializer | undefined
        }
      | undefined,
  ) => Promise<Hex.Hex>
}

export type RootAccount = Account_base<'root'> & {
  /** Sign key authorization. */
  signKeyAuthorization: (
    key: Pick<AccessKeyAccount, 'accessKeyAddress' | 'keyType'>,
    parameters?: Pick<KeyAuthorization.KeyAuthorization, 'expiry' | 'limits'>,
  ) => Promise<KeyAuthorization.Signed>
}

export type AccessKeyAccount = Account_base<'accessKey'> & {
  /** Access key ID. */
  accessKeyAddress: Address.Address
}

export type Account = OneOf<RootAccount | AccessKeyAccount>

/**
 * Instantiates an Account from a headless WebAuthn credential (P256 private key).
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromHeadlessWebAuthn('0x...')
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
  const { access, rpId, origin } = options

  const publicKey = P256.getPublicKey({ privateKey })

  return from({
    access,
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
  export type Options = Omit<
    WebAuthnP256.getSignPayload.Options,
    'challenge' | 'rpId' | 'origin'
  > &
    Pick<from.Parameters, 'access'> & {
      rpId: string
      origin: string
    }

  export type ReturnValue<options extends Options = Options> =
    from.ReturnValue<options>
}

/**
 * Instantiates an Account from a P256 private key.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromP256('0x...')
 * ```
 *
 * @param privateKey P256 private key.
 * @returns Account.
 */
export function fromP256<const options extends fromP256.Options>(
  privateKey: Hex.Hex,
  options: options | fromP256.Options = {},
): fromP256.ReturnValue<options> {
  const { access } = options
  const publicKey = P256.getPublicKey({ privateKey })

  return from({
    access,
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
  export type Options = Pick<from.Parameters, 'access'>

  export type ReturnValue<options extends Options = Options> =
    from.ReturnValue<options>
}

/**
 * Instantiates an Account from a Secp256k1 private key.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 *
 * const account = Account.fromSecp256k1('0x...')
 * ```
 *
 * @param privateKey Secp256k1 private key.
 * @returns Account.
 */
export function fromSecp256k1<const options extends fromSecp256k1.Options>(
  privateKey: Hex.Hex,
  options: options | fromSecp256k1.Options = {},
): fromSecp256k1.ReturnValue<options> {
  const { access } = options
  const publicKey = Secp256k1.getPublicKey({ privateKey })

  return from({
    access,
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
  export type Options = Pick<from.Parameters, 'access'>

  export type ReturnValue<options extends Options = Options> =
    from.ReturnValue<options>
}

/**
 * Instantiates an Account from a WebAuthn credential.
 *
 * @example
 *
 * ### Create Passkey + Instantiate Account
 *
 * Create a credential with `WebAuthnP256.createCredential` and then instantiate
 * a Viem Account with `Account.fromWebAuthnP256`.
 *
 * It is highly recommended to store the credential's public key in an external store
 * for future use (ie. for future calls to `WebAuthnP256.getCredential`).
 *
 * ```ts
 * import { Account, WebAuthnP256 } from 'viem/tempo'
 * import { publicKeyStore } from './store'
 *
 * // 1. Create credential
 * const credential = await WebAuthnP256.createCredential({ name: 'Example' })
 *
 * // 2. Instantiate account
 * const account = Account.fromWebAuthnP256(credential)
 *
 * // 3. Store public key
 * await publicKeyStore.set(credential.id, credential.publicKey)
 *
 * ```
 *
 * @example
 *
 * ### Get Credential + Instantiate Account
 *
 * Gets a credential from `WebAuthnP256.getCredential` and then instantiates
 * an account with `Account.fromWebAuthnP256`.
 *
 * The `getPublicKey` function is required to fetch the public key paired with the credential
 * from an external store. The public key is required to derive the account's address.
 *
 * ```ts
 * import { Account, WebAuthnP256 } from 'viem/tempo'
 * import { publicKeyStore } from './store'
 *
 * // 1. Get credential
 * const credential = await WebAuthnP256.getCredential({
 *   async getPublicKey(credential) {
 *     // 2. Get public key from external store.
 *     return await publicKeyStore.get(credential.id)
 *   }
 * })
 *
 * // 3. Instantiate account
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
  export type Credential = {
    id: WebAuthnP256.P256Credential['id']
    publicKey: Hex.Hex
  }

  export type Options = {
    getFn?: WebAuthnP256.sign.Options['getFn'] | undefined
    rpId?: WebAuthnP256.sign.Options['rpId'] | undefined
  }

  export type ReturnValue = from.ReturnValue
}

/**
 * Instantiates an Account from a P256 private key.
 *
 * @example
 * ```ts
 * import { Account } from 'viem/tempo'
 * import { WebCryptoP256 } from 'ox'
 *
 * const keyPair = await WebCryptoP256.createKeyPair()
 *
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
  const { access } = options
  const { publicKey, privateKey } = keyPair

  return from({
    access,
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
  export type Options = Pick<from.Parameters, 'access'>

  export type ReturnValue<options extends Options = Options> =
    from.ReturnValue<options>
}

export async function signKeyAuthorization(
  account: LocalAccount,
  parameters: signKeyAuthorization.Parameters,
): Promise<signKeyAuthorization.ReturnValue> {
  const { key, expiry, limits } = parameters
  const { accessKeyAddress, keyType: type } = key

  const signature = await account.sign!({
    hash: KeyAuthorization.getSignPayload({
      address: accessKeyAddress,
      expiry,
      limits,
      type,
    }),
  })
  return KeyAuthorization.from({
    address: accessKeyAddress,
    expiry,
    limits,
    signature: SignatureEnvelope.from(signature),
    type,
  })
}

export declare namespace signKeyAuthorization {
  type Parameters = Pick<
    KeyAuthorization.KeyAuthorization,
    'expiry' | 'limits'
  > & {
    key: Pick<AccessKeyAccount, 'accessKeyAddress' | 'keyType'>
  }

  type ReturnValue = KeyAuthorization.Signed
}

/** @internal */
// biome-ignore lint/correctness/noUnusedVariables: _
function fromBase(parameters: fromBase.Parameters): Account_base {
  const {
    keyType = 'secp256k1',
    parentAddress,
    source = 'privateKey',
  } = parameters

  const address = parentAddress ?? Address.fromPublicKey(parameters.publicKey)
  const publicKey = PublicKey.toHex(parameters.publicKey, {
    includePrefix: false,
  })

  async function sign({ hash }: { hash: Hex.Hex }) {
    const signature = await parameters.sign({ hash })
    if (parentAddress)
      return SignatureEnvelope.serialize(
        SignatureEnvelope.from({
          userAddress: parentAddress,
          inner: SignatureEnvelope.from(signature),
          type: 'keychain',
        }),
      )
    // Don't need to append magic bytes to secp256k1 signatures as they are
    // backwards compatible with existing verification logic.
    if (keyType === 'secp256k1') return signature
    return Hex.concat(signature, SignatureEnvelope.magicBytes)
  }

  return {
    address: Address.checksum(address),
    keyType,
    sign,
    async signAuthorization(parameters) {
      const { chainId, nonce } = parameters
      const address = parameters.contractAddress ?? parameters.address
      const signature = await sign({
        hash: hashAuthorization({ address, chainId, nonce }),
      })
      const envelope = SignatureEnvelope.from(signature)
      if (envelope.type !== 'secp256k1')
        throw new Error(
          'Unsupported signature type. Expected `secp256k1` but got `' +
            envelope.type +
            '`.',
        )
      const { r, s, yParity } = envelope.signature
      return {
        address,
        chainId,
        nonce,
        r: Hex.fromNumber(r, { size: 32 }),
        s: Hex.fromNumber(s, { size: 32 }),
        yParity,
      }
    },
    async signMessage(parameters) {
      const { message } = parameters
      return await sign({ hash: hashMessage(message) })
    },
    async signTransaction(transaction, options) {
      const { serializer = Transaction.serialize } = options ?? {}
      const signature = await sign({
        hash: keccak256(await serializer(transaction)),
      })
      const envelope = SignatureEnvelope.from(signature)
      return await serializer(transaction, envelope as never)
    },
    async signTypedData(typedData) {
      return await sign({ hash: hashTypedData(typedData) })
    },
    publicKey,
    source,
    type: 'local',
  }
}

declare namespace fromBase {
  export type Parameters = {
    /** Parent address. */
    parentAddress?: Address.Address | undefined
    /** Public key. */
    publicKey: PublicKey.PublicKey
    /** Key type. */
    keyType?: SignatureEnvelope.Type | undefined
    /** Sign function. */
    sign: NonNullable<LocalAccount['sign']>
    /** Source. */
    source?: string | undefined
  }

  export type ReturnValue = Account_base
}

/** @internal */
// biome-ignore lint/correctness/noUnusedVariables: _
function fromRoot(parameters: fromRoot.Parameters): RootAccount {
  const account = fromBase(parameters)
  return {
    ...account,
    source: 'root',
    async signKeyAuthorization(key, parameters = {}) {
      const { expiry, limits } = parameters
      const { accessKeyAddress, keyType: type } = key

      const signature = await account.sign({
        hash: KeyAuthorization.getSignPayload({
          address: accessKeyAddress,
          expiry,
          limits,
          type,
        }),
      })
      const keyAuthorization = KeyAuthorization.from({
        address: accessKeyAddress,
        expiry,
        limits,
        signature: SignatureEnvelope.from(signature),
        type,
      })
      return keyAuthorization
    },
  }
}

declare namespace fromRoot {
  export type Parameters = fromBase.Parameters

  export type ReturnValue = RootAccount
}

// biome-ignore lint/correctness/noUnusedVariables: _
function fromAccessKey(parameters: fromAccessKey.Parameters): AccessKeyAccount {
  const { access } = parameters
  const { address: parentAddress } = parseAccount(access)
  const account = fromBase({ ...parameters, parentAddress })
  return {
    ...account,
    accessKeyAddress: Address.fromPublicKey(parameters.publicKey),
    source: 'accessKey',
  }
}

declare namespace fromAccessKey {
  export type Parameters = fromBase.Parameters & {
    /**
     * Parent account to access.
     * If defined, this account will act as an "access key", and use
     * the parent account's address as the keychain address.
     */
    access: viem_Account | Address.Address
  }

  export type ReturnValue = AccessKeyAccount
}

// biome-ignore lint/correctness/noUnusedVariables: _
function from<const parameters extends from.Parameters>(
  parameters: parameters | from.Parameters,
): from.ReturnValue<parameters> {
  const { access } = parameters
  if (access) return fromAccessKey(parameters) as never
  return fromRoot(parameters) as never
}

declare namespace from {
  export type Parameters = OneOf<fromRoot.Parameters | fromAccessKey.Parameters>

  export type ReturnValue<
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

// Export types required for inference.
// biome-ignore lint/performance/noBarrelFile: _
export {
  /** @deprecated */
  KeyAuthorization as z_KeyAuthorization,
  /** @deprecated */
  SignatureEnvelope as z_SignatureEnvelope,
  /** @deprecated */
  TxEnvelopeTempo as z_TxEnvelopeTempo,
} from 'ox/tempo'
