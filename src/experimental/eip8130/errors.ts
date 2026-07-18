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

export type ScopeMismatchErrorType = ScopeMismatchError & {
  name: 'ScopeMismatchError'
}

/**
 * Thrown when an account handle declares a `scope` that does not match the
 * on-chain actor config. Authority is the chain's to report — a redeclared
 * scope that drifts from authorization is a live footgun for nonce-mode
 * selection.
 */
export class ScopeMismatchError extends BaseError {
  override name = 'ScopeMismatchError'
  constructor({
    declared,
    onChain,
  }: {
    declared: number
    onChain: number
  }) {
    super(
      `Declared signing scope \`0x${declared.toString(16)}\` does not match on-chain actor scope \`0x${onChain.toString(16)}\`.`,
      {
        metaMessages: [
          'Omit `scope` on the account handle and let prepare read `getActorConfig` — the chain is authoritative for nonce-mode selection.',
          'If you pass `scope`, it must equal the authorized on-chain value.',
        ],
      },
    )
  }
}

export type ActorNotBoundErrorType = ActorNotBoundError & {
  name: 'ActorNotBoundError'
}

/**
 * Thrown when the signing actor is not bound on the account according to the
 * authoritative RPC (`isActor` / `getActorConfig`). Distinct from builder-state
 * lag, where the public RPC shows the actor bound but the sequencer briefly
 * rejects with "actor is not bound".
 */
export class ActorNotBoundError extends BaseError {
  override name = 'ActorNotBoundError'
  constructor({
    account,
    actorId,
  }: {
    account: `0x${string}`
    actorId: `0x${string}`
  }) {
    super(
      `Signing actor \`${actorId}\` is not bound on account \`${account}\`.`,
      {
        metaMessages: [
          'Check actorId derivation (`key.k1` / `key.p256` / …) and that authorize used the same actorId + authenticator.',
          'If the public RPC shows the actor bound but broadcast still fails, that is builder lag — not this error.',
        ],
      },
    )
  }
}
