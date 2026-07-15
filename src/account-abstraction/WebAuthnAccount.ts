import {
  Hex,
  PersonalMessage,
  PublicKey,
  Signature,
  TypedData,
  WebAuthnP256,
} from 'ox'
import type { Errors } from 'ox'

import type * as viem_Account from '../core/Account.js'

/** Result returned by a {@link Account} signing method. */
export type SignReturnType = {
  /** Raw WebAuthn credential response. */
  raw: WebAuthnP256.sign.ReturnType['raw']
  /** P256 signature encoded as compact hex. */
  signature: Hex.Hex
  /** WebAuthn authentication metadata. */
  webauthn: WebAuthnP256.SignMetadata
}

/** An owner account backed by a WebAuthn P256 credential. */
export type Account<id extends string = string> = {
  /** WebAuthn credential identifier. */
  id: id
  /** Uncompressed P256 public key without its SEC1 prefix. */
  publicKey: Hex.Hex
  /** Signs a hash with the WebAuthn credential. */
  sign: (options: {
    /** Hash to sign. */
    hash: Hex.Hex
  }) => Promise<SignReturnType>
  /** Signs an EIP-191 personal message with the WebAuthn credential. */
  signMessage: (options: {
    /** Message to sign. */
    message: viem_Account.SignableMessage
  }) => Promise<SignReturnType>
  /** Signs EIP-712 typed data with the WebAuthn credential. */
  signTypedData: <
    const typedData extends TypedData.TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  >(
    typedData: TypedData.encode.Value<typedData, primaryType>,
  ) => Promise<SignReturnType>
  /** Account type. */
  type: 'webAuthn'
}

/**
 * Creates an owner {@link Account} from a WebAuthn P256 credential.
 *
 * @example
 * ```ts
 * import { WebAuthnP256 } from 'viem/utils'
 * import { WebAuthnAccount } from 'viem/account-abstraction'
 *
 * const credential = await WebAuthnP256.createCredential({ name: 'Example' })
 * const account = WebAuthnAccount.fromCredential(credential)
 * ```
 *
 * @param credential WebAuthn P256 credential or its persisted identity.
 * @param options Credential request options.
 * @returns A WebAuthn owner account.
 */
export function fromCredential<
  const credential extends fromCredential.Credential,
>(
  credential: credential,
  options: fromCredential.Options = {},
): fromCredential.ReturnType<credential> {
  const { id } = credential
  const key = PublicKey.from(credential.publicKey)
  PublicKey.assert(key, { compressed: false })
  const publicKey = PublicKey.toHex(key, {
    includePrefix: false,
  })

  async function sign({ hash }: { hash: Hex.Hex }) {
    const {
      metadata: webauthn,
      raw,
      signature,
    } = await WebAuthnP256.sign({
      ...options,
      challenge: hash,
      credentialId: id,
    })
    return {
      raw,
      signature: Signature.toHex(signature),
      webauthn,
    }
  }

  return {
    id,
    publicKey,
    sign,
    signMessage({ message }) {
      const payload =
        typeof message === 'string' ? Hex.fromString(message) : message.raw
      return sign({ hash: PersonalMessage.getSignPayload(payload) })
    },
    signTypedData(typedData) {
      return sign({
        hash: TypedData.getSignPayload(typedData as TypedData.encode.Value),
      })
    },
    type: 'webAuthn',
  }
}

export declare namespace fromCredential {
  /** WebAuthn credential fields required by {@link fromCredential}. */
  type Credential = {
    /** WebAuthn credential identifier. */
    id: WebAuthnP256.P256Credential['id']
    /** Structured or serialized P256 public key. */
    publicKey: WebAuthnP256.P256Credential['publicKey'] | Hex.Hex
  }

  /** Credential request options for {@link fromCredential}. */
  type Options = {
    /**
     * Credential request function. Useful in environments without a native
     * WebAuthn API, including React Native and test environments.
     *
     * @default window.navigator.credentials.get
     */
    getFn?: WebAuthnP256.sign.Options['getFn'] | undefined
    /** Relying Party ID. */
    rpId?: WebAuthnP256.sign.Options['rpId'] | undefined
  }

  /** WebAuthn owner account returned by {@link fromCredential}. */
  type ReturnType<credential extends Credential = Credential> = Account<
    credential['id']
  >

  /** Errors thrown while creating a WebAuthn owner account. */
  type ErrorType =
    | PublicKey.from.ErrorType
    | PublicKey.toHex.ErrorType
    | Errors.GlobalErrorType
}
