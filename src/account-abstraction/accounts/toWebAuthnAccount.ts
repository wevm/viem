import { PublicKey, WebAuthnP256 } from 'ox'
import type { ErrorType } from '../../errors/utils.js'
import { hashMessage } from '../../utils/signature/hashMessage.js'
import { hashTypedData } from '../../utils/signature/hashTypedData.js'
import type { WebAuthnAccount } from './types.js'

export type ToWebAuthnAccountParameters = {
  /**
   * The WebAuthn P256 credential to use.
   */
  credential: {
    id: WebAuthnP256.P256Credential['id']
    publicKey: WebAuthnP256.P256Credential['publicKey']
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
    publicKey: PublicKey.toHex(publicKey),
    async sign({ hash }) {
      return WebAuthnP256.sign({ credentialId: id, getFn, challenge: hash, rpId })
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
