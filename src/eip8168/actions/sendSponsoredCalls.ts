import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { AaAccount } from '../../eip8130/accounts/types.js'
import { prepareTransactionRequest } from '../../eip8130/actions/sendTransaction.js'
import {
  nonceFreeDefaultExpiryWindow,
  nonceKeyMax,
} from '../../eip8130/constants.js'
import type {
  AaAccountChange,
  AaCall,
  AaCalls,
  TransactionSerializable8130,
  TransactionSerialized8130,
} from '../../eip8130/types/transaction.js'
import { serializeTransaction } from '../../eip8130/utils/serializeTransaction.js'
import { BaseError } from '../../errors/base.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import type { PayerClient } from '../client.js'
import type {
  GetTermsReturnType,
  PayerRejectedData,
  PayerSendTransactionReturnType,
} from '../types.js'
import {
  encodePayment,
  requiredPaymentAmount,
  selectPaymentOption,
} from '../utils/buildSponsoredCalls.js'
import { parsePayerError } from '../utils/parsePayerError.js'

/**
 * Passed to {@link SendSponsoredCallsParameters.confirmRetry} before each
 * re-sign. Carries the recoverable rejection (`reason`) and the concrete change
 * the next attempt will make, so the wallet can show the user exactly what
 * they're reconfirming (a higher token charge, or a higher gas limit).
 */
export type ResignRequest = {
  /** The parsed payer rejection that triggered the re-sign. */
  reason: PayerRejectedData
  /** 0-based index of the attempt that failed (the retry will be `attempt + 1`). */
  attempt: number
} & (
  | {
      /** Phase-0 token transfer is being corrected (`PAYMENT_INSUFFICIENT`). */
      kind: 'requote'
      token: Address | 'native'
      /** The new phase-0 transfer amount the user would pay. */
      paymentAmount: bigint
      feeRecipient: Address
    }
  | {
      /** Gas limit is being raised (`GAS_TOO_LOW`). */
      kind: 'gas'
      /** The new `gasLimit` the next attempt will sign over. */
      gasLimit: bigint
      /** The re-priced phase-0 amount at the new `gasLimit`, when paying with a token. */
      paymentAmount?: bigint | undefined
    }
)

