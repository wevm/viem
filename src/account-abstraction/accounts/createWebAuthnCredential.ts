// biome-ignore lint/performance/noBarrelFile:
export {
  type CreateCredentialParameters as CreateWebAuthnCredentialParameters,
  type CreateCredentialReturnType as CreateWebAuthnCredentialReturnType,
  type P256Credential,
  createCredential as createWebAuthnCredential,
} from 'webauthn-p256'
