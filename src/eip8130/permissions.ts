import type { Address } from 'abitype'
import type { Client } from '../clients/createClient.js'
import type { Transport } from '../clients/transports/createTransport.js'
import { zeroAddress } from '../constants/address.js'
import { BaseError } from '../errors/base.js'
import type { Permission } from '../experimental/erc7715/types/permission.js'
import type { Policy as GrantedPolicy } from '../experimental/erc7715/types/policy.js'
import type { Account } from '../types/account.js'
import type { Chain } from '../types/chain.js'
import type { Hex } from '../types/misc.js'
import { decodeAbiParameters } from '../utils/abi/decodeAbiParameters.js'
import { encodeAbiParameters } from '../utils/abi/encodeAbiParameters.js'
import { toFunctionSelector } from '../utils/hash/toFunctionSelector.js'
import { getActorConfig } from './actions/getActorConfig.js'
import { actorScope, trustedExecutorAuthenticator } from './constants.js'
import { authorizeActor, key } from './keys.js'
import {
  type DefineSessionPolicyParameters,
  defineSessionPolicy,
  encodeSessionPolicyConfig,
  type SessionPolicy,
  type SessionPolicyAction,
  type SessionPolicyCallScope,
  type SessionPolicyConfig,
  type SessionPolicyTokenLimit,
} from './policies.js'
import type {
  AaActor,
  AaAuthorizeActor,
  AaCall,
  AaChange,
} from './types/transaction.js'

/**
 * The ERC-20 selectors a `SessionPolicy` gates on for token spend + recipient
 * checks. An `erc20-token-transfer` permission is lowered to a call scope
 * allowing exactly these on the token contract.
 */
const erc20TransferSelectors = [
  toFunctionSelector('transfer(address,uint256)'),
  toFunctionSelector('transferFrom(address,address,uint256)'),
] as const

/** Matches a bare 4-byte selector (`0x` + 8 hex chars). */
const selectorRegex = /^0x[0-9a-fA-F]{8}$/

/**
 * Lower a single call signature/selector to its 4-byte selector.
 *
 * Accepts a human-readable signature (`"transfer(address,uint256)"`) or an
 * already-computed selector (`"0xa9059cbb"`).
 */
function toSelector(signatureOrSelector: string): Hex {
  if (selectorRegex.test(signatureOrSelector))
    return signatureOrSelector.toLowerCase() as Hex
  return toFunctionSelector(signatureOrSelector)
}

/**
 * Fold an ERC-7715 permission's policies into a `SessionPolicy` spend cap.
 *
 * - `token-allowance` → the per-period (or one-time) `limit`.
 * - `rate-limit` → the reset `period` (its `interval`, in seconds). The per-
 *   interval `count` has no `SessionPolicy` equivalent (the policy caps spend,
 *   not call frequency) and is ignored.
 * - `gas-limit` → ignored here (gas is settled by the payer / ERC-8168 layer,
 *   not the session policy).
 * - `custom` → rejected (cannot be safely lowered).
 */
function spendFromPolicies(policies: readonly GrantedPolicy[]): {
  limit?: bigint | undefined
  period?: bigint | undefined
} {
  let limit: bigint | undefined
  let period: bigint | undefined
  for (const policy of policies) {
    if (typeof policy.type === 'object')
      throw new BaseError(
        'Cannot lower a custom ERC-7715 policy to a SessionPolicy. Build the `SessionPolicyConfig` explicitly.',
      )
    const type = policy.type
    switch (policy.type) {
      case 'token-allowance':
        limit = policy.data.allowance
        break
      case 'rate-limit':
        period = BigInt(policy.data.interval)
        break
      case 'gas-limit':
        break
      default:
        throw new BaseError(`Unsupported ERC-7715 policy type: "${type}".`)
    }
  }
  return { limit, period }
}

export type ToSessionPolicyConfigErrorType = BaseError

