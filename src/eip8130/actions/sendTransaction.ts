import { estimateFeesPerGas } from '../../actions/public/estimateFeesPerGas.js'
import { sendRawTransaction } from '../../actions/wallet/sendRawTransaction.js'
import { sendRawTransactionSync } from '../../actions/wallet/sendRawTransactionSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { BaseError } from '../../errors/base.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import { getAction } from '../../utils/getAction.js'
import type { ToAccountReturnType } from '../accounts/toAccount.js'
import { nonceFreeMaxExpiryWindow, nonceKeyMax } from '../constants.js'
import { NonceScopeError, ScopeMismatchError } from '../errors.js'
import { isNoncelessOnly } from '../keys.js'
import type {
  AaAccountChange,
  AaCall,
  AaCalls,
  TransactionSerializable8130,
} from '../types/transaction.js'
import {
  type EncodeExecute,
  encodeWalletCalls,
} from '../utils/encodeWalletCalls.js'
import type { Signer } from '../utils/signTransaction.js'
import { getActorConfig } from './getActorConfig.js'
import { getTransactionCount } from './getTransactionCount.js'
import {
  type GetTransactionReceiptReturnType,
  parseReceiptFields,
} from './getTransactionReceipt.js'
import { isActor } from './isActor.js'

type FeeOverrides = {
  maxFeePerGas?: bigint | undefined
  maxPriorityFeePerGas?: bigint | undefined
}

export type PrepareTransactionRequestParameters = FeeOverrides & {
  account: ToAccountReturnType
  /** Ordered call phases. */
  calls: AaCalls
  accountChanges?: readonly AaAccountChange[] | undefined
  payer?: { account: Signer; address?: `0x${string}` } | undefined
  /** Required gas budget (AA_TX_TYPE gas estimation is node-specific). */
  gas: bigint
  nonceKey?: bigint | undefined
  nonceSequence?: bigint | undefined
  /** Lower validity bound (unix ms; 0/omitted = none). */
  validAfter?: bigint | undefined
  /** Upper validity bound (unix ms; required non-zero in nonce-free mode). */
  validBefore?: bigint | undefined
  /**
   * "Now" (unix ms) used to auto-compute `validBefore` for a nonce-free
   * (expiring) send. Defaults to the client's wall clock (`Date.now()`). Pass
   * the chain's latest block timestamp (ms) to anchor the deadline to block
   * time when the client and chain clocks may differ. Ignored when
   * `validBefore` is set.
   */
  now?: bigint | undefined
  /**
   * Window (ms) added to `now` for the auto-computed `validBefore` on a
   * nonce-free send. Defaults to `nonceFreeMaxExpiryWindow` (20s). Ignored when
   * `validBefore` is set.
   */
  expiryWindow?: bigint | undefined
  /**
   * Attribution / opaque suffix. Written to the EIP-8130 `metadata` field
   * (not appended to call calldata). Takes precedence over `client.dataSuffix`.
   */
  dataSuffix?: Hex | undefined
}

/**
 * Resolves the signing actor's scope for nonce-mode selection.
 * On-chain config wins when the actor is bound; a declared handle `scope` is
 * only a fallback for pre-bind sends (create) and must match when both exist.
 */
async function resolveSigningScope(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  account: ToAccountReturnType,
): Promise<number | undefined> {
  const { actorId, scope: declared } = account
  if (!actorId) return declared

  const bound = await isActor(client, {
    account: account.address,
    actorId,
  })
  if (!bound) return declared

  const { scope: onChain } = await getActorConfig(client, {
    account: account.address,
    actorId,
  })
  if (declared !== undefined && declared !== onChain)
    throw new ScopeMismatchError({ declared, onChain })
  return onChain
}

/**
 * Builds a fully-populated {@link TransactionSerializable8130} for an
 * `AA_TX_TYPE` transaction, filling chain id, nonce sequence (via
 * `eth_getTransactionCount`'s 2D channel-nonce extension), and EIP-1559 fees
 * from the client when not provided.
 */
