import type { Address } from 'abitype'
import { parseAbi } from 'abitype'
import { BaseError } from '../errors/base.js'
import type { Hex } from '../types/misc.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from '../utils/abi/encodeAbiParameters.js'
import { encodeFunctionData } from '../utils/abi/encodeFunctionData.js'
import { keccak256 } from '../utils/hash/keccak256.js'
import { baseSepoliaDeployment } from './deployments.js'
import type { Policy } from './keys.js'
import type { AaCall } from './types/transaction.js'

/**
 * Actor policies (EIP-8130 restricted actors).
 *
 * A restricted actor (e.g. a session key) is authorized with a non-zero
 * `policyType`, a `policy_manager`, and a `policy_commitment`. The protocol gate
 * forces every call that actor makes to land on the manager, which enforces the
 * committed policy and then drives the account via `executeBatch`.
 *
 * This module provides the off-chain glue for the [base/eip-8130 example
 * policies](https://github.com/base/eip-8130/tree/main/src/policies) — the
 * {@link policyManagerAbi PolicyManager} plus the unified
 * {@link encodeSessionPolicyConfig SessionPolicy}. Flow (base/eip-8130#43):
 *
 * 1. **Author** a `SessionPolicy` config ({@link encodeSessionPolicyConfig}).
 * 2. **Bind** it with {@link defineSessionPolicy} to get the `commitment` and the
 *    {@link Policy} to pass to `authorizeActor`.
 * 3. **Authorize**: ride `authorizeActor(key, { scope, policy })` in one
 *    transaction. That signed actor change *is* the authorization — there is no
 *    separate install step (the account's signed commitment is what the manager
 *    checks at execute).
 * 4. **Use**: the session key sends `executeCall(executionData)` — its only
 *    reachable target is the manager. The full {@link PolicyBinding} is passed
 *    on-chain at execute; the manager recomputes its commitment and requires it
 *    to equal the account's live signed commitment.
 *
 * @remarks Unlike the enshrined {@link keystoreAddress}, these are unaudited
 * *example* contracts (extensible: deploy your own manager/policy), so the
 * `manager` / `policy` addresses remain overridable. The defaults are the
 * canonical base/eip-8130 deployment, which — being deterministic CREATE2 — is
 * identical on every supported chain.
 */

// ─────────────────────────────────────────────────────────────────────────────
// ABIs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ABI for the example `PolicyManager` reference contract (base/eip-8130#43).
 *
 * There is no `install` step: the account's signed actor change (which stores
 * `policy_manager` + `policy_commitment` in Keystore) *is* the
 * authorization. Every execute path takes the full {@link PolicyBinding}; the
 * manager recomputes its commitment and compares it to the live signed
 * commitment, authenticating config, validity window, and owning account in one
 * check — with zero config storage on the manager or policy.
 */
export const policyManagerAbi = parseAbi([
  'struct PolicyBinding { address account; address policy; bytes policyConfig; uint40 validAfter; uint40 validUntil; uint256 salt; }',
  'event PolicyExecuted(address indexed account, address indexed policy, bytes32 indexed commitment, address caller)',
  'event ExecutionSkipped(address indexed account, address indexed policy, bytes32 indexed actorId)',
  'function commitmentOf(PolicyBinding binding) pure returns (bytes32)',
  'function execute(PolicyBinding binding, bytes executionData)',
  'function executeFor(PolicyBinding binding, bytes executionData)',
  'function executeForMany(PolicyBinding[] bindings, bytes[] executionData) returns (bool[] results)',
])

/**
 * ABI for the example `SessionPolicy` reference contract — the unified session-key
 * policy (target allowlist + selector rules + recipient allowlists + per-token /
 * native recurring spend limits).
 */