/**
 * Lower a set of ERC-7715 `permissions` (a `wallet_grantPermissions` request)
 * to an EIP-8130 {@link SessionPolicyConfig}.
 *
 * This is the fulfillment glue a wallet runs to satisfy a dApp permission
 * request with a policy-gated EIP-8130 session key:
 *
 * - `native-token-transfer` → a native-ETH `tokenLimit` (gated on each call's
 *   `value`). Requires a `token-allowance` policy for the cap.
 * - `erc20-token-transfer` → an ERC-20 `tokenLimit` **and** a `callScope`
 *   restricting the key to `transfer` / `transferFrom` on the token. Requires a
 *   `token-allowance` policy for the cap.
 * - `contract-call` → a `callScope` restricting the key to the given selectors
 *   on the target contract.
 *
 * A `rate-limit` policy on a transfer permission sets the cap's reset `period`
 * (a recurring allowance / "subscription"); without one the cap is one-time.
 *
 * @throws if a transfer permission has no `token-allowance` (an unbounded spend
 * cannot be safely expressed), or if a `custom` permission/policy is present.
 *
 * @example
 * import { toSessionPolicyConfig, encodeSessionPolicyConfig } from 'viem/eip8130'
 *
 * // "≤ 100 USDC / week" subscription for a session key
 * const config = toSessionPolicyConfig([
 *   {
 *     type: 'erc20-token-transfer',
 *     data: { address: usdc, ticker: 'USDC' },
 *     policies: [
 *       { type: 'token-allowance', data: { allowance: parseUnits('100', 6) } },
 *       { type: 'rate-limit', data: { count: 1, interval: 7 * 86400 } },
 *     ],
 *   },
 * ])
 * const policyConfig = encodeSessionPolicyConfig(config)
 */
export function toSessionPolicyConfig(
  permissions: readonly Permission[],
): SessionPolicyConfig {
  const tokenLimits: SessionPolicyTokenLimit[] = []
  const callScopes: SessionPolicyCallScope[] = []

  for (const permission of permissions) {
    if (typeof permission.type === 'object')
      throw new BaseError(
        'Cannot lower a custom ERC-7715 permission to a SessionPolicy. Build the `SessionPolicyConfig` explicitly.',
      )

    const type = permission.type
    switch (permission.type) {
      case 'native-token-transfer': {
        const { limit, period } = spendFromPolicies(permission.policies)
        if (limit === undefined)
          throw new BaseError(
            'A `native-token-transfer` permission must include a `token-allowance` policy (an unbounded spend cannot be granted).',
          )
        tokenLimits.push({ token: zeroAddress, limit, period })
        break
      }
      case 'erc20-token-transfer': {
        const token = permission.data.address as Address
        const { limit, period } = spendFromPolicies(permission.policies)
        if (limit === undefined)
          throw new BaseError(
            'An `erc20-token-transfer` permission must include a `token-allowance` policy (an unbounded spend cannot be granted).',
          )
        tokenLimits.push({ token, limit, period })
        callScopes.push({
          target: token,
          selectorRules: erc20TransferSelectors.map((selector) => ({
            selector,
          })),
        })
        break
      }
      case 'contract-call': {
        callScopes.push({
          target: permission.data.address as Address,
          selectorRules: permission.data.calls.map((call) => ({
            selector: toSelector(call),
          })),
        })
        break
      }
      default:
        throw new BaseError(`Unsupported ERC-7715 permission type: "${type}".`)
    }
  }

  return {
    tokenLimits: tokenLimits.length > 0 ? tokenLimits : undefined,
    callScopes: callScopes.length > 0 ? callScopes : undefined,
  }
}

export type ToSessionPolicyParameters = Omit<
  DefineSessionPolicyParameters,
  'policyConfig' | 'validUntil'
> & {
  /** The ERC-7715 permissions to grant the session key. */
  permissions: readonly Permission[]
  /**
   * Top-level ERC-7715 `expiry` (unix **seconds**) after which the policy is no
   * longer valid. Maps to the binding's `validUntil`. @default 0n (no expiry)
   */
  expiry?: number | bigint | undefined
}

export type ToSessionPolicyErrorType = ToSessionPolicyConfigErrorType

/**
 * Fulfill an ERC-7715 `wallet_grantPermissions` request as an EIP-8130
 * policy-gated session key: lowers `permissions` to a {@link SessionPolicyConfig}
 * and binds it to `account` via {@link defineSessionPolicy}.
 *
 * The returned {@link SessionPolicy} carries the `commitment`, the `actorPolicy`
 * to authorize the key, and `executeCall` for later spends.
 *
 * @example
 * import {
 *   toSessionPolicy,
 *   authorizeActor,
 *   actorScope,
 *   key,
 * } from 'viem/eip8130'
 *
 * const session = toSessionPolicy({
 *   account: account.address,
 *   expiry: Math.floor(Date.now() / 1000) + 7 * 86400,
 *   permissions: [
 *     {
 *       type: 'erc20-token-transfer',
 *       data: { address: usdc, ticker: 'USDC' },
 *       policies: [
 *         { type: 'token-allowance', data: { allowance: parseUnits('100', 6) } },
 *       ],
 *     },
 *   ],
 * })
 *
 * // authorize the session key (its signed commitment IS the grant)
 * await account.change([
 *   authorizeActor(key.p256(pub), {
 *     scope: actorScope.sender,
 *     policy: session.actorPolicy,
 *   }),
 * ])
 *
 * // later: the key spends within its limit, routed through the manager
 * const spend = session.executeCall({ target: usdc, data: transferCalldata })
 */
