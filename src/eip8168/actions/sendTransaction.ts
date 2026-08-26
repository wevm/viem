import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ToAccountReturnType } from '../../eip8130/accounts/toAccount.js'
import { prepareTransactionRequest as prepareEip8130Request } from '../../eip8130/actions/sendTransaction.js'
import {
  type WaitForTransactionReceiptReturnType,
  waitForTransactionReceipt,
} from '../../eip8130/actions/waitForTransactionReceipt.js'
import type {
  AaAccountChange,
  AaCall,
  TransactionSerializable8130,
} from '../../eip8130/types/transaction.js'
import { BaseError } from '../../errors/base.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import type { PayerClient } from '../client.js'
import type {
  GetTermsReturnType,
  PayerGasEstimate,
  PayerSendTransactionReturnType,
  PaymentOption,
} from '../types.js'
import {
  type ResignRequest,
  type SendSponsoredCallsReturnType,
  sendSponsoredCalls,
} from './sendSponsoredCalls.js'

/**
 * ERC-8168 payment as a **capability of the fill**, not a separate "choose
 * terms" endpoint. The flow mirrors the native fill → send pattern:
 *
 * 1. {@link prepareTransactionRequest} fills the transaction and returns the
 *    solicited payment offers (`capabilities.paymentOptions`) as a *component*
 *    of that fill.
 * 2. The wallet picks one and threads it back into {@link sendTransaction} via
 *    `capabilities.paymentOption`.
 *
 * This folds the `payer_*` RPC surface behind the same verbs a chain-brokered
 * payer would ride on native `eth_` methods, so app code speaks one shape
 * whether the payer is the wallet's own service, a chain builder, or a
 * third-party sponsor. The tested {@link sendSponsoredCalls} engine (offer
 * selection, phase-0 construction, re-quote/re-sign) is reused underneath.
 */

/** Request capability: solicit payment offers from a payer service. */
export type PaymasterServiceCapability = {
  /**
   * Opaque app context (e.g. `policyId`) forwarded to `payer_getTerms`.
   */
  context?: Record<string, unknown> | undefined
  /** Prefer these payment tokens when the payer offers token payment. */
  preferredTokens?: readonly Address[] | undefined
  /** ISO-4217 code the wallet would like `fiatRate`s quoted in (e.g. `"USD"`). */
  fiatCurrency?: string | undefined
}

export type PrepareTransactionRequestParameters = {
  /** The sending account (drives actor/nonce resolution). */
  account: ToAccountReturnType
  /** Payer service client (single service or an aggregate). */
  payerClient: PayerClient
  /** The user's intended calls (run in the final phase). */
  calls: readonly AaCall[]
  /** Account changes applied atomically before the calls (e.g. sponsored deploy). */
  accountChanges?: readonly AaAccountChange[] | undefined
  /**
   * Fill capabilities. `paymasterService` opts the fill into soliciting payment
   * offers; the resulting offers come back on the return's
   * `capabilities.paymentOptions`.
   */
  capabilities?:
    | { paymasterService?: PaymasterServiceCapability | undefined }
    | undefined
  /**
   * Gas budget. Falls back to the terms' top-level `gasEstimate.gasLimit`. The
   * fill throws if neither is available.
   */
  gas?: bigint | undefined
  nonceKey?: bigint | undefined
  nonceSequence?: bigint | undefined
}

/** Return capability: the payment offers surfaced by the fill. */
export type PrepareTransactionCapabilities = {
  /** Payment offers for this intent, best-first (may be empty). */
  paymentOptions: readonly PaymentOption[]
  /** Recommended gas params shared by every offer (used to size the tx). */
  gasEstimate?: PayerGasEstimate | undefined
  /** ISO-4217 code every offer's `fiatRate` is quoted in. */
  fiatCurrency?: string | undefined
}

export type PrepareTransactionRequestReturnType = {
  /** The filled EIP-8130 transaction (base, self-pay shape). */
  request: TransactionSerializable8130
  /** Payment terms surfaced as a component of the fill. */
  capabilities: PrepareTransactionCapabilities
}