export type SendSponsoredCallsParameters = {
  /** The sending account (signs `sender_auth`). */
  account: AaAccount
  /** Payer service client (ERC-8168). */
  payerClient: PayerClient
  /** User's intended calls (run in the final phase). */
  calls: readonly AaCall[]
  /**
   * Account changes (create / authorize / revoke / delegate) applied before the
   * calls, in the same sponsored transaction. Use this for a sponsored deploy or
   * a sponsored session-key authorize. The payer's gas estimate covers `calls`
   * only; if the added changes push gas past the quote, the payer's `GAS_TOO_LOW`
   * re-quote raises it (gated by `confirmRetry`), or pass an explicit `gas`.
   */
  accountChanges?: readonly AaAccountChange[] | undefined
  /**
   * `"send"` (default) asks the payer to co-sign and submit; `"sign"` asks the
   * payer for its `payer_auth` and returns the fully signed transaction for the
   * wallet to submit. For a named sender, `"sign"` asks the payer BEFORE the
   * sender signs, so a payer rejection never costs the user a signature. A
   * `"sign"` request is only made when the selected offer lists
   * `payer_signTransaction` in its (additive) `methods`.
   */
  mode?: 'send' | 'sign' | undefined
  /** Pre-fetched terms. When omitted, `payer_getTerms` is called. */
  terms?: GetTermsReturnType | undefined
  /** Prefer token payment with this token (or `"native"`). Defaults to a selectable sponsored offer. */
  token?: Address | 'native' | undefined
  /** Opaque app context forwarded to `payer_*` calls (e.g. `policyId`). */
  context?: Record<string, unknown> | undefined
  /**
   * Override the transaction's upper validity bound (`validBefore`) as an
   * absolute Unix timestamp in **milliseconds**. When omitted, the selected
   * offer's `conditions.maxExpiry` (a relative duration in seconds) is applied:
   * `now + maxExpiry * 1000`. With no `maxExpiry`, it is `0` (no
   * protocol-enforced lifetime) — unless the send is nonce-free, in which case
   * the mempool admission window is used (a nonce-free tx MUST carry a
   * non-zero `validBefore`).
   */
  validBefore?: bigint | undefined
  /** Override gas (defaults to the terms' top-level `gasEstimate.gasLimit`). */
  gas?: bigint | undefined
  maxFeePerGas?: bigint | undefined
  maxPriorityFeePerGas?: bigint | undefined
  nonceKey?: bigint | undefined
  nonceSequence?: bigint | undefined
  /**
   * Upper bound on re-signs after a recoverable payer rejection
   * (`PAYMENT_INSUFFICIENT` → re-sign phase 0 from `requote`; `GAS_TOO_LOW` →
   * raise `gasLimit` to `minGasLimit`), to avoid looping on a degraded payer.
   * Only takes effect when `confirmRetry` approves each re-sign. Default `2`.
   */
  retries?: number | undefined
  /**
   * Gate for every re-sign. Re-signing produces a NEW `sender_auth` over the
   * corrected fields — and for an interactive sender (passkey/WebAuthn) a fresh
   * user gesture — so a retry MUST be reconfirmed, never silent. Called with the
   * proposed change ({@link ResignRequest}); return `true` to proceed.
   *
   * When omitted, the action does NOT retry: the rejection is thrown for the
   * caller to handle (decode with `parsePayerError`). This makes "reconfirm
   * before the second signature" the default — there is no auto-resign path.
   */
  confirmRetry?: (request: ResignRequest) => boolean | Promise<boolean>
  /**
   * Invoked with the fully-resolved transaction just before each submit attempt
   * (before `payer_sendTransaction` / `payer_signTransaction`). Use it to thread
   * the resolved `validBefore` — which is auto-computed here from the offer's
   * `maxExpiry` (or the nonce-free window) when not overridden — into
   * `waitForTransactionReceipt` without re-deriving it:
   *
   * ```ts
   * let validBefore: bigint | undefined
   * await sendSponsoredCalls(client, {
   *   ...params,
   *   onTransaction: (tx) => { validBefore = tx.validBefore },
   * })
   * ```
   *
   * On a re-signed retry it fires again with the corrected transaction, so the
   * final invocation reflects the transaction that was actually submitted.
   */
  onTransaction?:
    | ((transaction: TransactionSerializable8130) => void)
    | undefined
}

/** Return of a `"sign"`-mode {@link sendSponsoredCalls}. */
export type SendSponsoredCallsSignReturnType = {
  /** The payer's `payer_auth`, as returned by `payer_signTransaction`. */
  payerAuth: Hex
  /** The fully signed transaction, ready for `eth_sendRawTransaction`. */
  signedTransaction: TransactionSerialized8130
}

export type SendSponsoredCallsReturnType =
  | PayerSendTransactionReturnType
  | SendSponsoredCallsSignReturnType

/**
 * End-to-end ERC-8168 sponsored-transaction flow:
 *
 * 1. Fetch terms (`payer_getTerms`) unless provided.
 * 2. Select an offer (and token choice).
 * 3. Prepare the EIP-8130 transaction (nonce, gas from the offer's estimate),
 *    pricing a token offer's phase-0 payment at the transaction's own
 *    `max_cost` from the choice's `rate`.
 * 4. `"send"`: sign `sender_auth` with `payer` set and `payer_auth` empty, and
 *    hand it to `payer_sendTransaction`, which co-signs and submits.
 * 5. `"sign"`: get `payer_auth` from `payer_signTransaction`, sign
 *    `sender_auth` with it in place, and return the signed transaction.
 *
 * @example
 * const { transactionHash } = await sendSponsoredCalls(client, {
 *   account,
 *   payerClient,
 *   calls: [{ to, data }],
 * })
 */
