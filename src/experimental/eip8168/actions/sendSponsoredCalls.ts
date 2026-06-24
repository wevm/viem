import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { BaseError } from '../../../errors/base.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { hexToBigInt } from '../../../utils/encoding/fromHex.js'
import { numberToHex } from '../../../utils/encoding/toHex.js'
import type { To8130AccountReturnType } from '../../eip8130/accounts/to8130Account.js'
import { prepareTransaction8130 } from '../../eip8130/actions/sendCalls.js'
import type { Address } from 'abitype'
import type { AaCall, AaCalls } from '../../eip8130/types/transaction.js'
import type { PayerClient } from '../client.js'
import type {
  GetTermsReturnType,
  PayerRejectedData,
  SendTransactionReturnType,
  SignTransactionReturnType,
} from '../types.js'
import {
  buildSponsoredCalls,
  encodeTokenTransfer,
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
      token: Address
      /** The new phase-0 transfer amount the user would pay. */
      paymentAmount: bigint
      feeRecipient: Address
    }
  | {
      /** Gas limit is being raised (`GAS_TOO_LOW`). */
      kind: 'gas'
      /** The new `gasLimit` the next attempt will sign over. */
      gasLimit: bigint
    }
)

export type SendSponsoredCallsParameters = {
  /** The sending account (signs `sender_auth`). */
  account: To8130AccountReturnType
  /** Payer service client (ERC-8168). */
  payerClient: PayerClient
  /** User's intended calls (run in the final phase). */
  calls: readonly AaCall[]
  /**
   * `"send"` (default) asks the payer to co-sign and submit; `"sign"` asks the
   * payer to co-sign and return the transaction for the wallet to submit. A
   * `"sign"` request is only made when the selected offer lists
   * `payer_signTransaction` in its (additive) `methods`.
   */
  mode?: 'send' | 'sign' | undefined
  /** Pre-fetched terms. When omitted, `payer_getTerms` is called. */
  terms?: GetTermsReturnType | undefined
  /** Prefer token payment with this token. Defaults to a selectable sponsored offer. */
  token?: `0x${string}` | undefined
  /** Opaque app context forwarded to `payer_*` calls (e.g. `policyId`). */
  context?: Record<string, unknown> | undefined
  /**
   * Override transaction expiry as an absolute Unix timestamp (seconds). When
   * omitted, the selected offer's `conditions.maxExpiry` (a relative duration)
   * is applied: `current_time + maxExpiry`. With no `maxExpiry`, expiry is `0`
   * (no protocol-enforced lifetime) unless overridden here.
   */
  expiry?: bigint | undefined
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
}

export type SendSponsoredCallsReturnType =
  | SendTransactionReturnType
  | SignTransactionReturnType

/**
 * End-to-end ERC-8168 sponsored-transaction flow:
 *
 * 1. Fetch terms (`payer_getTerms`) unless provided.
 * 2. Select an offer (and token choice) and build the phase-0 token transfer +
 *    user calls.
 * 3. Prepare the EIP-8130 transaction (nonce, gas from the offer's estimate).
 * 4. Sign `sender_auth` with `payer` set and `payer_auth` left empty.
 * 5. Hand to the payer via `payer_sendTransaction` (submit) or
 *    `payer_signTransaction` (co-sign only).
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
    mode = 'send',
    token,
    context,
    retries = 2,
    confirmRetry,
  } = parameters

  const chainId = client.chain?.id
  if (!chainId)
    throw new BaseError('`client` must be configured with a `chain`.')

  const terms =
    parameters.terms ??
    (await payerClient.getTerms({
      chainId: numberToHex(chainId),
      from: account.address,
      calls: calls.map((call) => ({ to: call.to, data: call.data ?? '0x' })),
      ...(token ? { preferredTokens: [token] } : {}),
      ...(context ? { context } : {}),
    }))

  const built = buildSponsoredCalls({ terms, calls, token })
  const { option } = built

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

  // `conditions.maxExpiry` is a relative duration (seconds from now). The wallet
  // sets the on-chain expiry to `now + maxExpiry`; the payer keeps `maxExpiry`
  // short. Recomputed per attempt so a retry doesn't inherit a near-expiry
  // window. A caller-supplied absolute `expiry` is used as-is.
  const computeExpiry = (): bigint => {
    if (parameters.expiry !== undefined) return parameters.expiry
    const maxExpiry = option.conditions?.maxExpiry
    return maxExpiry !== undefined
      ? BigInt(Math.floor(Date.now() / 1000)) + BigInt(maxExpiry)
      : 0n
  }

  // Prepared once so the nonce stays stable across re-signs; only the phase-0
  // transfer (on `requote`) and `gas` (on `minGasLimit`) change between attempts.
  const transaction = await prepareTransaction8130(client, {
    account,
    calls: built.calls,
    gas: initialGas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    expiry: computeExpiry(),
    nonceKey: parameters.nonceKey,
    nonceSequence: parameters.nonceSequence,
  })
  transaction.payer = built.payer

  let phases: AaCalls = built.calls
  let gas = initialGas

  // Try, and on a recoverable rejection re-sign from the payer's `requote` /
  // `minGasLimit` (ERC-8168 "Re-Quote on PAYMENT_INSUFFICIENT"). Re-signing
  // mints a new `sender_auth` (and, for a passkey, a fresh user gesture), so a
  // retry is GATED on `confirmRetry`: with no callback there is no auto-resign —
  // the rejection is thrown for the caller to handle.
  for (let attempt = 0; ; attempt++) {
    transaction.calls = phases
    transaction.gas = gas
    transaction.expiry = computeExpiry()
    transaction.payerAuth = '0x'

    const signedTransaction = await account.signTransaction(transaction)

    try {
      if (mode === 'sign')
        return await payerClient.signTransaction({ signedTransaction, context })
      return await payerClient.sendTransaction({ signedTransaction, context })
    } catch (error) {
      if (attempt >= retries) throw error
      const rejected = parsePayerError(error)
      if (!rejected) throw error

      // Resolve the concrete change the next attempt would sign over, so the
      // user can reconfirm exactly what changes (a higher charge, or more gas).
      let request: ResignRequest | undefined
      let nextPhases = phases
      let nextGas = gas

      if (rejected.code === 'PAYMENT_INSUFFICIENT' && rejected.requote) {
        const { token: t, paymentAmount, feeRecipient } = rejected.requote
        const to = feeRecipient ?? built.payer
        const amount = hexToBigInt(paymentAmount)
        nextPhases = [[encodeTokenTransfer({ token: t, to, amount })], calls]
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
        request = { kind: 'gas', reason: rejected, attempt, gasLimit: minGas }
      }

      // Not a recoverable condition we know how to re-sign for.
      if (!request) throw error

      // Reconfirm before the second signature. No callback ⇒ no silent resign.
      const approved = confirmRetry ? await confirmRetry(request) : false
      if (!approved) throw error

      phases = nextPhases
      gas = nextGas
    }
  }
}