/**
 * Fills an EIP-8130 transaction and, when `capabilities.paymasterService` is
 * set, solicits payment offers (`payer_getTerms`) and returns them as
 * `capabilities.paymentOptions` — terms as a *component* of the fill. Pick an
 * offer and pass it to {@link sendTransaction} via `capabilities.paymentOption`.
 *
 * @example
 * import { createPayerClient, prepareTransactionRequest, sendTransaction } from 'viem/eip8168'
 *
 * const payerClient = createPayerClient({ url: 'https://payer.example.com/v1' })
 * const { request, capabilities } = await prepareTransactionRequest(client, {
 *   account,
 *   payerClient,
 *   calls: [{ to, data }],
 *   capabilities: { paymasterService: { preferredTokens: [usdc] } },
 * })
 * const { transactionHash } = await sendTransaction(client, {
 *   account,
 *   payerClient,
 *   calls: [{ to, data }],
 *   capabilities: { paymentOption: capabilities.paymentOptions[0], gasEstimate: capabilities.gasEstimate },
 * })
 */
export async function prepareTransactionRequest(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: PrepareTransactionRequestParameters,
): Promise<PrepareTransactionRequestReturnType> {
  const { account, payerClient, calls, accountChanges, capabilities } =
    parameters

  const chainId = client.chain?.id
  if (!chainId)
    throw new BaseError('`client` must be configured with a `chain`.')

  const paymasterService = capabilities?.paymasterService
  const terms: GetTermsReturnType = await payerClient.getTerms({
    chainId: numberToHex(chainId),
    from: account.address,
    calls: calls.map((call) => ({ to: call.to, data: call.data ?? '0x' })),
    ...(paymasterService?.preferredTokens
      ? { preferredTokens: paymasterService.preferredTokens }
      : {}),
    ...(paymasterService?.fiatCurrency
      ? { fiatCurrency: paymasterService.fiatCurrency }
      : {}),
    ...(paymasterService?.context ? { context: paymasterService.context } : {}),
  })

  const gas =
    parameters.gas ??
    (terms.gasEstimate ? hexToBigInt(terms.gasEstimate.gasLimit) : undefined)
  if (gas === undefined)
    throw new BaseError(
      'Unable to determine `gas`: the payer returned no top-level `gasEstimate.gasLimit` and no `gas` override was provided.',
    )

  const request = await prepareEip8130Request(client, {
    account,
    calls: [calls],
    accountChanges,
    gas,
    ...(terms.gasEstimate
      ? {
          maxFeePerGas: hexToBigInt(terms.gasEstimate.maxFeePerGas),
          maxPriorityFeePerGas: hexToBigInt(
            terms.gasEstimate.maxPriorityFeePerGas,
          ),
        }
      : {}),
    nonceKey: parameters.nonceKey,
    nonceSequence: parameters.nonceSequence,
  })

  return {
    request,
    capabilities: {
      paymentOptions: terms.options,
      gasEstimate: terms.gasEstimate,
      fiatCurrency: terms.fiatCurrency,
    },
  }
}

/** Request capability: the payment offer chosen from the fill. */
export type SendTransactionCapabilities = {
  /** The offer selected from `prepareTransactionRequest`'s `paymentOptions`. */
  paymentOption: PaymentOption
  /** The fill's recommended gas params (thread through from the fill). */
  gasEstimate?: PayerGasEstimate | undefined
  /** The fill's `fiatCurrency` (thread through from the fill). */
  fiatCurrency?: string | undefined
}

export type SendTransactionParameters = {
  /** The sending account (signs `sender_auth`). */
  account: ToAccountReturnType
  /** Payer service client (ERC-8168). */
  payerClient: PayerClient
  /** The user's intended calls (run in the final phase). */
  calls: readonly AaCall[]
  /** Account changes applied atomically before the calls. */
  accountChanges?: readonly AaAccountChange[] | undefined
  /** Send capabilities: the chosen payment offer (see {@link SendTransactionCapabilities}). */
  capabilities: SendTransactionCapabilities
  /**
   * `"send"` (default) asks the payer to co-sign and submit; `"sign"` asks the
   * payer to co-sign and return the transaction for the wallet to submit.
   */
  mode?: 'send' | 'sign' | undefined
  /**
   * For a token offer with multiple accepted tokens, which token to pay in.
   * Ignored for a sponsored offer.
   */
  token?: `0x${string}` | undefined
  /** Opaque app context forwarded to `payer_*` calls. */
  context?: Record<string, unknown> | undefined
  /** Override the transaction's `validBefore` (absolute unix ms). */
  validBefore?: bigint | undefined
  /** Override gas (defaults to the fill's `gasEstimate.gasLimit`). */
  gas?: bigint | undefined
  maxFeePerGas?: bigint | undefined
  maxPriorityFeePerGas?: bigint | undefined
  nonceKey?: bigint | undefined
  nonceSequence?: bigint | undefined
  /** Upper bound on re-signs after a recoverable payer rejection. Default `2`. */
  retries?: number | undefined
  /** Gate for every re-sign (see {@link ResignRequest}). No callback ⇒ no retry. */
  confirmRetry?: (request: ResignRequest) => boolean | Promise<boolean>
  /** Invoked with the resolved transaction just before each submit attempt. */
  onTransaction?:
    | ((transaction: TransactionSerializable8130) => void)
    | undefined
}

