import * as Signature from 'ox/Signature'
import * as WebAuthnP256 from 'ox/WebAuthnP256'

import type { ErrorType } from '../../errors/utils.js'
import { hashMessage } from '../../utils/signature/hashMessage.js'
import { hashTypedData } from '../../utils/signature/hashTypedData.js'
import type { P256Credential } from './createWebAuthnCredential.js'
import type { WebAuthnAccount } from './types.js'

export type ToWebAuthnAccountParameters = {
  /**
   * The WebAuthn P256 credential to use.
   */
  credential: {
    id: P256Credential['id']
    publicKey: P256Credential['publicKey']
  }
  /**
   * Credential request function. Useful for environments that do not support
   * the WebAuthn API natively (i.e. React Native or testing environments).
   *
   * @default window.navigator.credentials.get
   */
  getFn?: WebAuthnP256.sign.Options['getFn'] | undefined
  /**
   * The relying party identifier to use.
   */
  rpId?: WebAuthnP256.sign.Options['rpId'] | undefined
}

export type ToWebAuthnAccountReturnType = WebAuthnAccount

export type ToWebAuthnAccountErrorType = ErrorType

/**
 * @description Creates an Account from a WebAuthn Credential.
 *
 * @returns A WebAuthn Account.
 */
export function toWebAuthnAccount(
  parameters: ToWebAuthnAccountParameters,
): WebAuthnAccount {
  const { getFn, rpId } = parameters
  const { id, publicKey } = parameters.credential
  return {
    id,
    publicKey,
    async sign({ hash }) {
      const { metadata, raw, signature } = await WebAuthnP256.sign({
        credentialId: id,
        getFn,
        challenge: hash,
        rpId,
      })
      return {
        signature: Signature.toHex(signature),
        raw,
        webauthn: metadata,
      }
    },
    async signMessage({ message }) {
      return this.sign({ hash: hashMessage(message) })
    },
    async signTypedData(parameters) {
      return this.sign({ hash: hashTypedData(parameters) })
    },
    type: 'webAuthn',
  }
}
