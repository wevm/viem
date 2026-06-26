import type { Address } from 'abitype'

import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { BaseError } from '../../../errors/base.js'
import type { Account } from '../../../types/account.js'
import type { BlockTag } from '../../../types/block.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { hexToBigInt } from '../../../utils/encoding/fromHex.js'
import { numberToHex } from '../../../utils/encoding/toHex.js'
import { aaTransactionType } from '../constants.js'
import type { AaAccountChange, AaCalls } from '../types/transaction.js'

/**
 * Authentication scheme an EIP-8130 actor uses to sign. The node prices the
 * authentication gas deterministically from the auth-blob shape, so declaring
 * the scheme lets `eth_estimateGas` charge the right amount without a real
 * signature.
 */
export type Eip8130AuthScheme = 'secp256k1' | 'p256' | 'webAuthn'

export type EstimateGas8130Parameters = {
  /**
   * Sender address. **Required** — the sender drives actor/policy resolution,
   * and the node returns `INVALID_PARAMS` for an EIP-8130 estimate without it.
   */
  from: Address

  // ── Simplified mode (no accountChanges/calls) ─────────────────────────────
  // The node synthesises stub auth blobs from the declared scheme. Use this
  // when the caller only needs to price a call from an already-deployed account
  // without knowing the full transaction shape.
  /** Target of the (representative) call being estimated. */
  to?: Address | undefined
  /** Calldata of the call being estimated. */
  data?: Hex | undefined
  /** Native value sent with the call. */
  value?: bigint | undefined
  /** Sender authentication scheme. Defaults to `secp256k1` on the node. */
  senderAuthScheme?: Eip8130AuthScheme | undefined
  /** Override the sender auth-payload byte length (otherwise scheme-derived). */
  senderAuthSize?: number | undefined

  // ── Full-body mode (accountChanges + calls) ────────────────────────────────
  // When `accountChanges` or `calls` is provided, the request is sent as a
  // full EIP-8130 tx body (sender + nonceKey + nonceSequence + accountChanges +
  // calls + metadata). The node routes this through the real EIP-8130 executor
  // simulation, which is required to correctly price account-creation
  // (`create` account-change) and per-phase call overhead. The simplified
  // `to`/`data`/`value`/`senderAuthScheme` fields are ignored in this mode.
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

  // ── Common ────────────────────────────────────────────────────────────────
  /** Optional sponsoring payer; priced into the estimate when set. */
  payer?: Address | undefined
  /** Payer authentication scheme. Defaults to `secp256k1` on the node. */
  payerAuthScheme?: Eip8130AuthScheme | undefined
  /** Override the payer auth-payload byte length (otherwise scheme-derived). */
  payerAuthSize?: number | undefined
  /** Block number to estimate against. */
  blockNumber?: bigint | undefined
  /** Block tag to estimate against. Defaults to `'pending'`. */
  blockTag?: BlockTag | undefined
}

export type EstimateGas8130ReturnType = bigint

/** Generous cap matching the node's `MAX_AUTH_SIZE`; rejects OOM-sized inputs. */
const maxAuthSize = 8_192

/**
 * Estimates gas for an EIP-8130 (`AA_TX_TYPE`) call via `eth_estimateGas`.
 *
 * Requires a node with the EIP-8130 `eth_estimateGas` extension
 * (base `feat(eip8130): add eth_estimateGas for 8130`). The estimate runs a
 * read-only `simulate` on the executor: no signature verification, no fee
 * settlement, all state reverted. It shares the pre-call pipeline
 * (account-change apply, auto-delegation, intrinsic gas) with the verifying
 * `execute` path, so the estimate cannot drift from real execution gas.
 *
 * Two request modes:
 *
 * **Simplified** — omit `accountChanges`/`calls`. The node synthesises stub
 * auth blobs from the declared `senderAuthScheme` and `senderAuthSize`.
 * Suitable for pricing individual calls from an already-deployed account.
 *
 * **Full-body** — supply `accountChanges` and/or `calls`. The request is sent
 * as a complete EIP-8130 tx body and routed through the real executor
 * simulation. Required to correctly price account-creation (`create`
 * account-change) and per-phase call overhead.
 *
 * Note: unlike standard `eth_estimateGas`, an EIP-8130 estimate returns the
 * charged gas **even when a phase reverts**, because a reverted EIP-8130 tx is
 * still included (nonce consumed, fee paid).
 */
