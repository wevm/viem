// TODO(v3): Remove this in favor of `ox/WebAuthnP256` entirely.
import * as PublicKey from 'ox/PublicKey'
import * as WebAuthnP256 from 'ox/WebAuthnP256'

import type { Hex } from '../../types/misc.js'

export type P256Credential = {
  id: WebAuthnP256.P256Credential['id']
  publicKey: Hex
  raw: WebAuthnP256.P256Credential['raw']
}

export type CreateWebAuthnCredentialParameters =
  WebAuthnP256.createCredential.Options

export type CreateWebAuthnCredentialReturnType = P256Credential

export async function createWebAuthnCredential(
  parameters: CreateWebAuthnCredentialParameters,
): Promise<CreateWebAuthnCredentialReturnType> {
  const credential = await WebAuthnP256.createCredential(parameters)
  return {
    id: credential.id,
    publicKey: PublicKey.toHex(credential.publicKey, { includePrefix: false }),
    raw: credential.raw,
  }
}
