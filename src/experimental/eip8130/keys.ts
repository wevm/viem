import type { Address } from 'abitype'
import { BaseError } from '../../errors/base.js'
import type { Hex } from '../../types/misc.js'
import { concatHex } from '../../utils/data/concat.js'
import { pad } from '../../utils/data/pad.js'
import { size } from '../../utils/data/size.js'
import {
  actorScope,
  canonicalAuthenticators,
  ecrecoverAuthenticator,
  scopeUnrestricted,
  trustedExecutorAuthenticator,
} from './constants.js'
import type {
  AaActor,
  AaAuthorizeActor,
  AaRevokeActor,
} from './types/transaction.js'
import { actorIdFromAddress, actorIdFromPublicKey } from './utils/actorId.js'

/**
 * Builders for canonical-authenticator actors. Each returns an {@link AaActor}
 * (`{ actorId, authenticator }`) for use as an initial actor or as the identity
 * of an `authorizeActor` change (see {@link authorizeActor}).
 */
export const key = {
  /** secp256k1 (native ecrecover) actor for `address`. */
  k1(address: Address): AaActor {
    return {
      actorId: actorIdFromAddress(address),
      authenticator: ecrecoverAuthenticator,
    }
  },
  /** P-256 actor for a public key (`{ x, y }` or 64-byte `x || y`). */
  p256(
    publicKey: { x: Hex; y: Hex } | Hex,
    options: { authenticator?: Address } = {},
  ): AaActor {
    return {
      actorId: actorIdFromPublicKey(publicKey),
      authenticator: options.authenticator ?? canonicalAuthenticators.p256,
    }
  },
  /** WebAuthn / FIDO2 passkey actor for a public key. Alias: `key.passkey`. */
  webAuthn(
    publicKey: { x: Hex; y: Hex } | Hex,
    options: { authenticator?: Address } = {},
  ): AaActor {
    return {
      actorId: actorIdFromPublicKey(publicKey),
      authenticator: options.authenticator ?? canonicalAuthenticators.passkey,
    }
  },
  /** WebAuthn / FIDO2 passkey actor for a public key. Alias: `key.webAuthn`. */
  passkey(
    publicKey: { x: Hex; y: Hex } | Hex,
    options: { authenticator?: Address } = {},
  ): AaActor {
    return {
      actorId: actorIdFromPublicKey(publicKey),
      authenticator: options.authenticator ?? canonicalAuthenticators.passkey,
    }
  },
  /** Delegate actor: signatures valid for `delegatedAccount` act for this account. */
  delegate(
    delegatedAccount: Address,
    options: { authenticator?: Address } = {},
  ): AaActor {
    return {
      actorId: actorIdFromAddress(delegatedAccount),
      authenticator: options.authenticator ?? canonicalAuthenticators.delegate,
    }
  },
  /**
   * Trusted-executor ("external caller") actor for `caller` — an address (e.g. a
   * PolicyManager or ERC-4337 EntryPoint) authorized to drive the account via
   * `executeBatch` by matching `msg.sender`, not by producing a signature. Pair
   * with `authorizeActor(..., { scope: actorScope.sender })` and no policy. A
   * policy-gated session key needs its `manager` registered this way.
   */
  trustedExecutor(caller: Address): AaActor {
    return {
      actorId: actorIdFromAddress(caller),
      authenticator: trustedExecutorAuthenticator,
    }
  },
} as const

/** Combines {@link actorScope} flags into a single scope bitmask. */
export function toScope(...flags: number[]): number {
  return flags.reduce((acc, flag) => acc | flag, 0)
}

/**
 * Whether an actor with `scope` may use sequenced (counter-backed) nonce keys —
 * i.e. standard sequential ordering or a 2D nonce channel.
 *
 * Mirrors the node rule: an actor may use ordered (sequenced) nonces if it is
 * **admin** (`scope == scopeUnrestricted`, `0x00`) **or** it holds the
 * `SCOPE_NONCE` bit. Both admin and `SCOPE_NONCE` actors may additionally use
 * nonce-free (expiring) mode. Only a *restricted* actor **without**
 * `SCOPE_NONCE` is confined to nonce-free. Use {@link isNoncelessOnly} for the
 * inverse.
 */
