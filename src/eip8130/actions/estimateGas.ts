import type { Address } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { zeroAddress } from '../../constants/address.js'
import { BaseError } from '../../errors/base.js'
import type { Account } from '../../types/account.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import { concatHex } from '../../utils/data/concat.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import {
  aaTransactionType,
  k1AuthDataLength,
  k1Authenticator,
  openPayer,
} from '../constants.js'
import type {
  AaAccountChange,
  AaCall,
  AaCalls,
  AaPayer,
} from '../types/transaction.js'
import { toRpcAccountChange } from '../utils/rpcAccountChanges.js'
import { toPhases } from '../utils/toPhases.js'

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
  // already-deployed account without knowing the full transaction shape. The
  // call is sent as a single-call phase: the node builds calls only from
  // `calls` and ignores a top-level `to`/`data`/`value`.
  /** Target of the (representative) call being estimated. */
  to?: Address | undefined
  /** Calldata of the call being estimated. */
  data?: Hex | undefined
  /** Native value sent with the call. */
  value?: bigint | undefined

  // ── Full-body mode (accountChanges + calls) ────────────────────────────────
  // When `accountChanges` or `calls` is provided, the request is sent as a
  // full EIP-8130 tx body (sender + nonceKey + accountChanges + calls +
  // metadata). The node routes this through the real EIP-8130 executor
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
   * Calls to price. A flat list (`[{ to, value, data }]`) is treated as a
   * single atomic phase; pass a nested array (`[[…], […]]`) to price explicit
   * phases. Matches the `calls` shape accepted by `sendTransaction`.
   */
  calls?: readonly AaCall[] | AaCalls | undefined
  /**
   * 2-D nonce key. Defaults to `0n`. Only relevant when the account has
   * multiple open channels; leave as default for single-channel accounts.
   */
  nonceKey?: bigint | undefined
  /**
   * Lower validity bound (unix seconds or milliseconds). Only affects the
   * estimate through its calldata cost.
   */
  validAfter?: bigint | undefined
  /**
   * Upper validity bound (unix seconds or milliseconds). Pass the deadline you
   * will sign with (required for nonce-free sends) so its calldata is priced.
   */
  validBefore?: bigint | undefined

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
   * Authenticator address hint. The blob is synthesized as
   * `authenticator || filler`, where `filler` is `senderAuthSize` bytes if
   * given, else 65 bytes for `K1_AUTHENTICATOR`. Pass `senderAuthSize` for any
   * other (Keystore) authenticator.
   */
  senderAuthAuthenticator?: Address | undefined
  /**
   * Sender auth-payload byte length. Combined with `senderAuthAuthenticator`, it
   * overrides the authenticator's default length. Alone (no authenticator), it prices a
   * bare (unprefixed, default-EOA-path) filler blob of this length, which the
   * node only accepts at 65 bytes.
   */
  senderAuthSize?: number | undefined
  /**
   * EIP-8130 Keystore integration: the sender actor to simulate. Estimation
   * never recovers a signature, so without this the node simulates the
   * account's own secp256k1 key. Pass a session (or other non-self) actor id so
   * scope checks and the policy gate apply as they would for the real send.
   * The node resolves it after applying `accountChanges`, so an actor
   * authorized in the same request is visible.
   */
  senderActorId?: Hex | undefined

  // ── Common ────────────────────────────────────────────────────────────────
  /**
   * Optional sponsoring payer (an address, or `openPayer` for open mode);
   * priced into the estimate when set.
   */
  payer?: AaPayer | undefined
  /**
   * The full raw `payerAuth` blob to price verbatim: `authenticator(20) || data`
   * for a named payer, or a bare 65-byte signature in open mode.
   */
  payerAuth?: Hex | undefined
  /** Payer authenticator address hint. See `senderAuthAuthenticator`. */
  payerAuthAuthenticator?: Address | undefined
  /** Payer auth-payload byte length override. See `senderAuthSize`. */
  payerAuthSize?: number | undefined
  /**
   * Attribution / opaque suffix. Written to the EIP-8130 `metadata` field
   * (not appended to call calldata). Takes precedence over
   * `client.dataSuffix`.
   */
  dataSuffix?: Hex | undefined
  /**
   * Fee fields of the transaction being priced. The node does not validate
   * them, but their encoded length is part of the priced transaction bytes,
   * so pass the fees you will sign with. Defaults to the largest 8-byte value
   * so the estimate never undercounts the real fee fields.
   */
  maxFeePerGas?: bigint | undefined
  /** See `maxFeePerGas`. */
  maxPriorityFeePerGas?: bigint | undefined
  /** Block number to estimate against. */
  blockNumber?: bigint | undefined
  /** Block tag to estimate against. Defaults to `'pending'`. */
  blockTag?: BlockTag | undefined
}

export type EstimateGasReturnType = bigint

/** Generous cap matching the node's `MAX_AUTH_SIZE`; rejects OOM-sized inputs. */
const maxAuthSize = 8_192

/** Placeholder fee when the caller has not resolved fees yet (`2^64 - 1`). */
const placeholderFee = 0xffff_ffff_ffff_ffffn