export async function prepareTransactionRequest(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: PrepareTransactionRequestParameters,
): Promise<TransactionSerializable8130> {
  const { account, calls, accountChanges, payer, gas } = parameters

  const chainId = client.chain?.id
  if (!chainId)
    throw new BaseError('`client` must be configured with a `chain`.')

  // EIP-8130 has no calldata to append to; `dataSuffix` maps to top-level
  // `metadata` so attribution remains authenticated with the signed body.
  const dataSuffix =
    parameters.dataSuffix ??
    (typeof client.dataSuffix === 'string'
      ? client.dataSuffix
      : client.dataSuffix?.value)

  // Scope-driven nonce mode: an actor may use a sequenced nonce key only if it
  // holds `SCOPE_NONCE`. Prefer chain truth (`getActorConfig`) over a redeclared
  // handle `scope` — drift between authorize-time and send-time declarations is
  // a live footgun. Fall back to the declared scope only when the actor is not
  // yet bound (e.g. the create tx).
  const scope = await resolveSigningScope(client, account)
  const noncelessOnly = scope !== undefined && isNoncelessOnly(scope)
  let nonceKey = parameters.nonceKey
  if (noncelessOnly) {
    if (nonceKey !== undefined && nonceKey !== nonceKeyMax)
      throw new NonceScopeError({ scope: scope!, nonceKey })
    nonceKey = nonceKeyMax
  } else {
    nonceKey ??= 0n
  }

  let validBefore = parameters.validBefore

  let { maxFeePerGas, maxPriorityFeePerGas } = parameters
  if (maxFeePerGas === undefined || maxPriorityFeePerGas === undefined) {
    const fees = await getAction(
      client,
      estimateFeesPerGas,
      'estimateFeesPerGas',
    )({ chain: client.chain })
    maxFeePerGas ??= fees.maxFeePerGas
    maxPriorityFeePerGas ??= fees.maxPriorityFeePerGas
  }

  // Resolve the sequence for the selected nonce channel.
  let nonceSequence = parameters.nonceSequence
  if (nonceKey === nonceKeyMax) {
    // Nonce-free (expiring) mode: there is no per-channel counter to read;
    // replay protection relies on `validBefore`. Pin the sequence to `0n`.
    // Default `validBefore` to the mempool admission window (unix ms) when the
    // caller did not supply one — whether nonce-free was auto-selected
    // (restricted actor) or explicitly chosen (admin / `SCOPE_NONCE` opting in).
    if (!validBefore || validBefore === 0n)
      validBefore =
        (parameters.now ?? BigInt(Date.now())) +
        (parameters.expiryWindow ?? nonceFreeMaxExpiryWindow)
    nonceSequence ??= 0n
  } else if (nonceSequence === undefined) {
    // Read the next sequence via `eth_getTransactionCount` (with the 2D
    // `nonce_key` extension). The Nonce Manager precompile is not callable via
    // `eth_call`, so this RPC path is the correct nonce source.
    nonceSequence = await getAction(
      client,
      getTransactionCount,
      'getTransactionCount',
    )({ address: account.address, nonceKey })
  }

  return {
    chainId,
    from: account.address,
    nonceKey,
    nonceSequence,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gas,
    validBefore,
    ...(parameters.validAfter !== undefined
      ? { validAfter: parameters.validAfter }
      : {}),
    accountChanges,
    calls,
    ...(dataSuffix ? { metadata: dataSuffix } : {}),
    payer: payer?.address ?? payer?.account.address,
  }
}

type SendTransactionBaseParameters = FeeOverrides & {
  account: ToAccountReturnType
  /**
   * Calls to execute. A flat list runs as a single atomic phase; pass a nested
   * array to control phases explicitly.
   */
  calls: readonly AaCall[] | AaCalls
  accountChanges?: readonly AaAccountChange[] | undefined
  payer?: { account: Signer; address?: `0x${string}` } | undefined
  gas: bigint
  nonceKey?: bigint | undefined
  nonceSequence?: bigint | undefined
  /** Lower validity bound (unix ms; 0/omitted = none). */
  validAfter?: bigint | undefined
  /** Upper validity bound (unix ms; required non-zero in nonce-free mode). */
  validBefore?: bigint | undefined
  /**
   * "Now" (unix ms) used to auto-compute `validBefore` for a nonce-free
   * (expiring) send. Defaults to the client's wall clock (`Date.now()`). Pass
   * the chain's latest block timestamp (ms) to anchor the deadline to block
   * time when the client and chain clocks may differ. Ignored when
   * `validBefore` is set.
   */
  now?: bigint | undefined
  /**
   * Window (ms) added to `now` for the auto-computed `validBefore` on a
   * nonce-free send. Defaults to `nonceFreeMaxExpiryWindow` (20s). Ignored when
   * `validBefore` is set.
   */
  expiryWindow?: bigint | undefined
  /**
   * Attribution / opaque suffix. Written to the EIP-8130 `metadata` field
   * (not appended to call calldata). Takes precedence over `client.dataSuffix`.
   */
  dataSuffix?: Hex | undefined
  /**
   * Encoder for value-bearing phases. Defaults to a self-call to the account's
   * `executeBatch`. Override when the wallet bytecode exposes a different
   * executor. See {@link encodeWalletCalls}.
   */
  encodeExecute?: EncodeExecute | undefined
  /**
   * Invoked with the fully-resolved transaction just before it is signed and
   * sent. Use it to thread the resolved `validBefore` (which may be auto-computed
   * for nonce-free sends) into `waitForTransactionReceipt` without re-preparing.
   */
  onTransaction?:
    | ((transaction: TransactionSerializable8130) => void)
    | undefined
}