export const sessionPolicyAbi = parseAbi([
  'struct TokenLimit { address token; uint256 limit; uint40 period; }',
  'struct SelectorRule { bytes4 selector; address[] recipients; }',
  'struct CallScope { address target; SelectorRule[] selectorRules; }',
  'struct Config { TokenLimit[] tokenLimits; CallScope[] callScopes; }',
  'struct Action { address target; uint256 value; bytes data; }',
  'struct PeriodUsage { uint48 start; uint48 end; uint160 spend; }',
  // #43: config is no longer stored on-chain — the gating views are `pure` over
  // the supplied `Config` preimage (the same bytes the account signed). Only
  // `getCurrentSpend` is a `view` (it reads mutable spend usage keyed by the
  // binding commitment + the explicit token limit).
  'function isTargetAllowed(Config config, address target) pure returns (bool allowed, bool anySelector)',
  'function getSelectorRule(Config config, address target, bytes4 selector) pure returns (bool allowed, bool recipientBound)',
  'function isRecipientAllowed(Config config, address target, bytes4 selector, address recipient) pure returns (bool)',
  'function getTokenLimit(Config config, address token) pure returns (bool set, uint160 allowance, uint40 period)',
  'function getCurrentSpend(bytes32 commitment, TokenLimit limit) view returns (PeriodUsage)',
])

// ─────────────────────────────────────────────────────────────────────────────
// Binding + commitment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * An account-authorized policy binding. Its `keccak256` (see
 * {@link commitmentOf}) is the `policy_commitment` stored on the actor.
 */
export type PolicyBinding = {
  /** Account that authorizes installation and is the execution target. */
  account: Address
  /** Policy contract implementing the hook interface. */
  policy: Address
  /** Committed, policy-defined configuration bytes. */
  policyConfig: Hex
  /** Earliest timestamp (unix seconds) execution is allowed. `0n` = no bound. */
  validAfter: bigint
  /** Timestamp (unix seconds) at/after which execution is disallowed. `0n` = no bound. */
  validUntil: bigint
  /** Salt allowing distinct bindings for the same (account, policy, config). */
  salt: bigint
}

const commitmentParameters = [
  { type: 'address' },
  { type: 'address' },
  { type: 'bytes32' },
  { type: 'uint40' },
  { type: 'uint40' },
  { type: 'uint256' },
] as const

export type CommitmentOfErrorType = EncodeAbiParametersErrorType

/**
 * Computes the policy commitment for a {@link PolicyBinding}:
 * `keccak256(abi.encode(account, policy, keccak256(policyConfig), validAfter, validUntil, salt))`.
 *
 * Matches `PolicyManager.commitmentOf` exactly. Portable by construction (no
 * chain/domain mixed in).
 */
export function commitmentOf(binding: PolicyBinding): Hex {
  return keccak256(
    encodeAbiParameters(commitmentParameters, [
      binding.account,
      binding.policy,
      keccak256(binding.policyConfig),
      // `uint40` fits JS `number`; viem's typed encoder expects it.
      Number(binding.validAfter),
      Number(binding.validUntil),
      binding.salt,
    ]),
  )
}