/**
 * Estimates gas for an AA (`AA_TX_TYPE`) call via `eth_estimateGas`.
 *
 * Requires a node with the AA transaction `eth_estimateGas` extension. The
 * estimate runs a read-only simulation: no signature verification, no fee
 * settlement, all state reverted. It shares the pre-call pipeline
 * (account-change apply, intrinsic gas) with real execution, so the estimate
 * cannot drift from execution gas.
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
 * *shape*, never a real signature. Leave the auth fields unset for the default
 * secp256k1 key. With the EIP-8130 Keystore, pass `senderAuthAuthenticator` +
 * `senderAuthSize` (or a raw `senderAuth`) and `senderActorId` for a non-self
 * actor. See {@link EstimateGasParameters}.
 *
 * Note: an estimate that reverts a phase surfaces the revert (like standard
 * `eth_estimateGas`), even though a reverted AA tx would still be included
 * onchain (nonce consumed, fee paid).
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
    validAfter,
    validBefore,
    payer,
    payerAuth: payerAuthExplicit,
    payerAuthAuthenticator,
    payerAuthSize,
    dataSuffix: dataSuffixParam,
    maxFeePerGas = placeholderFee,
    maxPriorityFeePerGas = placeholderFee,
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
  const payerAuth =
    payer === openPayer &&
    payerAuthExplicit === undefined &&
    payerAuthAuthenticator === undefined &&
    payerAuthSize === undefined
      ? openPayerAuthStub
      : buildAuthBlob(payerAuthExplicit, payerAuthAuthenticator, payerAuthSize)

  const useFullBody = accountChanges !== undefined || calls !== undefined

  const request: Record<string, unknown> = {
    type: aaTransactionType,
    sender: account_,
    nonceKey: numberToHex(nonceKey),
  }
  if (validAfter !== undefined) request.validAfter = numberToHex(validAfter)
  if (validBefore !== undefined) request.validBefore = numberToHex(validBefore)

  const phases: AaCalls | undefined = useFullBody
    ? calls !== undefined
      ? toPhases(calls)
      : [[{ to: account_, data: '0x' }]]
    : to !== undefined
      ? [[{ to, value, data }]]
      : undefined
  if (phases)
    request.calls = phases.map((phase) =>
      phase.map((c) => ({
        to: c.to,
        value: numberToHex(c.value ?? 0n),
        data: c.data ?? '0x',
      })),
    )

  if (useFullBody) {
    // Full-body mode: send the complete EIP-8130 tx body so the node routes
    // through the real executor simulation (required for create estimation).
    request.accountChanges = (accountChanges ?? []).map(toRpcAccountChange)
    request.metadata = dataSuffix ?? '0x'
  } else if (dataSuffix !== undefined) request.metadata = dataSuffix
  request.maxFeePerGas = numberToHex(maxFeePerGas)
  request.maxPriorityFeePerGas = numberToHex(maxPriorityFeePerGas)

  if (payer !== undefined) request.payer = toRpcPayer(payer)
  if (senderAuth !== undefined) request.senderAuth = senderAuth
  if (payerAuth !== undefined) request.payerAuth = payerAuth
  if (senderActorId !== undefined) request.senderActorId = senderActorId

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
 * A valid secp256k1 signature (key `1` over the zero hash). An open payer is
 * recovered from a supplied `payer_auth`, so a filler blob that does not
 * recover is rejected; any recoverable signature prices the same.
 */
const openPayerAuthStub =
  '0xa0b37f8fba683cc68f6574cd43b39f0343a50008bf6ccea9d13231d9e7e2e1e411edc8d307254296264aebfc3dc76cd8b668373a072fd64665b50000e9fcce521c' as const

/** JSON-RPC carries open payer mode as the zero address (the wire uses `0x00`). */
function toRpcPayer(payer: AaPayer | undefined): Address | undefined {
  return payer === openPayer ? zeroAddress : payer
}

/**
 * Builds the raw `senderAuth`/`payerAuth` blob to price, in priority order:
 *
 * 1. `explicit` — pass the caller's raw blob through verbatim.
 * 2. `authenticator` set — synthesize `authenticator || filler`, where `filler` is
 *    `size` bytes if given, else 65 bytes for `K1_AUTHENTICATOR`. Throws for
 *    any other authenticator without a size.
 * 3. `size` alone (no authenticator) — a bare (unprefixed) filler blob of `size`
 *    bytes for the default-EOA path. The node only accepts a 65-byte bare
 *    signature, so any other size is rejected.
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
    size ??
    (authenticator.toLowerCase() === k1Authenticator
      ? k1AuthDataLength
      : undefined)
  if (dataLength === undefined)
    throw new BaseError(
      `No default auth-payload length is known for authenticator ${authenticator}. Pass an explicit auth size (see \`canonicalAuthDataLength\` in \`viem/experimental/keystore\`).`,
    )
  return concatHex([authenticator, filler(dataLength)])
}

function filler(length: number): Hex {
  return `0x${'ff'.repeat(length)}` as Hex
}