export function toSessionPolicy(
  parameters: ToSessionPolicyParameters,
): SessionPolicy {
  const { permissions, expiry, ...rest } = parameters
  return defineSessionPolicy({
    ...rest,
    policyConfig: encodeSessionPolicyConfig(toSessionPolicyConfig(permissions)),
    validUntil: expiry === undefined ? undefined : BigInt(expiry),
  })
}

/**
 * How the granted key acts on the account:
 *
 * - `'session'`: a key **on** the account. The EIP-8130 protocol dispatches its
 *   calls as the account (`PolicyManager.execute`), gated by the policy. Uses a
 *   secp256k1 (k1) actor for the given key address.
 * - `'pull'`: an **external** caller (e.g. a subscription provider) that draws
 *   against the policy via `PolicyManager.executeFor` from its *own* address.
 *   Uses the {@link externalPolicyAuthenticator} sentinel actor, which can only
 *   act through the external-pull path.
 */
export type GrantRole = 'session' | 'pull'

export type FulfillGrantPermissionsParameters = Omit<
  DefineSessionPolicyParameters,
  'account' | 'policyConfig' | 'validUntil' | 'policyType'
> & {
  /** The smart account granting the permissions (the execution target). */
  account: Address
  /**
   * The key/caller to authorize:
   * - `role: 'session'` → the session key's secp256k1 address.
   * - `role: 'pull'` → the external caller's (subscription provider's) address.
   */
  grantee: Address
  /** How the grantee acts on the account. @default 'session' */
  role?: GrantRole | undefined
  /** The ERC-7715 permissions to grant. */
  permissions: readonly Permission[]
  /**
   * Top-level ERC-7715 `expiry` (unix **seconds**). Drives **both** the policy
   * binding's `validUntil` and the actor authorization's `expiry`, so they can't
   * drift. @default 0n (no expiry)
   */
  expiry?: number | bigint | undefined
  /**
   * Skip the on-chain check for whether `manager` is registered as a
   * trusted-executor actor on the account (assume it already is). When `false`
   * (default), the account is read and a `managerChange` is included in `changes`
   * if the manager still needs registering. @default false
   */
  assumeManagerRegistered?: boolean | undefined
}

export type FulfillGrantPermissionsReturnType = {
  /** The authorized actor (`key.k1` for `session`, `key.externalPull` for `pull`). */
  actor: AaActor
  /**
   * The `authorizeActor` change authorizing the grantee. Its signed commitment
   * *is* the authorization (no separate install). Always POLICY-gated
   * ({@link actorScope}.policy).
   */
  change: AaAuthorizeActor
  /**
   * Present iff the `manager` was not yet registered as a trusted-executor actor
   * on the account: the one-time `authorizeActor(key.trustedExecutor(manager),
   * { scope: sender })` change the account needs so the manager's forwarded
   * `executeBatch` can land. Already included in {@link changes}.
   */
  managerChange?: AaAuthorizeActor | undefined
  /**
   * The full batch of account changes to sign + land in one transaction: the
   * `managerChange` (if needed) followed by the grantee `change`.
   */
  changes: readonly AaChange[]
  /**
   * The bound {@link SessionPolicy}: `commitment`, `actorPolicy`, and the call
   * builders (`executeCall` for `session`, `executeForCall` for `pull`).
   */
  session: SessionPolicy
  /**
   * Opaque, self-describing ERC-7715 `permissionsContext` for this grant.
   * Return it to the dApp; later `routePermissionedCalls` / `sendPermissionedCalls`
   * decode it to route the granted key's calls through the manager — no wallet-
   * side storage needed (see {@link parsePermissionsContext}).
   */
  permissionsContext: Hex
}

export type FulfillGrantPermissionsErrorType = ToSessionPolicyConfigErrorType

