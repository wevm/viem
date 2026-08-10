import type { Address } from 'abitype'

import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { BaseError } from '../../../errors/base.js'
import type { Account } from '../../../types/account.js'
import type { BlockTag } from '../../../types/block.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { concatHex } from '../../../utils/data/concat.js'
import { hexToBigInt } from '../../../utils/encoding/fromHex.js'
import { numberToHex } from '../../../utils/encoding/toHex.js'
import {
  aaTransactionType,
  canonicalAuthDataLength,
  changeType,
} from '../constants.js'
import type { AaAccountChange, AaCalls } from '../types/transaction.js'
import { encodeChangePayload } from '../utils/actorChangeData.js'

export type EstimateGasParameters = {
  /**
   * Sender address. **Required** (or {@link EstimateGasParameters.sender})
   * — the sender drives actor/policy resolution, and the node returns
   * `INVALID_PARAMS` for an EIP-8130 estimate without one.
   */
  from?: Address | undefined
  /**
   * The EIP-8130 sender account. Interchangeable with `from` — the two must
   * agree if both are set. Prefer this when you don't otherwise need `from`
   * (e.g. no plain-tx fallback), since it's the field the wire transaction
   * itself carries.
   */
  sender?: Address | undefined

  // ── Simplified mode (no accountChanges/calls) ─────────────────────────────
  // Use this when the caller only needs to price a call from an
  // already-deployed account without knowing the full transaction shape.
  /** Target of the (representative) call being estimated. */
  to?: Address | undefined
  /** Calldata of the call being estimated. */
  data?: Hex | undefined
  /** Native value sent with the call. */
  value?: bigint | undefined

  // ── Full-body mode (accountChanges + calls) ────────────────────────────────
  // When `accountChanges` or `calls` is provided, the request is sent as a
  // full EIP-8130 tx body (sender + nonceKey + nonceSequence + accountChanges +
  // calls + metadata). The node routes this through the real EIP-8130 executor
  // simulation, which is required to correctly price account-creation
  // (`create` account-change) and per-phase call overhead. The simplified
  // `to`/`data`/`value` fields are ignored in this mode.
  /**
   * Account-change operations included in the transaction (e.g. `create` for
   * new smart-account deployment). Pass an empty array for follow-up txs on an
   * already-deployed account.
   */
  accountChanges?: readonly AaAccountChange[] | undefined
  /**
   * Phased calls array (each inner array is one phase / `executeBatch` call).
   * Typically a single phase: `[[{ to, value, data }]]`.
   */
  calls?: AaCalls | undefined
  /**
   * 2-D nonce key. Defaults to `0n`. Only relevant when the account has
   * multiple open channels; leave as default for single-channel accounts.
   */
  nonceKey?: bigint | undefined
  /**
   * Nonce sequence within `nonceKey`. Defaults to `0` (first tx / deploy).
   * Pass the account's current sequence for follow-up-tx estimation.
   */
  nonceSequence?: number | undefined

  // ── Sender authentication ───────────────────────────────────────────────
  // The node prices authentication gas from the *shape* of the auth blob it
  // is given, exactly as it would from a real signature — so declaring the
  // right shape here (without signing) gets an accurate estimate. Provide
  // exactly one of the following (in priority order if more than one is set):
  /**
   * The full raw `senderAuth` blob to price verbatim: `authenticator(20) ||
   * data` for a configured account, or a bare signature for the default EOA.
   * Use when you already have (or want full control over) the exact blob.
   */
  senderAuth?: Hex | undefined
  /**
   * Authenticator (authenticator contract) address hint. The blob is synthesized
   * as `authenticator || filler`, where `filler` is `senderAuthSize` bytes if
   * given, else a representative default length for known canonical
   * authenticators ({@link canonicalAuthenticators}) — pass `senderAuthSize`
   * explicitly for a custom authenticator with no known default.
   */
  senderAuthAuthenticator?: Address | undefined
  /**
   * Sender auth-payload byte length. Combined with `senderAuthAuthenticator`, it
   * overrides the authenticator's default length. Alone (no authenticator), it prices a
   * bare (unprefixed, default-EOA-path) filler blob of this length.
   */
  senderAuthSize?: number | undefined
  /**
   * Acting-actor hint for simulation. Estimation never recovers a signature, so
   * without this the node publishes the account's self-actor to the `TxContext`
   * precompile — which makes policy-gated session-key calls look up the wrong
   * policy and revert. Pass the session (or other non-self) actor id you intend
   * to sign with; the node resolves that actor's policy after applying
   * `accountChanges`, so an actor authorized in the same estimate request is
   * visible. Orthogonal to {@link EstimateGasParameters.senderAuthAuthenticator}
   * (auth-gas pricing) — accept both when estimating a session-key send.
   */
  senderActorId?: Hex | undefined

  // ── Common ────────────────────────────────────────────────────────────────
  /** Optional sponsoring payer; priced into the estimate when set. */
  payer?: Address | undefined
  /**
   * The full raw `payerAuth` blob to price verbatim (always the prefixed
   * `authenticator(20) || data` form). See `senderAuth`.
   */
  payerAuth?: Hex | undefined
  /** Payer authenticator address hint. See `senderAuthAuthenticator`. */
  payerAuthAuthenticator?: Address | undefined
  /** Payer auth-payload byte length override. See `senderAuthSize`. */
  payerAuthSize?: number | undefined
  /**
   * Attribution / opaque suffix. Written to the EIP-8130 `metadata` field in
   * full-body mode (not appended to call calldata). Takes precedence over
   * `client.dataSuffix`.
   */
  dataSuffix?: Hex | undefined
  /** Block number to estimate against. */
  blockNumber?: bigint | undefined
  /** Block tag to estimate against. Defaults to `'pending'`. */
  blockTag?: BlockTag | undefined
}