export async function sendSponsoredCalls(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: SendSponsoredCallsParameters,
): Promise<SendSponsoredCallsReturnType> {
  const {
    account,
    payerClient,
    calls,
    accountChanges,
    mode = 'send',
    token,
    context,
    retries = 2,
    confirmRetry,
    onTransaction,
  } = parameters

  const chainId = client.chain?.id
  if (!chainId)
    throw new BaseError('`client` must be configured with a `chain`.')

  const terms =
    parameters.terms ??
    (await payerClient.getTerms({
      chainId: numberToHex(chainId),
      from: account.address,
      calls: calls.map((call) => ({
        to: call.to,
        data: call.data ?? '0x',
        ...(call.value ? { value: numberToHex(call.value) } : {}),
      })),
      ...(token ? { preferredTokens: [token] } : {}),
      ...(context ? { context } : {}),
    }))

  const { option, tokenChoice } = selectPaymentOption(terms, { token })
  const feeRecipient = tokenChoice?.feeRecipient ?? option.payer

  // `methods` is additive over the implied required pair (getTerms + send).
  // `payer_signTransaction` is available only when explicitly listed.
  if (mode === 'sign' && !option.methods?.includes('payer_signTransaction'))
    throw new BaseError(
      'Selected offer does not advertise `payer_signTransaction`; use `mode: "send"` or pick an offer whose `methods` includes it.',
    )

  // Recommended gas params are shared at the top level of the terms response.
  const gasEstimate = terms.gasEstimate
  const initialGas =
    parameters.gas ??
    (gasEstimate ? hexToBigInt(gasEstimate.gasLimit) : undefined)
  if (initialGas === undefined)
    throw new BaseError(
      'Unable to determine `gas`: the terms carry no top-level `gasEstimate.gasLimit` and no `gas` override was provided.',
    )

  const maxFeePerGas =
    parameters.maxFeePerGas ??
    (gasEstimate ? hexToBigInt(gasEstimate.maxFeePerGas) : undefined)
  const maxPriorityFeePerGas =
    parameters.maxPriorityFeePerGas ??
    (gasEstimate ? hexToBigInt(gasEstimate.maxPriorityFeePerGas) : undefined)

  const maxGasLimit = option.conditions?.maxGasLimit
    ? hexToBigInt(option.conditions.maxGasLimit)
    : undefined

  // Prepared once so the nonce stays stable across re-signs; only the phase-0
  // transfer (on `requote`) and `gas` (on `minGasLimit`) change between attempts.
  const transaction = await prepareTransactionRequest(client, {
    account,
    calls: [calls],
    accountChanges,
    gas: initialGas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    validBefore: parameters.validBefore,
    nonceKey: parameters.nonceKey,
    nonceSequence: parameters.nonceSequence,
  })
  transaction.payer = option.payer

  // A nonce-free send (e.g. a Keystore actor confined to it) MUST carry a
  // non-zero, in-window `validBefore`: it is the sole replay protection. When
  // the payer's offer has no `maxExpiry`, fall back to the mempool admission
  // window instead of `0` (which the node would reject as a nonce-free tx).
  const noncelessOnly = transaction.nonceKey === nonceKeyMax

  // `conditions.maxExpiry` is a relative duration (seconds from now). The wallet
  // sets the onchain `validBefore` (unix ms) to `now + maxExpiry * 1000`; the
  // payer keeps `maxExpiry` short. Recomputed per attempt so a retry doesn't
  // inherit a near-expiry window. A caller-supplied absolute `validBefore` (unix
  // ms) is used as-is.
  const computeValidBefore = (): bigint => {
    if (parameters.validBefore !== undefined) return parameters.validBefore
    // Nonce-free-only actor: `validBefore` is the sole replay protection and
    // must fall within the protocol's tight replay window, so pin it under the
    // mempool admission window (unix ms) regardless of the payer's (possibly
    // larger) `maxExpiry`.
    if (noncelessOnly) return BigInt(Date.now()) + nonceFreeDefaultExpiryWindow
    const maxExpiry = option.conditions?.maxExpiry
    return maxExpiry !== undefined
      ? BigInt(Date.now()) + BigInt(maxExpiry) * 1000n
      : 0n
  }

  // A token offer's phase 0 must cover the transaction's own `max_cost`, so it
  // is re-priced from `rate` whenever `gas` changes.
  let rate = tokenChoice ? hexToBigInt(tokenChoice.rate) : undefined
  const paymentAmountFor = (gasLimit: bigint): bigint | undefined => {
    if (rate === undefined) return undefined
    if (transaction.maxFeePerGas === undefined)
      throw new BaseError('Prepared transaction carries no `maxFeePerGas`.')
    return requiredPaymentAmount({
      maxCost: gasLimit * transaction.maxFeePerGas,
      rate,
    })
  }
  const phasesFor = (amount: bigint | undefined): AaCalls =>
    tokenChoice && amount !== undefined
      ? [
          [
            encodePayment({
              token: tokenChoice.token,
              to: feeRecipient,
              amount,
            }),
          ],
          calls,
        ]
      : [calls]

  let gas = initialGas
  let phases = phasesFor(paymentAmountFor(gas))

  // Try, and on a recoverable rejection re-sign from the payer's `requote` /
  // `minGasLimit` (ERC-8168 "Re-Quote on PAYMENT_INSUFFICIENT"). Re-signing
  // mints a new `sender_auth` (and, for a passkey, a fresh user gesture), so a
  // retry is GATED on `confirmRetry`: with no callback there is no auto-resign —
  // the rejection is thrown for the caller to handle.
  for (let attempt = 0; ; attempt++) {
    transaction.calls = phases
    transaction.gas = gas
    transaction.validBefore = computeValidBefore()
    transaction.payerAuth = '0x'

    onTransaction?.(transaction)

    try {
      if (mode === 'sign') {
        // A named sender is identifiable without its signature, so the payer
        // authorizes first; a recovered sender has to sign first.
        const unsigned = transaction.from
          ? serializeTransaction({ ...transaction, senderAuth: '0x' })
          : await account.signTransaction(transaction)
        const { payerAuth } = await payerClient.signTransaction({
          transaction: unsigned,
          context,
        })
        const signedTransaction = await account.signTransaction({
          ...transaction,
          payerAuth,
        })
        return { payerAuth, signedTransaction }
      }
      const signedTransaction = await account.signTransaction(transaction)
      return await payerClient.sendTransaction({
        transaction: signedTransaction,
        context,
      })
    } catch (error) {
      if (attempt >= retries) throw error
      const rejected = parsePayerError(error)
      if (!rejected) throw error

      // Resolve the concrete change the next attempt would sign over, so the
      // user can reconfirm exactly what changes (a higher charge, or more gas).
      let request: ResignRequest | undefined
      let nextPhases = phases
      let nextGas = gas
      let nextRate = rate

      if (rejected.code === 'PAYMENT_INSUFFICIENT' && rejected.requote) {
        const { token: t, paymentAmount } = rejected.requote
        const to = rejected.requote.feeRecipient ?? option.payer
        const amount = hexToBigInt(paymentAmount)
        nextPhases = [[encodePayment({ token: t, to, amount })], calls]
        if (rejected.requote.rate) nextRate = hexToBigInt(rejected.requote.rate)
        request = {
          kind: 'requote',
          reason: rejected,
          attempt,
          token: t,
          paymentAmount: amount,
          feeRecipient: to,
        }
      } else if (rejected.code === 'GAS_TOO_LOW' && rejected.minGasLimit) {
        const minGas = hexToBigInt(rejected.minGasLimit)
        // Unsatisfiable (over the offer's cap) or non-progressing → give up.
        if (maxGasLimit !== undefined && minGas > maxGasLimit) throw error
        if (minGas <= gas) throw error
        nextGas = minGas
        const paymentAmount = paymentAmountFor(minGas)
        if (paymentAmount !== undefined) nextPhases = phasesFor(paymentAmount)
        request = {
          kind: 'gas',
          reason: rejected,
          attempt,
          gasLimit: minGas,
          paymentAmount,
        }
      }

      // Not a recoverable condition we know how to re-sign for.
      if (!request) throw error

      // Reconfirm before the second signature. No callback ⇒ no silent resign.
      const approved = confirmRetry ? await confirmRetry(request) : false
      if (!approved) throw error

      phases = nextPhases
      gas = nextGas
      rate = nextRate
    }
  }
}