/**
 * Fulfill an ERC-7715 `wallet_grantPermissions` request as an EIP-8130
 * **policy-gated** actor — the wallet-side glue for both flows we support:
 *
 * - a **session key** that takes actions on the account (`role: 'session'`), or
 * - an **external pull** subscription that batches draws (`role: 'pull'`).
 *
 * Both are authorized POLICY-only ({@link actorScope}.policy) against the same
 * committed {@link SessionPolicy}; the `role` only changes the actor's
 * authenticator (a k1 key vs. the external-pull sentinel) and which manager
 * entrypoint is used at execution (`execute` vs. `executeFor`). The single
 * ERC-7715 `expiry` drives both the binding `validUntil` and the actor `expiry`.
 *
 * For the manager's forwarded `executeBatch` to land, the account must register
 * the `manager` as a trusted-executor actor. This action reads the account and,
 * if that registration is missing, includes it as `managerChange` at the front
 * of `changes` — so a single `account.change(changes)` both provisions the
 * manager (once) and authorizes the grantee. Pass `assumeManagerRegistered:
 * true` to skip the read.
 *
 * @example
 * import { fulfillGrantPermissions } from 'viem/eip8130'
 *
 * // session key: "≤ 100 USDC / week", expires in 7 days
 * const { changes, session } = await fulfillGrantPermissions(client, {
 *   account: account.address,
 *   grantee: sessionKeyAddress,
 *   expiry: Math.floor(Date.now() / 1000) + 7 * 86_400,
 *   permissions: [
 *     {
 *       type: 'erc20-token-transfer',
 *       data: { address: usdc, ticker: 'USDC' },
 *       policies: [
 *         { type: 'token-allowance', data: { allowance: parseUnits('100', 6) } },
 *         { type: 'rate-limit', data: { count: 1, interval: 7 * 86_400 } },
 *       ],
 *     },
 *   ],
 * })
 * // provisions the manager (if needed) + authorizes the key, in one batch
 * await account.change(changes)
 * // later: session.executeCall({ target: usdc, data: transferCalldata })
 *
 * @param client - Client.
 * @param parameters - Parameters.
 */
export async function fulfillGrantPermissions<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: FulfillGrantPermissionsParameters,
): Promise<FulfillGrantPermissionsReturnType> {
  const {
    account,
    grantee,
    role = 'session',
    permissions,
    expiry,
    assumeManagerRegistered = false,
    ...rest
  } = parameters
  const expiryBig = expiry === undefined ? undefined : BigInt(expiry)

  const session = defineSessionPolicy({
    ...rest,
    account,
    policyConfig: encodeSessionPolicyConfig(toSessionPolicyConfig(permissions)),
    validUntil: expiryBig,
  })

  const actor = role === 'pull' ? key.externalPull(grantee) : key.k1(grantee)

  const change = authorizeActor(actor, {
    scope: actorScope.policy,
    policy: session.actorPolicy,
    expiry: expiryBig,
  })

  // Ensure the manager is a trusted-executor actor so its forwarded
  // `executeBatch` can drive the account; register it in the same batch if not.
  let managerChange: AaAuthorizeActor | undefined
  if (!assumeManagerRegistered) {
    const managerActor = key.trustedExecutor(session.manager)
    const { authenticator } = await getActorConfig(client, {
      account,
      actorId: managerActor.actorId,
    })
    const registered =
      authenticator.toLowerCase() === trustedExecutorAuthenticator.toLowerCase()
    if (!registered)
      managerChange = authorizeActor(managerActor, {
        scope: actorScope.sender,
      })
  }

  const changes = managerChange ? [managerChange, change] : [change]

  const permissionsContext = toPermissionsContext({ role, actor, session })

  return { actor, change, managerChange, changes, session, permissionsContext }
}

// ─────────────────────────────────────────────────────────────────────────────
// permissionsContext — encode / decode / route
// ─────────────────────────────────────────────────────────────────────────────

const grantRoleCode = { session: 0, pull: 1 } as const
const grantRoleName = [
  'session',
  'pull',
] as const satisfies readonly GrantRole[]

const permissionsContextParameters = [
  { type: 'address' }, // account
  { type: 'uint8' }, // role
  { type: 'bytes32' }, // actorId
  { type: 'address' }, // authenticator
  { type: 'address' }, // manager
  { type: 'address' }, // policy
  { type: 'bytes' }, // policyConfig
  { type: 'uint40' }, // validAfter
  { type: 'uint40' }, // validUntil
  { type: 'uint256' }, // salt
] as const

