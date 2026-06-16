import * as Base64 from 'ox/Base64'
import * as Bytes from 'ox/Bytes'
import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'
import * as P256 from 'ox/P256'
import type * as Signature from 'ox/Signature'
import type * as WebAuthnP256 from 'ox/WebAuthnP256'

/** Deterministic P-256 private key backing the WebAuthn test credential. */
export const webAuthnPrivateKey =
  '0xebb2c082fd7727890a28ac82f6bdf97bad8de9f5d7c9028692de1a255cad3e0f' as const

/** Origin baked into the test assertion's `clientDataJSON`. */
export const webAuthnOrigin = 'https://example.com'

/** Relying party ID baked into the test assertion's `authenticatorData`. */
export const webAuthnRpId = 'example.com'

/** Public key of the WebAuthn test credential. */
export function getWebAuthnPublicKey() {
  return P256.getPublicKey({ privateKey: webAuthnPrivateKey })
}

/**
 * Builds a WebAuthn assertion (`metadata` + `signature`) over `challenge`, mirroring what an
 * authenticator produces. The result verifies with `WebAuthnP256.verify` and viem's
 * `Curve.webAuthn`.
 */
export function signWebAuthn(parameters: {
  challenge: Hex.Hex
  privateKey?: Hex.Hex | undefined
}): {
  metadata: WebAuthnP256.SignMetadata
  signature: Signature.Signature<false>
} {
  const { challenge, privateKey = webAuthnPrivateKey } = parameters

  const clientDataJSON = JSON.stringify({
    type: 'webauthn.get',
    challenge: Base64.fromBytes(Bytes.fromHex(challenge), {
      pad: false,
      url: true,
    }),
    origin: webAuthnOrigin,
    crossOrigin: false,
  })

  // rpIdHash(32) ++ flags(1: UP | UV) ++ signCount(4)
  const authenticatorData = Hex.concat(
    Hash.sha256(Hex.fromString(webAuthnRpId)),
    '0x05',
    '0x00000000',
  )

  const payload = Bytes.concat(
    Bytes.fromHex(authenticatorData),
    Hash.sha256(Bytes.fromString(clientDataJSON)),
  )
  const signature = P256.sign({ hash: true, payload, privateKey })

  return {
    metadata: {
      authenticatorData,
      clientDataJSON,
      userVerificationRequired: true,
    },
    signature,
  }
}