export type SendTransactionParameters = SendTransactionBaseParameters

export type SendTransactionReturnType = Hex

function toPhases(calls: SendTransactionBaseParameters['calls']): AaCalls {
  if (calls.length === 0) return []
  // Already phased (array of arrays)?
  if (Array.isArray(calls[0])) return calls as AaCalls
  return [calls as readonly AaCall[]]
}

/**
 * Prepares, signs, and serializes an EIP-8130 (`AA_TX_TYPE`) transaction.
 * Shared by {@link sendTransaction} and {@link sendTransactionSync}.
 */
async function prepareAndSign(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: SendTransactionBaseParameters,
): Promise<Hex> {
  const { account, calls, payer, encodeExecute, onTransaction, ...rest } =
    parameters
  const transaction = await prepareTransactionRequest(client, {
    ...rest,
    account,
    calls: encodeWalletCalls({
      account: account.address,
      calls: toPhases(calls),
      encodeExecute,
    }),
    payer,
  })
  onTransaction?.(transaction)
  return account.signTransaction(transaction, { payer })
}

/**
 * Sends an EIP-8130 (`AA_TX_TYPE`) transaction for an account: prepares the
 * transaction body, signs `sender_auth` (and `payer_auth` when sponsored),
 * serializes, and submits via `eth_sendRawTransaction`.
 *
 * @example
 * const hash = await sendTransaction(client, {
 *   account,
 *   calls: [{ to, data }],
 *   gas: 200_000n,
 * })
 */
export async function sendTransaction(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: SendTransactionParameters,
): Promise<SendTransactionReturnType> {
  const serializedTransaction = await prepareAndSign(client, parameters)
  return getAction(
    client,
    sendRawTransaction,
    'sendRawTransaction',
  )({ serializedTransaction })
}

export type SendTransactionSyncParameters = SendTransactionBaseParameters & {
  /** Whether to throw if the transaction reverted. @default true */
  throwOnReceiptRevert?: boolean | undefined
  /** Timeout for the synchronous send (ms). */
  timeout?: number | undefined
}

export type SendTransactionSyncReturnType =
  NonNullable<GetTransactionReceiptReturnType>

/**
 * Sends an EIP-8130 (`AA_TX_TYPE`) transaction and waits for its receipt in a
 * single round-trip via `eth_sendRawTransactionSync` (EIP-7966). Returns the
 * receipt with the EIP-8130 fields (`payer`, `phaseStatuses`, `metadata`)
 * attached. Requires a node that supports synchronous sends.
 *
 * @example
 * const receipt = await sendTransactionSync(client, {
 *   account,
 *   calls: [{ to, data }],
 *   gas: 200_000n,
 * })
 * console.log(receipt.eip8130.phaseStatuses) // ['0x1']
 */
export async function sendTransactionSync(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: SendTransactionSyncParameters,
): Promise<SendTransactionSyncReturnType> {
  const { throwOnReceiptRevert, timeout, ...rest } = parameters
  const serializedTransaction = await prepareAndSign(client, rest)
  const receipt = await getAction(
    client,
    sendRawTransactionSync,
    'sendRawTransactionSync',
  )({ serializedTransaction, throwOnReceiptRevert, timeout })
  return { ...receipt, eip8130: parseReceiptFields(receipt as never) } as never
}