export type SendTransactionReturnType = SendSponsoredCallsReturnType

/**
 * Submits an EIP-8130 transaction paid for by the chosen payment offer
 * (`capabilities.paymentOption`, from {@link prepareTransactionRequest}). Folds
 * `payer_sendTransaction` / `payer_signTransaction` behind the native send verb;
 * offer selection, phase-0 construction, and re-quote/re-sign are handled by the
 * {@link sendSponsoredCalls} engine.
 */
export async function sendTransaction(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: SendTransactionParameters,
): Promise<SendTransactionReturnType> {
  const { capabilities, ...rest } = parameters

  // A single-offer `terms` reuses the sponsored-calls engine's selection,
  // phase-0 build, and re-quote/re-sign machinery on the pre-chosen offer.
  const terms: GetTermsReturnType = {
    options: [capabilities.paymentOption],
    ...(capabilities.gasEstimate
      ? { gasEstimate: capabilities.gasEstimate }
      : {}),
    ...(capabilities.fiatCurrency
      ? { fiatCurrency: capabilities.fiatCurrency }
      : {}),
  }

  return sendSponsoredCalls(client, { ...rest, terms })
}

export type SendTransactionSyncParameters = Omit<
  SendTransactionParameters,
  'mode' | 'onTransaction'
> & {
  /** How often to poll for the receipt (ms). @default 500 */
  pollingInterval?: number | undefined
  /** Maximum time to wait for the receipt before rejecting (ms). @default 60_000 */
  timeout?: number | undefined
}

export type SendTransactionSyncReturnType = PayerSendTransactionReturnType & {
  /** The awaited EIP-8130 receipt (with `eip8130` fields). */
  receipt: WaitForTransactionReceiptReturnType
}

/**
 * Sponsored send that waits for the receipt. Submits via the payer
 * (`payer_sendTransaction`, which returns the hash) and then awaits the
 * EIP-8130 receipt, threading the resolved `validBefore` for fast expiry
 * detection. The payer is the submitter, so this is always `mode: "send"`
 * (there is nothing to await in co-sign-only `"sign"` mode).
 *
 * @example
 * const { transactionHash, tokenCharged, receipt } = await sendTransactionSync(
 *   client,
 *   {
 *     account,
 *     payerClient,
 *     calls: [{ to, data }],
 *     capabilities: { paymentOption, gasEstimate },
 *   },
 * )
 * console.log(receipt.eip8130.phaseStatuses)
 */
export async function sendTransactionSync(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: SendTransactionSyncParameters,
): Promise<SendTransactionSyncReturnType> {
  const { pollingInterval, timeout, ...rest } = parameters

  let validBefore: bigint | undefined
  const result = await sendTransaction(client, {
    ...rest,
    mode: 'send',
    onTransaction: (tx) => {
      validBefore = tx.validBefore
    },
  })

  // `mode: 'send'` always resolves to the submit variant (carries a hash).
  if (!('transactionHash' in result))
    throw new BaseError(
      'Payer did not return a transaction hash for a `send`-mode sponsored transaction.',
    )

  const receipt = await waitForTransactionReceipt(client, {
    hash: result.transactionHash,
    ...(validBefore !== undefined ? { validBefore } : {}),
    ...(pollingInterval !== undefined ? { pollingInterval } : {}),
    ...(timeout !== undefined ? { timeout } : {}),
  })

  return { ...result, receipt }
}
