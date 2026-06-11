import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { BaseError } from '../../../errors/base.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { hexToBigInt } from '../../../utils/encoding/fromHex.js'
import { numberToHex } from '../../../utils/encoding/toHex.js'
import type { To8130AccountReturnType } from '../../eip8130/accounts/to8130Account.js'
import { prepareTransaction8130 } from '../../eip8130/actions/sendCalls.js'
import type { AaCall } from '../../eip8130/types/transaction.js'
import type { PayerClient } from '../client.js'
import type {
  GetTermsReturnType,
  SendTransactionReturnType,
  SignTransactionReturnType,
} from '../types.js'
import { buildSponsoredCalls } from '../utils/buildSponsoredCalls.js'

export type SendSponsoredCallsParameters = {
  /** The sending account (signs `sender_auth`). */
  account: To8130AccountReturnType
  /** Payer service client (ERC-8168). */
  payerClient: PayerClient
  /** User's intended calls (run in the final phase). */
  calls: readonly AaCall[]
  /**
   * `"send"` (default) asks the payer to co-sign and submit; `"sign"` asks the
   * payer to co-sign and return the transaction for the wallet to submit.
   */
  mode?: 'send' | 'sign' | undefined
  /** Pre-fetched terms. When omitted, `payer_getTerms` is called. */
  terms?: GetTermsReturnType | undefined
  /** Token to pay with (token-payment terms). Defaults to the first option. */
  token?: `0x${string}` | undefined
  /** Opaque app context forwarded to `payer_*` calls (e.g. `policyId`). */
  context?: Record<string, unknown> | undefined
  /**
   * Override transaction expiry as an absolute Unix timestamp (seconds).
   * When omitted the payer's recommended `terms.expiry` relative duration is
   * applied: `current_time + terms.expiry`, clamped to `conditions.maxExpiry`.
   */
  expiry?: bigint | undefined
  /** Override gas (defaults to the payer's `gasEstimate.gasLimit`). */
  gas?: bigint | undefined
  maxFeePerGas?: bigint | undefined
  maxPriorityFeePerGas?: bigint | undefined
  nonceKey?: bigint | undefined
  nonceSequence?: bigint | undefined
}

export type SendSponsoredCallsReturnType =
  | SendTransactionReturnType
  | SignTransactionReturnType

/**
 * End-to-end ERC-8168 sponsored-transaction flow:
 *
 * 1. Fetch terms (`payer_getTerms`) unless provided.
 * 2. Build the phase-0 token transfer / required calls + user calls.
 * 3. Prepare the EIP-8130 transaction (nonce, gas from the payer's estimate).
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

  const gas =
    parameters.gas ??
    (terms.gasEstimate ? hexToBigInt(terms.gasEstimate.gasLimit) : undefined)
  if (gas === undefined)
    throw new BaseError(
      'Unable to determine `gas`: terms carry no `gasEstimate.gasLimit` and no `gas` override was provided.',
    )

  const maxFeePerGas =
    parameters.maxFeePerGas ??
    (terms.gasEstimate
      ? hexToBigInt(terms.gasEstimate.maxFeePerGas)
      : undefined)
  const maxPriorityFeePerGas =
    parameters.maxPriorityFeePerGas ??
    (terms.gasEstimate
      ? hexToBigInt(terms.gasEstimate.maxPriorityFeePerGas)
      : undefined)

  // `terms.expiry` is a relative duration (seconds from now). Convert to an
  // absolute on-chain timestamp, then clamp to [now+minExpiry, now+maxExpiry].
  let expiry = parameters.expiry
  if (expiry === undefined) {
    const now = BigInt(Math.floor(Date.now() / 1000))
    expiry = now + BigInt(terms.expiry)
    if (
      terms.conditions?.maxExpiry !== undefined &&
      expiry > now + BigInt(terms.conditions.maxExpiry)
    )
      expiry = now + BigInt(terms.conditions.maxExpiry)
    if (
      terms.conditions?.minExpiry !== undefined &&
      expiry < now + BigInt(terms.conditions.minExpiry)
    )
      expiry = now + BigInt(terms.conditions.minExpiry)
  }

  const transaction = await prepareTransaction8130(client, {
    account,
    calls: built.calls,
    gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    expiry,
    nonceKey: parameters.nonceKey,
    nonceSequence: parameters.nonceSequence,
  })

  // Sender co-signs; the payer fills `payer_auth`.
  transaction.payer = built.payer
  transaction.payerAuth = '0x'

  const signedTransaction = await account.signTransaction(transaction)

  if (mode === 'sign')
    return payerClient.signTransaction({ signedTransaction, context })
  return payerClient.sendTransaction({ signedTransaction, context })
}