export type EstimateGasReturnType = bigint

/** Generous cap matching the node's `MAX_AUTH_SIZE`; rejects OOM-sized inputs. */
const maxAuthSize = 8_192

/**
 * Estimates gas for an EIP-8130 (`AA_TX_TYPE`) call via `eth_estimateGas`.
 *
 * Requires a node with the EIP-8130 `eth_estimateGas` extension
 * (base `feat(eip8130-rpc): price estimateGas from raw sender/payer auth
 * blobs`). The estimate runs a read-only `simulate` on the executor: no
 * signature verification, no fee settlement, all state reverted. It shares
 * the pre-call pipeline (account-change apply, auto-delegation, intrinsic
 * gas) with the verifying `execute` path, so the estimate cannot drift from
 * real execution gas.
 *
 * Two request modes:
 *
 * **Simplified** — omit `accountChanges`/`calls`. Suitable for pricing
 * individual calls from an already-deployed account.
 *
 * **Full-body** — supply `accountChanges` and/or `calls`. The request is sent
 * as a complete EIP-8130 tx body and routed through the real executor
 * simulation. Required to correctly price account-creation (`create`
 * account-change) and per-phase call overhead.
 *
 * In both modes, the node prices authentication gas from the auth blob's
 * *shape*, never a real signature — pass `senderAuthAuthenticator` (or a raw
 * `senderAuth`) for a configured account, and leave both unset for the
 * default EOA. For policy-gated actors (session keys), also pass
 * `senderActorId` so the simulate path publishes the intended acting actor
 * instead of the account's self-actor. See {@link EstimateGasParameters}.
 *
 * Note: an EIP-8130 estimate that reverts a phase surfaces the revert (like
 * standard `eth_estimateGas`), even though a reverted EIP-8130 tx would still
 * be included onchain (nonce consumed, fee paid).
 */