export type ToPermissionsContextParameters = {
  /** The granted role (`session` or `pull`). */
  role: GrantRole
  /** The authorized actor (`{ actorId, authenticator }`). */
  actor: AaActor
  /** The bound {@link SessionPolicy} (carries the binding + manager + policy). */
  session: SessionPolicy
}

export type ParsePermissionsContextReturnType = {
  /** The account the permission was granted on. */
  account: Address
  /** The granted role. */
  role: GrantRole
  /** The authorized actor. */
  actor: AaActor
  /** The rebound {@link SessionPolicy} (recomputes the same `commitment`). */
  session: SessionPolicy
}

/**
 * Encodes a grant into an opaque, **self-describing** ERC-7715
 * `permissionsContext` — everything needed to later route the granted key's
 * calls (account, role, actor identity, and the full policy binding), so no
 * wallet-side storage is required. Round-trips with {@link parsePermissionsContext}.
 */
export function toPermissionsContext(
  parameters: ToPermissionsContextParameters,
): Hex {
  const { role, actor, session } = parameters
  const { binding } = session
  return encodeAbiParameters(permissionsContextParameters, [
    binding.account,
    grantRoleCode[role],
    actor.actorId,
    actor.authenticator,
    session.manager,
    binding.policy,
    binding.policyConfig,
    Number(binding.validAfter),
    Number(binding.validUntil),
    binding.salt,
  ])
}

export type ParsePermissionsContextErrorType = BaseError

/**
 * Decodes an opaque {@link toPermissionsContext} `permissionsContext` back into
 * the account, role, actor, and a rebound {@link SessionPolicy} (which recomputes
 * the same `commitment` and exposes `executeCall` / `executeForCall`).
 */
export function parsePermissionsContext(
  context: Hex,
): ParsePermissionsContextReturnType {
  const [
    account,
    roleCode,
    actorId,
    authenticator,
    manager,
    policy,
    policyConfig,
    validAfter,
    validUntil,
    salt,
  ] = decodeAbiParameters(permissionsContextParameters, context)

  const role = grantRoleName[roleCode]
  if (!role)
    throw new BaseError(`Unknown permissionsContext role code: ${roleCode}.`)

  const session = defineSessionPolicy({
    account,
    policy,
    manager,
    policyConfig,
    validAfter: BigInt(validAfter),
    validUntil: BigInt(validUntil),
    salt,
  })

  return { account, role, actor: { actorId, authenticator }, session }
}

export type RoutePermissionedCallsParameters = {
  /** The ERC-7715 `permissionsContext` returned at grant time. */
  context: Hex
  /** The actions the granted key wants to perform (target/value/data each). */
  calls: readonly SessionPolicyAction[]
}

export type RoutePermissionedCallsReturnType =
  ParsePermissionsContextReturnType & {
    /**
     * The calls to submit, each wrapped for the policy manager:
     * `execute` for a `session` key (sent as the account) or `executeFor` for a
     * `pull` actor (sent by the external caller from its own address).
     */
    calls: readonly AaCall[]
  }

export type RoutePermissionedCallsErrorType = ParsePermissionsContextErrorType

/**
 * The `sendTransaction`-level routing step: decodes a `permissionsContext` and wraps
 * each user action so it lands on the policy manager under the granted key —
 * `session.executeCall` for a session key (dispatched as the account) or
 * `session.executeForCall` for an external pull actor.
 *
 * @example
 * import { routePermissionedCalls, sendTransaction, toAccount, actorScope } from 'viem/eip8130'
 *
 * const { account, actor, calls } = routePermissionedCalls({
 *   context: permissionsContext,        // from the grant
 *   calls: [{ target: usdc, data: transferCalldata }],
 * })
 *
 * // session key: send the routed calls AS the account, signed by the session key
 * const handle = toAccount({
 *   signer: sessionSigner,
 *   address: account,
 *   authenticator: actor.authenticator,
 *   actorId: actor.actorId,
 *   scope: actorScope.policy,
 * })
 * await sendTransaction(client, { account: handle, calls, gas })
 */
export function routePermissionedCalls(
  parameters: RoutePermissionedCallsParameters,
): RoutePermissionedCallsReturnType {
  const { context, calls } = parameters
  const parsed = parsePermissionsContext(context)
  const wrap =
    parsed.role === 'pull'
      ? parsed.session.executeForCall
      : parsed.session.executeCall
  return { ...parsed, calls: calls.map((action) => wrap(action)) }
}
