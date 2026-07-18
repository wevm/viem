import { BaseError } from '../../errors/base.js'

export type NonceScopeErrorType = NonceScopeError & { name: 'NonceScopeError' }

/**
 * Thrown when a sequenced (counter-backed) nonce key is requested for a signing
 * actor that lacks `SCOPE_NONCE` — admin actors (`scope == 0`) and any actor
 * authorized without the nonce bit are restricted to nonce-free (expiring)
 * transactions.
 */
export class NonceScopeError extends BaseError {
  override name = 'NonceScopeError'
  constructor({
    scope,
    nonceKey,
  }: {
    scope: number
    nonceKey?: bigint | undefined
  }) {
    super(
      `Signing actor scope \`0x${scope.toString(16)}\` lacks \`SCOPE_NONCE\`, so it may only send nonce-free (expiring) transactions${
        nonceKey !== undefined ? ` — received \`nonceKey\` ${nonceKey}.` : '.'
      }`,
      {
        metaMessages: [
          'Admin actors (scope 0) and any actor without the `SCOPE_NONCE` bit are restricted to nonce-free mode.',
          'Omit `nonceKey` to let the library select nonce-free mode automatically, or pass `...nonce.nonceless({ expiresIn })`.',
        ],
      },
    )
  }
}