/** Normalizes a {@link PolicyBinding} into the `PolicyManager.PolicyBinding` struct args. */
function toBindingArgs(binding: PolicyBinding) {
  return {
    account: binding.account,
    policy: binding.policy,
    policyConfig: binding.policyConfig,
    validAfter: Number(binding.validAfter),
    validUntil: Number(binding.validUntil),
    salt: binding.salt,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Session policy bundle
// ─────────────────────────────────────────────────────────────────────────────

export type DefineSessionPolicyParameters = {
  /** Account that authorizes + installs the binding (the execution target). */
  account: Address
  /** Committed, policy-defined configuration bytes (e.g. {@link encodeSessionPolicyConfig}). */
  policyConfig: Hex
  /** Policy contract. @default baseSepolia SessionPolicy */
  policy?: Address | undefined
  /** PolicyManager the actor is gated to. @default baseSepolia PolicyManager */
  manager?: Address | undefined
  /** Earliest timestamp (unix seconds) execution is allowed. @default 0n */
  validAfter?: bigint | undefined
  /** Timestamp (unix seconds) at/after which execution is disallowed. @default 0n */
  validUntil?: bigint | undefined
  /** Salt for distinct bindings of the same (account, policy, config). @default 0n */
  salt?: bigint | undefined
  /** Non-zero `policyType` stored on the actor. @default 1 */
  policyType?: number | undefined
}

export type SessionPolicy = {
  /** PolicyManager the gated actor may call. */
  manager: Address
  /** Policy contract enforcing the binding. */
  policy: Address
  /** The account-authorized binding. */
  binding: PolicyBinding
  /** The binding's commitment. */
  commitment: Hex
  /** Pass to `authorizeActor(key, { scope, policy })`. */
  actorPolicy: Policy
  /**
   * Account call the session key sends:
   * `PolicyManager.execute(binding, executionData)`. This is the only target a
   * policy-gated actor may reach. The full {@link PolicyBinding} is passed so the
   * manager can recompute + match the commitment (no install / config storage).
   *
   * Pass either raw `executionData` ({@link encodeSessionPolicyAction}) or the
   * action fields `{ target, value?, data? }` and the encoding is done for you.
   */
  executeCall(executionData: Hex | SessionPolicyAction): AaCall
  /**
   * External-pull call: `PolicyManager.executeFor(binding, executionData)`,
   * sent by an *external caller* (e.g. a subscription provider) from its own
   * address — not routed through the account. The account must have authorized
   * that caller as an external-pull actor (see `key.externalPull`); the manager
   * resolves the acting id from `msg.sender`. Returns the raw call to submit as
   * an ordinary transaction from the caller.
   *
   * Pass either raw `executionData` ({@link encodeSessionPolicyAction}) or the
   * action fields `{ target, value?, data? }`.
   */
  executeForCall(executionData: Hex | SessionPolicyAction): AaCall
}

export type DefineSessionPolicyErrorType = CommitmentOfErrorType

/**
 * Binds a committed policy config to an account and returns everything needed to
 * authorize and use a policy-gated session key (base/eip-8130#43: no install).
 *
 * @example
 * import {
 *   defineSessionPolicy,
 *   encodeSessionPolicyConfig,
 *   encodeSessionPolicyAction,
 *   authorizeActor,
 *   actorScope,
 *   key,
 * } from 'viem/eip8130'
 *
 * const session = defineSessionPolicy({
 *   account: account.address,
 *   policyConfig: encodeSessionPolicyConfig({
 *     // ≤ 100 USDC / week, only `transfer` on the token
 *     tokenLimits: [{ token: usdc, limit: parseUnits('100', 6), period: 7n * 86400n }],
 *     callScopes: [{ target: usdc, selectorRules: [{ selector: '0xa9059cbb' }] }],
 *   }),
 * })
 *
 * // 1) authorize in one transaction (sent by the account). The signed actor
 * //    change stores the commitment — that IS the authorization (no install).
 * const change = await account.change([
 *   authorizeActor(key.p256(pub), { scope: actorScope.sender, policy: session.actorPolicy }),
 * ])
 *
 * // 2) later, the session key spends within its limit
 * const spend = session.executeCall({ target: usdc, data: transferCalldata })
 */
export function defineSessionPolicy(
  parameters: DefineSessionPolicyParameters,
): SessionPolicy {
  const {
    account,
    policyConfig,
    policy = baseSepoliaDeployment.policies.sessionPolicy,
    manager = baseSepoliaDeployment.policies.manager,
    validAfter = 0n,
    validUntil = 0n,
    salt = 0n,
    policyType = 1,
  } = parameters

  if (policyType === 0)
    throw new BaseError('`policyType` must be non-zero (0 = no policy).')

  const binding: PolicyBinding = {
    account,
    policy,
    policyConfig,
    validAfter,
    validUntil,
    salt,
  }
  const commitment = commitmentOf(binding)

  return {
    manager,
    policy,
    binding,
    commitment,
    actorPolicy: { type: policyType, manager, commitment },
    executeCall(executionDataOrAction) {
      const executionData =
        typeof executionDataOrAction === 'string'
          ? executionDataOrAction
          : encodeSessionPolicyAction(executionDataOrAction)
      return {
        to: manager,
        value: 0n,
        data: encodeFunctionData({
          abi: policyManagerAbi,
          functionName: 'execute',
          args: [toBindingArgs(binding), executionData],
        }),
      }
    },
    executeForCall(executionDataOrAction) {
      const executionData =
        typeof executionDataOrAction === 'string'
          ? executionDataOrAction
          : encodeSessionPolicyAction(executionDataOrAction)
      return {
        to: manager,
        value: 0n,
        data: encodeFunctionData({
          abi: policyManagerAbi,
          functionName: 'executeFor',
          args: [toBindingArgs(binding), executionData],
        }),
      }
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SessionPolicy config + action encoders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reference `SessionPolicy` deployment address. Deterministic CREATE2, so it is
 * identical on every supported chain.
 */
export const sessionPolicyAddress = baseSepoliaDeployment.policies
  .sessionPolicy as Address

/** A per-token (or native-ETH) recurring / one-time spend cap. */
export type SessionPolicyTokenLimit = {
  /** ERC-20 token, or the zero address for native ETH (gated on each call's `value`). */
  token: Address
  /** Maximum spend per period (atomic units). One-time = total cap. Must fit `uint160`. */
  limit: bigint
  /** Period length in seconds. `0n` (default) = one-time (never resets). */
  period?: bigint | undefined
}

/** An allowed function selector on a {@link SessionPolicyCallScope} target. */
export type SessionPolicySelectorRule = {
  /** 4-byte function selector. */
  selector: Hex
  /**
   * Allowed recipients (empty/omitted = any). Only valid for the standard ERC-20
   * selectors (`transfer`, `transferFrom`, `approve`).
   */
  recipients?: readonly Address[] | undefined
}

/** A target contract and its allowed selector rules. */
export type SessionPolicyCallScope = {
  /** Target contract this binding may call. */
  target: Address
  /** Allowed selectors on `target` (empty/omitted = any selector, no recipient gating). */
  selectorRules?: readonly SessionPolicySelectorRule[] | undefined
}

/** The full committed `SessionPolicy` configuration for a binding. */
export type SessionPolicyConfig = {
  tokenLimits?: readonly SessionPolicyTokenLimit[] | undefined
  callScopes?: readonly SessionPolicyCallScope[] | undefined
}

/** A per-use `SessionPolicy` action: a single call the session key wants to make. */
export type SessionPolicyAction = {
  target: Address
  value?: bigint | undefined
  data?: Hex | undefined
}

const sessionConfigParameters = [
  {
    type: 'tuple',
    components: [
      {
        name: 'tokenLimits',
        type: 'tuple[]',
        components: [
          { name: 'token', type: 'address' },
          { name: 'limit', type: 'uint256' },
          { name: 'period', type: 'uint40' },
        ],
      },
      {
        name: 'callScopes',
        type: 'tuple[]',
        components: [
          { name: 'target', type: 'address' },
          {
            name: 'selectorRules',
            type: 'tuple[]',
            components: [
              { name: 'selector', type: 'bytes4' },
              { name: 'recipients', type: 'address[]' },
            ],
          },
        ],
      },
    ],
  },
] as const

const sessionActionParameters = [
  {
    type: 'tuple',
    components: [
      { name: 'target', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
  },
] as const

export type EncodeSessionPolicyConfigErrorType = EncodeAbiParametersErrorType

/**
 * Encodes a {@link SessionPolicyConfig} into the committed `policyConfig`:
 * `abi.encode(SessionPolicy.Config)`.
 */
export function encodeSessionPolicyConfig(config: SessionPolicyConfig): Hex {
  return encodeAbiParameters(sessionConfigParameters, [
    {
      tokenLimits: (config.tokenLimits ?? []).map((t) => ({
        token: t.token,
        limit: t.limit,
        period: Number(t.period ?? 0n),
      })),
      callScopes: (config.callScopes ?? []).map((s) => ({
        target: s.target,
        selectorRules: (s.selectorRules ?? []).map((r) => ({
          selector: r.selector,
          recipients: (r.recipients ?? []) as Address[],
        })),
      })),
    },
  ])
}

export type EncodeSessionPolicyActionErrorType = EncodeAbiParametersErrorType

/**
 * Encodes a {@link SessionPolicyAction} into the `executionData` passed to
 * {@link SessionPolicy.executeCall}: `abi.encode(SessionPolicy.Action)`.
 */
export function encodeSessionPolicyAction(action: SessionPolicyAction): Hex {
  return encodeAbiParameters(sessionActionParameters, [
    {
      target: action.target,
      value: action.value ?? 0n,
      data: action.data ?? '0x',
    },
  ])
}
