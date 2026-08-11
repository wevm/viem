import { parseTransaction } from '../eip8130/utils/parseTransaction.js'
import { BaseError } from '../errors/base.js'
import { hexToBigInt } from '../utils/encoding/fromHex.js'
import type { PayerClient } from './client.js'
import type {
  GetSponsorshipBalanceParameters,
  GetSponsorshipBalanceReturnType,
  GetTermsParameters,
  GetTermsReturnType,
  PayerBalance,
  PaymentOption,
  SendTransactionParameters,
  SendTransactionReturnType,
  SignTransactionParameters,
  SignTransactionReturnType,
} from './types.js'
import { isSelectableOffer } from './utils/buildSponsoredCalls.js'

export type CreateAggregatePayerClientParameters = {
  /**
   * Payer sources to query in parallel, in preference order (earlier wins ties
   * when two sources advertise the same `payer` address). Each is a
   * {@link PayerClient} — an external service (`createPayerClient`), the chain /
   * block-builder node (`toChainPayerClient`), or a wallet-injected payer.
   */
  payers: readonly PayerClient[]
  /**
   * Invoked when an individual source rejects (during `getTerms` /
   * `getSponsorshipBalance` fan-out). A rejecting source is skipped, never fatal
   * — this hook lets a wallet log or surface a degraded source without failing
   * the whole negotiation.
   */
  onError?: ((error: unknown, index: number) => void) | undefined
}

/**
 * Fans an ERC-8168 negotiation out across several payer sources and presents
 * them to the wallet as a single {@link PayerClient} — so it drops straight into
 * {@link sendSponsoredCalls} with no other change.
 *
 * - `getTerms` queries every source **in parallel** (`Promise.allSettled`, so a
 *   slow or failing source never blocks the rest) and merges their `options`
 *   best-first in source order. Offers stay self-describing via their `payer`
 *   (and optional `endpoint`), and the aggregate remembers which source produced
 *   each `payer` so it can route the co-sign back.
 * - `sendTransaction` / `signTransaction` read the signed transaction's `payer`
 *   field and dispatch to the source that offered it (populated by the preceding
 *   `getTerms`). Let the aggregate fetch terms — don't pre-pass `terms` to
 *   `sendSponsoredCalls` — so routing is populated.
 * - `getSponsorshipBalance` concatenates every source's balances.
 *
 * The merged `gasEstimate` is the worst-case (largest `gasLimit`) across
 * responses: the same calls are quoted by every source, and a source with a
 * tighter cap re-quotes via `GAS_TOO_LOW`, which `sendSponsoredCalls` handles.
 *
 * @example
 * import {
 *   createAggregatePayerClient,
 *   createPayerClient,
 *   hasChainPayerService,
 *   sendSponsoredCalls,
 *   toChainPayerClient,
 * } from 'viem/eip8168'
 *
 * const payerClient = createAggregatePayerClient({
 *   payers: [
 *     ...(hasChainPayerService(client.chain) ? [toChainPayerClient(client)] : []),
 *     createPayerClient({ url: appPayerUrl }),
 *     createPayerClient({ url: flashblocksBuilderUrl }),
 *   ],
 * })
 * await sendSponsoredCalls(client, { account, payerClient, calls })
 */
export function createAggregatePayerClient(
  parameters: CreateAggregatePayerClientParameters,
): PayerClient {
  const { payers, onError } = parameters
  if (payers.length === 0)
    throw new BaseError('`createAggregatePayerClient` requires ≥1 payer.')

  // payer address -> the source that offered it, populated on every `getTerms`
  // so `sendTransaction` / `signTransaction` can route the co-sign back.
  const routes = new Map<string, PayerClient>()

  const settle = async <T>(
    fn: (payer: PayerClient) => Promise<T>,
  ): Promise<T[]> => {
    const results = await Promise.allSettled(payers.map(fn))
    const values: T[] = []
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') values.push(result.value)
      else onError?.(result.reason, index)
    })
    return values
  }

  const route = (signedTransaction: `0x${string}`): PayerClient => {
    const { payer } = parseTransaction(signedTransaction)
    if (!payer)
      throw new BaseError(
        'Signed transaction names no `payer`; nothing to route to a payer source.',
      )
    const source = routes.get(payer.toLowerCase())
    if (!source)
      throw new BaseError(
        `No payer source produced an offer for payer "${payer}". Let the aggregate client fetch terms (do not pre-pass \`terms\`) so routing is populated.`,
      )
    return source
  }

  return {
    async getTerms(params: GetTermsParameters): Promise<GetTermsReturnType> {
      const responses = await settle((payer) =>
        payer.getTerms(params).then((terms) => ({ payer, terms })),
      )

      const options: PaymentOption[] = []
      let gasEstimate: GetTermsReturnType['gasEstimate']
      let fiatCurrency: string | undefined

      for (const { payer, terms } of responses) {
        for (const option of terms.options ?? []) {
          options.push(option)
          // Only selectable offers carry a routable `payer`; earlier sources win.
          if (isSelectableOffer(option)) {
            const key = option.payer.toLowerCase()
            if (!routes.has(key)) routes.set(key, payer)
          }
        }
        // Worst-case sizing: keep the largest gasLimit across responses.
        if (
          terms.gasEstimate &&
          (!gasEstimate ||
            hexToBigInt(terms.gasEstimate.gasLimit) >
              hexToBigInt(gasEstimate.gasLimit))
        )
          gasEstimate = terms.gasEstimate
        fiatCurrency ??= terms.fiatCurrency
      }

      return {
        options,
        ...(gasEstimate ? { gasEstimate } : {}),
        ...(fiatCurrency ? { fiatCurrency } : {}),
      }
    },

    async sendTransaction(
      params: SendTransactionParameters,
    ): Promise<SendTransactionReturnType> {
      return route(params.signedTransaction).sendTransaction(params)
    },

    async signTransaction(
      params: SignTransactionParameters,
    ): Promise<SignTransactionReturnType> {
      return route(params.signedTransaction).signTransaction(params)
    },

    async getSponsorshipBalance(
      params: GetSponsorshipBalanceParameters,
    ): Promise<GetSponsorshipBalanceReturnType> {
      const responses = await settle((payer) =>
        payer.getSponsorshipBalance(params),
      )
      const balances: PayerBalance[] = []
      let ttl: number | undefined
      for (const response of responses) {
        balances.push(...response.balances)
        // Cache only as long as the shortest-lived snapshot stays valid.
        ttl = ttl === undefined ? response.ttl : Math.min(ttl, response.ttl)
      }
      return { balances, ttl: ttl ?? 0 }
    },
  }
}