export async function estimateGas8130<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: EstimateGas8130Parameters,
): Promise<EstimateGas8130ReturnType> {
  const {
    from,
    to,
    data,
    value,
    senderAuthScheme,
    senderAuthSize,
    accountChanges,
    calls,
    nonceKey = 0n,
    nonceSequence = 0,
    payer,
    payerAuthScheme,
    payerAuthSize,
    blockNumber,
    blockTag = 'pending',
  } = parameters

  if (!from)
    throw new BaseError(
      '`from` is required for an EIP-8130 gas estimate: the sender drives actor/policy resolution.',
    )

  for (const size of [senderAuthSize, payerAuthSize])
    if (size !== undefined && (size < 0 || size > maxAuthSize))
      throw new BaseError(
        `auth size ${size} out of range (0..=${maxAuthSize}).`,
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
      from,
      sender: from,
      nonceKey: Number(nonceKey),
      nonceSequence,
      expiry: 0,
      // Reasonable fee defaults — the estimate skips fee validation.
      maxFeePerGas: numberToHex(1_000_000_000n),
      maxPriorityFeePerGas: numberToHex(1_000_000n),
      // Large gas cap so the simulation isn't capped below real execution.
      gasLimit: 30_000_000,
      accountChanges: (accountChanges ?? []).map(serializeAccountChange),
      calls: (calls ?? [[{ to: from, value: 0n, data: '0x' as Hex }]]).map(
        (phase) =>
          phase.map((c) => ({
            to: c.to,
            value: numberToHex(c.value ?? 0n),
            data: c.data ?? '0x',
          })),
      ),
      metadata: '0x',
      payer: payer ?? null,
    }
    if (payerAuthScheme !== undefined) request.payerAuthScheme = payerAuthScheme
    if (payerAuthSize !== undefined)
      request.payerAuthSize = numberToHex(payerAuthSize)
  } else {
    // Simplified mode: let the node synthesise stub auth blobs from the scheme.
    request = {
      type: aaTransactionType,
      from,
    }
    if (to !== undefined) request.to = to
    if (data !== undefined) request.data = data
    if (value !== undefined) request.value = numberToHex(value)
    if (senderAuthScheme !== undefined)
      request.senderAuthScheme = senderAuthScheme
    if (senderAuthSize !== undefined)
      request.senderAuthSize = numberToHex(senderAuthSize)
    if (payer !== undefined) request.payer = payer
    if (payerAuthScheme !== undefined)
      request.payerAuthScheme = payerAuthScheme
    if (payerAuthSize !== undefined)
      request.payerAuthSize = numberToHex(payerAuthSize)
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
 * Converts a typed `AaAccountChange` to the plain JSON object the node's
 * `eth_estimateGas` deserialiser expects. For `create` changes, all fields are
 * passed through directly. For `delegation`, only `target` is required (the
 * node does not need the proxy bytecode for gas pricing). For `config`, the
 * full change is forwarded so the node can price the auth-blob calldata.
 */
function serializeAccountChange(
  change: AaAccountChange,
): Record<string, unknown> {
  if (change.type === 'create') {
    return {
      type: 'create',
      userSalt: change.userSalt,
      code: change.code,
      initialActors: change.initialActors.map((a) => ({
        actorId: a.actorId,
        authenticator: a.authenticator,
      })),
    }
  }
  if (change.type === 'delegation') {
    return { type: 'delegation', target: change.target }
  }
  // config: forward as-is; the node doesn't verify the auth in simulate mode
  // but does price its byte-length into the intrinsic gas.
  return {
    type: 'config',
    chainId: change.chainId,
    sequence: change.sequence,
    actorChanges: change.actorChanges,
    auth: change.auth,
  }
}
