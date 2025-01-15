// biome-ignore lint/performance/noBarrelFile:
import { WebAuthnP256 } from 'ox'
export type CreateCredentialParameters = Parameters<typeof WebAuthnP256.createCredential>
export type CreateCredentialReturnType = ReturnType<typeof WebAuthnP256.createCredential>
export type P256Credential = WebAuthnP256.P256Credential
export const createCredential = WebAuthnP256.createCredential
