import * as Address from 'ox/Address'
import type * as Bytes from 'ox/Bytes'
import type * as Hex from 'ox/Hex'
import * as P256_ from 'ox/P256'
import type * as PublicKey from 'ox/PublicKey'
import * as Secp256k1_ from 'ox/Secp256k1'
import type * as Signature from 'ox/Signature'
import * as WebAuthnP256_ from 'ox/WebAuthnP256'
import * as WebCryptoP256_ from 'ox/WebCryptoP256'
import type { OneOf } from './internal/types.js'

/**
 * A signing curve, reduced to the operations the verification/recovery helpers need.
 *
 * Verification is keyed on the signer's **public key** (`verify`), not on signature recovery:
 * some signature types (e.g. WebCrypto, WebAuthn) carry no recovery bit and cannot be recovered,
 * so `verify` is the only operation every curve can support. Recoverable curves
 * (`Curve.secp256k1`) additionally accept the signer's **address** as an alternative identity.
 *
 * A curve may require extra inputs beyond `{ payload, publicKey, signature }` (e.g. `Curve.webAuthn`
 * additionally needs `metadata`). The verification helpers surface those extra inputs as required
 * options whenever such a curve is passed (see {@link Curve.VerifyOptions}).
 *
 * `verify` may resolve synchronously or asynchronously: SubtleCrypto-backed curves
 * (`Curve.webCrypto`) verify asynchronously, so consumers should be prepared to `await` the
 * result when using an async curve.
 *
 * Injecting a curve (rather than hardcoding one) keeps consumers tree-shakable: a bundle that
 * only uses `Curve.secp256k1` never pulls in `Curve.p256`, and vice versa.
 *
 * @example
 * ```ts
 * import { Curve, PersonalMessage } from 'viem'
 *
 * const valid = PersonalMessage.verify({
 *   curve: Curve.secp256k1(),
 *   message: 'hello world',
 *   address, // or `publicKey`
 *   signature: '0x…',
 * })
 * ```
 */
export type Curve<options extends Curve.verify.Options = Curve.verify.Options> =
  {
    /** Verifies a signature against the signer's public key (or address). */
    verify: (options: options) => boolean | Promise<boolean>
  }

/**
 * A {@link Curve} that additionally supports recovering the signing public key from a
 * payload + signature. Only signatures that carry a recovery bit are recoverable (e.g.
 * secp256k1 / p256), so address-recovery helpers require this variant.
 */
export type Recoverable = Curve & {
  /** Recovers the signing public key from a payload + signature. */
  recoverPublicKey: (
    options: Curve.recoverPublicKey.Options,
  ) => PublicKey.PublicKey
}

/**
 * The options a verification helper forwards to a {@link Curve}'s `verify` (everything but the
 * `payload`, which the helper derives). This is the curve-specific shape the helpers fold into
 * their own options: `{ address | publicKey, signature }` for `Curve.secp256k1`, `{ publicKey,
 * signature }` for `Curve.p256` / `Curve.webCrypto`, and `{ publicKey, signature, metadata,
 * origin?, rpId? }` for `Curve.webAuthn`.
 */
export type VerifyOptions<curve extends Curve<any>> = Omit<
  Parameters<curve['verify']>[0],
  'payload'
>

export declare namespace Curve {
  namespace verify {
    /** Base verify options every curve accepts (identity = public key). */
    type Options = {
      /** Payload that was signed. */
      payload: Hex.Hex | Bytes.Bytes
      /** Public key that signed the payload. */
      publicKey: Hex.Hex | Bytes.Bytes | PublicKey.PublicKey
      /** Signature of the payload (recovery bit not required for verification). */
      signature: Hex.Hex | Bytes.Bytes | Signature.Signature<boolean>
    }
  }

  namespace recoverPublicKey {
    type Options = {
      /** Payload that was signed. */
      payload: Hex.Hex | Bytes.Bytes
      /** Signature of the payload. */
      signature: Hex.Hex | Bytes.Bytes | Signature.Signature
    }
  }
}

/**
 * Builds a {@link Curve} from its primitive operations. Use this to define a custom curve, or
 * to wrap an existing implementation.
 *
 * @example
 * ```ts
 * import { Curve } from 'viem'
 * import * as Secp256k1 from 'ox/Secp256k1'
 *
 * const secp256k1 = Curve.from({
 *   recoverPublicKey: Secp256k1.recoverPublicKey,
 *   verify: Secp256k1.verify,
 * })
 * ```
 */
export function from<const curve extends Curve<any>>(curve: curve): curve {
  return curve
}

/**
 * The secp256k1 curve (Ethereum's default signing curve). Recoverable, so `verify` accepts the
 * signer's `address` **or** `publicKey`.
 */
export function secp256k1() {
  return from({
    recoverPublicKey: Secp256k1_.recoverPublicKey,
    verify: (options: secp256k1.VerifyOptions) =>
      Secp256k1_.verify(options as Secp256k1_.verify.Options),
  })
}

export declare namespace secp256k1 {
  type VerifyOptions = {
    /** Payload that was signed. */
    payload: Hex.Hex | Bytes.Bytes
    /** Signature of the payload (recovery bit not required for verification). */
    signature: Hex.Hex | Bytes.Bytes | Signature.Signature<boolean>
  } & OneOf<
    | {
        /** Address that signed the payload. */
        address: Address.Address
      }
    | {
        /** Public key that signed the payload. */
        publicKey: Hex.Hex | Bytes.Bytes | PublicKey.PublicKey
      }
  >
}

/** The NIST P-256 (secp256r1) curve, used by passkeys / WebAuthn. */
export function p256() {
  return from({
    recoverPublicKey: P256_.recoverPublicKey,
    verify: (options: Curve.verify.Options) => P256_.verify(options),
  })
}

/**
 * The NIST P-256 curve backed by the Web Crypto API (`SubtleCrypto`). Verification is
 * **asynchronous** (returns a `Promise`), and signatures are not recoverable.
 */
export function webCrypto() {
  return from({
    verify: (options: Curve.verify.Options) =>
      WebCryptoP256_.verify(options as WebCryptoP256_.verify.Options),
  })
}

/**
 * The WebAuthn-flavored P-256 curve, used to verify [passkey](https://www.w3.org/TR/webauthn-2/)
 * signatures. In addition to the base options, `verify` requires the authenticator `metadata`
 * produced by the signing ceremony (and optionally validates `origin` / `rpId`). Signatures are
 * not recoverable.
 */
export function webAuthn() {
  return from({
    verify: (options: webAuthn.VerifyOptions) =>
      WebAuthnP256_.verify({
        challenge: options.payload as Hex.Hex,
        publicKey: options.publicKey as PublicKey.PublicKey,
        signature: options.signature as Signature.Signature<false>,
        metadata: options.metadata,
        origin: options.origin,
        rpId: options.rpId,
      }),
  })
}

export declare namespace webAuthn {
  type VerifyOptions = Curve.verify.Options & {
    /** Authenticator metadata produced by the WebAuthn signing ceremony. */
    metadata: WebAuthnP256_.SignMetadata
    /** Expected origin(s). If provided, the `clientDataJSON` origin is validated. */
    origin?: string | string[] | undefined
    /** Expected relying party ID. If provided, the `rpIdHash` is validated. */
    rpId?: string | undefined
  }
}
