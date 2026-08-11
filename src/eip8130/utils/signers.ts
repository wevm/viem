import type { Address } from 'abitype'
import * as P256 from 'ox/P256'
import { zeroAddress } from '../../constants/address.js'
import type { Hex } from '../../types/misc.js'
import { encodeAbiParameters } from '../../utils/abi/encodeAbiParameters.js'
import { concatHex } from '../../utils/data/concat.js'
import { size } from '../../utils/data/size.js'
import { sliceHex } from '../../utils/data/slice.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import { canonicalAuthenticators } from '../constants.js'
import type { Signer } from './signTransaction.js'

function publicKeyToXY(publicKey: Hex | { x: Hex; y: Hex }): {
  x: Hex
  y: Hex
} {
  if (typeof publicKey !== 'string') return publicKey
  // Accept an uncompressed key with or without the 0x04 prefix.
  const body = size(publicKey) === 65 ? sliceHex(publicKey, 1) : publicKey
  if (size(body) !== 64)
    throw new Error(
      '`publicKey` must be a 64-byte `x || y` hex (optionally 0x04-prefixed) or `{ x, y }`.',
    )
  return { x: sliceHex(body, 0, 32), y: sliceHex(body, 32, 64) }
}

export type ToP256SignerParameters = {
  /** P-256 (secp256r1) private key. */
  privateKey: Hex
  /**
   * Authenticator address that validates this key. Defaults to the canonical
   * P-256 authenticator. Resolve per-chain via `getEip8130Deployment` when the
   * deployment differs.
   */
  authenticator?: Address | undefined
  /** Placeholder `Signer.address` (P-256 keys have no EVM address). */
  address?: Address | undefined
}

/**
 * Builds a {@link Signer} for a raw P-256 (secp256r1) configured actor. The
 * signer's `sign` returns the P-256 authenticator `data`
 * (`r || s || x || y || preHash`, 129 bytes) and carries the P-256
 * `authenticator`, so it can be passed straight to `toAccount` /
 * `signTransaction` to sign as a non-ECDSA actor.
 *
 * @example
 * import { key, toAccount, toP256Signer } from 'viem/experimental'
 *
 * const signer = toP256Signer({ privateKey })
 * const account = toAccount({
 *   signer,
 *   authenticator: signer.authenticator,
 *   userSalt,
 *   code,
 *   initialActors: [key.p256(signer.publicKey)],
 * })
 */
export function toP256Signer(
  parameters: ToP256SignerParameters,
): Signer & { publicKey: { x: Hex; y: Hex } } {
  const { privateKey } = parameters
  const authenticator = parameters.authenticator ?? canonicalAuthenticators.p256
  const pub = P256.getPublicKey({ privateKey })
  const x = numberToHex(pub.x, { size: 32 })
  const y = numberToHex(pub.y, { size: 32 })

  return {
    address: parameters.address ?? zeroAddress,
    authenticator,
    publicKey: { x, y },
    async sign({ hash }) {
      // Sign over the digest directly (no re-hash): the P-256 authenticator
      // verifies `P256.verify(hash, r, s, x, y)`.
      const { r, s } = P256.sign({ payload: hash, privateKey })
      return concatHex([
        numberToHex(r, { size: 32 }),
        numberToHex(s, { size: 32 }),
        x,
        y,
        '0x00', // preHash flag (digest already provided)
      ])
    },
  }
}

/** WebAuthn assertion metadata, as returned by viem's `toWebAuthnAccount`. */
export type WebAuthnSignSource = {
  /** Credential public key: 64-byte `x || y` hex, or `{ x, y }`. */
  publicKey: Hex | { x: Hex; y: Hex }
  /**
   * Produces a WebAuthn assertion over `hash`. Structurally compatible with the
   * `sign` of viem's `toWebAuthnAccount` (`viem/account-abstraction`).
   */
  sign: (parameters: { hash: Hex }) => Promise<{
    /** secp256r1 signature, `r || s` (64 bytes). */
    signature: Hex
    webauthn: {
      authenticatorData: Hex
      clientDataJSON: string
      challengeIndex: number
      typeIndex: number
    }
  }>
}

const webAuthnAuthParameters = [
  {
    type: 'tuple',
    components: [
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
      { name: 'challengeIndex', type: 'uint256' },
      { name: 'typeIndex', type: 'uint256' },
      { name: 'authenticatorData', type: 'bytes' },
      { name: 'clientDataJSON', type: 'string' },
    ],
  },
  { name: 'x', type: 'bytes32' },
  { name: 'y', type: 'bytes32' },
] as const

export type ToWebAuthnSignerParameters = {
  /**
   * Authenticator address that validates this passkey. Defaults to the canonical
   * WebAuthn/passkey authenticator.
   */
  authenticator?: Address | undefined
  /** Placeholder `Signer.address` (passkeys have no EVM address). */
  address?: Address | undefined
}

/**
 * Builds a {@link Signer} for a WebAuthn (passkey / FIDO2) configured actor. The
 * signer's `sign` runs the assertion and ABI-encodes the WebAuthn authenticator
 * `data` (`(WebAuthnAuth, x, y)`), carrying the passkey `authenticator`.
 *
 * @example
 * import { createWebAuthnCredential, toWebAuthnAccount } from 'viem/account-abstraction'
 * import { key, toAccount, toWebAuthnSigner } from 'viem/experimental'
 *
 * const credential = await createWebAuthnCredential({ name: 'vibes' })
 * const signer = toWebAuthnSigner(toWebAuthnAccount({ credential }))
 * const account = toAccount({
 *   signer,
 *   authenticator: signer.authenticator,
 *   userSalt,
 *   code,
 *   initialActors: [key.passkey(signer.publicKey)],
 * })
 */
export function toWebAuthnSigner(
  source: WebAuthnSignSource,
  parameters: ToWebAuthnSignerParameters = {},
): Signer & { publicKey: { x: Hex; y: Hex } } {
  const authenticator =
    parameters.authenticator ?? canonicalAuthenticators.passkey
  const { x, y } = publicKeyToXY(source.publicKey)

  return {
    address: parameters.address ?? zeroAddress,
    authenticator,
    publicKey: { x, y },
    async sign({ hash }) {
      const { signature, webauthn } = await source.sign({ hash })
      const r = sliceHex(signature, 0, 32)
      const s = sliceHex(signature, 32, 64)
      return encodeAbiParameters(webAuthnAuthParameters, [
        {
          r,
          s,
          challengeIndex: BigInt(webauthn.challengeIndex),
          typeIndex: BigInt(webauthn.typeIndex),
          authenticatorData: webauthn.authenticatorData,
          clientDataJSON: webauthn.clientDataJSON,
        },
        x,
        y,
      ])
    },
  }
}