export async function estimateGas<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: EstimateGasParameters,
): Promise<EstimateGasReturnType> {
  const {
    from,
    sender,
    to,
    data,
    value,
    senderAuth: senderAuthExplicit,
    senderAuthAuthenticator,
    senderAuthSize,
    senderActorId,
    accountChanges,
    calls,
    nonceKey = 0n,
    nonceSequence = 0,
    payer,
    payerAuth: payerAuthExplicit,
    payerAuthAuthenticator,
    payerAuthSize,
    dataSuffix: dataSuffixParam,
    blockNumber,
    blockTag = 'pending',
  } = parameters

  const dataSuffix =
    dataSuffixParam ??
    (typeof client.dataSuffix === 'string'
      ? client.dataSuffix
      : client.dataSuffix?.value)

  const account_ = sender ?? from
  if (!account_)
    throw new BaseError(
      '`sender` (or `from`) is required for an EIP-8130 gas estimate: the sender drives actor/policy resolution.',
    )
  if (sender && from && sender !== from)
    throw new BaseError(
      `\`sender\` (${sender}) and \`from\` (${from}) must agree when both are set.`,
    )

  for (const size of [senderAuthSize, payerAuthSize])
    if (size !== undefined && (size < 0 || size > maxAuthSize))
      throw new BaseError(
        `auth size ${size} out of range (0..=${maxAuthSize}).`,
      )

  const senderAuth = buildAuthBlob(
    senderAuthExplicit,
    senderAuthAuthenticator,
    senderAuthSize,
  )
  const payerAuth = buildAuthBlob(
    payerAuthExplicit,
    payerAuthAuthenticator,
    payerAuthSize,
  )

  const useFullBody = accountChanges !== undefined || calls !== undefined

  let request: Record<string, unknown>

  if (useFullBody) {
    // Full-body mode: send the complete EIP-8130 tx body so the node routes
    // through the real executor simulation (required for create estimation).
    // nonceKey / nonceSequence use integers (not hex) per the node's JSON
    // deserialiser (expects u64, not a hex string).
    request = {
      type: aaTransactionType,
      sender: account_,
      nonceKey: Number(nonceKey),
      nonceSequence,
      validAfter: 0,
      validBefore: 0,
      // Reasonable fee defaults — the estimate skips fee validation.
      maxFeePerGas: numberToHex(1_000_000_000n),
      maxPriorityFeePerGas: numberToHex(1_000_000n),
      // Large gas cap so the simulation isn't capped below real execution.
      gasLimit: 30_000_000,
      accountChanges: (accountChanges ?? []).map(serializeAccountChange),
      calls: (calls ?? [[{ to: account_, value: 0n, data: '0x' as Hex }]]).map(
        (phase) =>
          phase.map((c) => ({
            to: c.to,
            value: numberToHex(c.value ?? 0n),
            data: c.data ?? '0x',
          })),
      ),
      metadata: dataSuffix ?? '0x',
      payer: payer ?? null,
    }
    if (senderAuth !== undefined) request.senderAuth = senderAuth
    if (payerAuth !== undefined) request.payerAuth = payerAuth
    if (senderActorId !== undefined) request.senderActorId = senderActorId
  } else {
    // Simplified mode. `sender` is always set so the node recognizes the
    // request as an EIP-8130 estimate even when no auth blob is supplied
    // (an absent auth blob is a valid default-EOA/configured-k1 request, not
    // an indication this is a plain, non-8130 request).
    request = {
      type: aaTransactionType,
      sender: account_,
    }
    if (to !== undefined) request.to = to
    if (data !== undefined) request.data = data
    if (value !== undefined) request.value = numberToHex(value)
    if (payer !== undefined) request.payer = payer
    if (senderAuth !== undefined) request.senderAuth = senderAuth
    if (payerAuth !== undefined) request.payerAuth = payerAuth
    if (senderActorId !== undefined) request.senderActorId = senderActorId
  }

  const block = blockNumber !== undefined ? numberToHex(blockNumber) : blockTag

  const gas = await (
    client.request as (args: {
      method: 'eth_estimateGas'
      params: [Record<string, unknown>, string]
    }) => Promise<Hex>
  )({ method: 'eth_estimateGas', params: [request, block] })

  return hexToBigInt(gas)
}