export function canUseSequencedNonce(scope: number | undefined): boolean {
  const s = scope ?? scopeUnrestricted
  return s === scopeUnrestricted || (s & actorScope.nonce) !== 0
}

/**
 * Whether an actor with `scope` is restricted to nonce-free (expiring)
 * transactions (`nonceKey = NONCE_KEY_MAX`).
 *
 * True **only** for a restricted actor (non-admin) authorized **without** the
 * `SCOPE_NONCE` bit. Admin actors (`scope == 0`) and `SCOPE_NONCE` actors are
 * **not** restricted — they may use ordered *or* nonce-free. Inverse of
 * {@link canUseSequencedNonce}.
 */
export function isNoncelessOnly(scope: number | undefined): boolean {
  return !canUseSequencedNonce(scope)
}

export type Policy = {
  /** Non-zero policy selector (interpreted by the manager, not the protocol). */
  type: number
  /** Manager contract the policy-bearing actor is gated to call. */
  manager: Address
  /** 32-byte commitment (`keccak256` of the policy parameters). */
  commitment: Hex
}

/** Encodes a {@link Policy} into the wire `policyData` blob (`manager || commitment`). */
export function encodePolicyData(policy: Policy): Hex {
  if (policy.type === 0)
    throw new BaseError('`policy.type` must be non-zero (0 = no policy).')
  if (size(policy.commitment) !== 32)
    throw new BaseError('`policy.commitment` must be 32 bytes.')
  return concatHex([pad(policy.manager, { size: 20 }), policy.commitment])
}

export type AuthorizeActorOptions = {
  /** Permission bitmask (see {@link actorScope}/{@link toScope}). `0` = unrestricted. */
  scope?: number | undefined
  /** Actor expiry (unix seconds). `0`/omitted = no expiry. */
  expiry?: bigint | undefined
  /** Policy gate. Omit for an unrestricted (non-policy) actor. */
  policy?: Policy | undefined
}

/**
 * Builds an `authorizeActor` change from a {@link key} actor plus scope, expiry,
 * and optional policy. The result can be signed via `signActorChanges` /
 * `toAccount#authorize`.
 *
 * A policy-gated actor (session key) should be authorized as POLICY-only
 * (`scope: actorScope.policy`): `SCOPE_POLICY` grants "gated initiation", so the
 * key can originate a transaction but every call is routed through — and
 * validated by — its manager. Per base/eip-8130, do NOT add `SCOPE_SENDER` (the
 * policy gate governs regardless). OR in `actorScope.selfPayer` for self-pay or
 * `actorScope.nonce` to allow sequenced nonces (without it the key is
 * nonce-free-only).
 *
 * @example
 * authorizeActor(key.p256({ x, y }), {
 *   scope: actorScope.policy, // POLICY-only; optionally | actorScope.selfPayer | actorScope.nonce
 *   policy: { type: 1, manager, commitment },
 * })
 */
export function authorizeActor(
  actor: AaActor,
  options: AuthorizeActorOptions = {},
): AaAuthorizeActor {
  const change: AaAuthorizeActor = {
    changeType: 0x00,
    actorId: actor.actorId,
    authenticator: actor.authenticator,
  }
  let scope = options.scope ?? 0
  if (options.expiry) change.expiry = options.expiry
  if (options.policy) {
    // Admin (scope 0) is unrestricted; a policy-gated actor must be restricted.
    if (scope === 0)
      throw new BaseError(
        'A policy-bearing actor MUST have a restricted (non-admin) scope (e.g. `actorScope.policy`).',
      )
    // Policy presence is the SCOPE_POLICY bit (there is no `policyType` field).
    scope |= actorScope.policy
    change.policyData = encodePolicyData(options.policy)
  }
  if (scope) change.scope = scope
  return change
}

/** Builds a `revokeActor` change for an actor (or raw `actorId`). */
export function revokeActor(actor: AaActor | Hex): AaRevokeActor {
  const actorId = typeof actor === 'string' ? actor : actor.actorId
  return { changeType: 0x01, actorId }
}
