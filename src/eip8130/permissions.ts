import type { Address } from 'abitype'
import { zeroAddress } from '../constants/address.js'
import { BaseError } from '../errors/base.js'
import type { Permission } from '../experimental/erc7715/types/permission.js'
import type { Policy as GrantedPolicy } from '../experimental/erc7715/types/policy.js'
import type { Hex } from '../types/misc.js'
import { toFunctionSelector } from '../utils/hash/toFunctionSelector.js'
import {
  type DefineSessionPolicyParameters,
  defineSessionPolicy,
  encodeSessionPolicyConfig,
  type SessionPolicy,
  type SessionPolicyCallScope,
  type SessionPolicyConfig,
  type SessionPolicyTokenLimit,
} from './policies.js'

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