/**
 * Builds the raw `senderAuth`/`payerAuth` blob to price, in priority order:
 *
 * 1. `explicit` — pass the caller's raw blob through verbatim.
 * 2. `authenticator` set — synthesize `authenticator || filler`, where `filler` is
 *    `size` bytes if given, else the authenticator's known default length
 *    ({@link canonicalAuthDataLength}). Throws if neither is available.
 * 3. `size` alone (no authenticator) — a bare (unprefixed) filler blob of `size`
 *    bytes, pricing the default-EOA path at a specific length.
 * 4. All unset — `undefined` (no auth blob on the request; the node applies
 *    its own default).
 *
 * The filler byte (`0xff`) is arbitrary but non-zero, so its EIP-2028
 * calldata cost matches a real (high-entropy) signature rather than
 * under-pricing it as zero bytes. It is never recovered — the estimate prices
 * shape only, never verifies a signature.
 */
function buildAuthBlob(
  explicit: Hex | undefined,
  authenticator: Address | undefined,
  size: number | undefined,
): Hex | undefined {
  if (explicit !== undefined) return explicit
  if (authenticator === undefined) {
    if (size === undefined) return undefined
    return filler(size)
  }
  const dataLength =
    size ?? canonicalAuthDataLength[authenticator.toLowerCase()]
  if (dataLength === undefined)
    throw new BaseError(
      `No default auth-payload length is known for authenticator ${authenticator}. Pass an explicit auth size.`,
    )
  return concatHex([authenticator, filler(dataLength)])
}

function filler(length: number): Hex {
  return `0x${'ff'.repeat(length)}` as Hex
}

/**
 * Converts a typed `AaAccountChange` to the plain JSON object the node's
 * `eth_estimateGas` deserialiser expects. For `create` changes, all fields are
 * passed through directly. For `delegation`, only `target` is required (the
 * node does not need the proxy bytecode for gas pricing). For `config`, the
 * node tags the variant as `configChange` and expects the `SignedAccountChanges`
 * batch shape (`channel` / `sequence` / `changes[{changeType, payload}]` /
 * `signature`) — the ABI-encoded opaque `payload`, not the typed fields.
 */
function serializeAccountChange(
  change: AaAccountChange,
): Record<string, unknown> {
  if (change.type === 'create') {
    return {
      type: 'create',
      userSalt: change.userSalt,
      code: change.code,
      // The node deserializes each entry directly into the consensus
      // `InitialActor` struct, whose `scope` and `policyData` fields are
      // non-optional with no serde default — omitting them makes the whole
      // `eth_estimateGas` request fail deserialization with `-32602 invalid
      // params` before it ever reaches the estimator. Always send both, with
      // the same defaults used for address derivation: `scope` as a JSON
      // NUMBER (u8; 0 = unrestricted admin), and `policyData` as hex bytes
      // (`0x` unless `scope & SCOPE_POLICY`, then `manager || commitment`).
      initialActors: change.initialActors.map((a) => ({
        actorId: a.actorId,
        authenticator: a.authenticator,
        scope: a.scope ?? 0,
        policyData: a.policyData ?? '0x',
      })),
    }
  }
  if (change.type === 'delegation') {
    return { type: 'delegation', target: change.target }
  }
  // config → RPC tag `configChange`. Simulate does not verify the signature, but
  // still prices the batch's byte-length into intrinsic gas and applies it. The
  // node deserializes the consensus `SignedAccountChanges` (serde camelCase),
  // whose `channel` / `changeType` are the enum variant names.
  const changeTypeName: Record<number, string> = {
    [changeType.authorizeActor]: 'AuthorizeActor',
    [changeType.revokeActor]: 'RevokeActor',
    [changeType.incrementLocalEpoch]: 'IncrementLocalEpoch',
    [changeType.lock]: 'Lock',
    [changeType.unlock]: 'Unlock',
  }
  return {
    type: 'configChange',
    channel: change.channel === 'multichain' ? 'Multichain' : 'Local',
    sequence: Number(change.sequence),
    changes: change.changes.map((c) => ({
      changeType: changeTypeName[c.changeType],
      payload: encodeChangePayload(c),
    })),
    signature: change.signature,
  }
}
