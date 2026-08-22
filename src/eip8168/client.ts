import type { Client } from '../clients/createClient.js'
import { createClient } from '../clients/createClient.js'
import type { Transport } from '../clients/transports/createTransport.js'
import { http } from '../clients/transports/http.js'
import type { Account } from '../types/account.js'
import type { Chain } from '../types/chain.js'
import type {
  GetSponsorshipBalanceParameters,
  GetSponsorshipBalanceReturnType,
  GetTermsParameters,
  GetTermsReturnType,
  SendTransactionParameters,
  SendTransactionReturnType,
  SignTransactionParameters,
  SignTransactionReturnType,
} from './types.js'

/** JSON-RPC schema for the ERC-8168 `payer_*` methods. */
export type PayerRpcSchema = [
  {
    Method: 'payer_getTerms'
    Parameters: [GetTermsParameters]
    ReturnType: GetTermsReturnType
  },
  {
    Method: 'payer_sendTransaction'
    Parameters: [SendTransactionParameters]
    ReturnType: SendTransactionReturnType
  },
  {
    Method: 'payer_signTransaction'
    Parameters: [SignTransactionParameters]
    ReturnType: SignTransactionReturnType
  },
  {
    Method: 'payer_getSponsorshipBalance'
    Parameters: [GetSponsorshipBalanceParameters]
    ReturnType: GetSponsorshipBalanceReturnType
  },
]

export type CreatePayerClientParameters = {
  /** Payer service endpoint URL (path-versioned, e.g. `https://payer.example.com/v1`). */
  url?: string | undefined
  /**
   * Transport to reach the payer service. Defaults to `http(url)`. Provide a
   * custom transport to inject auth headers or for testing.
   */
  transport?: Transport | undefined
}

export type PayerClient = {
  /**
   * Payment offers (sponsorship / token payment) for a transaction intent,
   * pre-signature. REQUIRED on every payer.
   */
  getTerms(parameters: GetTermsParameters): Promise<GetTermsReturnType>
  /**
   * Co-sign a sender-signed EIP-8130 transaction and submit it (returns the tx
   * hash). REQUIRED on every payer.
   */
  sendTransaction(
    parameters: SendTransactionParameters,
  ): Promise<SendTransactionReturnType>
  /**
   * Co-sign a sender-signed EIP-8130 transaction and return the bytes without
   * submitting. OPTIONAL — only call when the picked offer advertises it via
   * `methods`. Returns JSON-RPC `-32601` when unimplemented.
   */
  signTransaction(
    parameters: SignTransactionParameters,
  ): Promise<SignTransactionReturnType>
  /**
   * Standing, intent-free balances (sponsorship allowance / prepaid credit).
   * OPTIONAL.
   */
  getSponsorshipBalance(
    parameters: GetSponsorshipBalanceParameters,
  ): Promise<GetSponsorshipBalanceReturnType>
}

/** Minimal JSON-RPC request function shape a {@link PayerClient} wraps. */
type PayerRequestFn = (args: {
  method: string
  params: readonly unknown[]
}) => Promise<unknown>

/**
 * Builds a {@link PayerClient} over any JSON-RPC `request` function that speaks
 * the `payer_*` methods — shared by {@link createPayerClient} (a standalone HTTP
 * endpoint) and {@link toChainPayerClient} (the wallet's own execution client).
 */
function payerClientFromRequest(request: PayerRequestFn): PayerClient {
  return {
    getTerms(params) {
      return request({
        method: 'payer_getTerms',
        params: [params],
      }) as Promise<GetTermsReturnType>
    },
    sendTransaction(params) {
      return request({
        method: 'payer_sendTransaction',
        params: [params],
      }) as Promise<SendTransactionReturnType>
    },
    signTransaction(params) {
      return request({
        method: 'payer_signTransaction',
        params: [params],
      }) as Promise<SignTransactionReturnType>
    },
    getSponsorshipBalance(params) {
      return request({
        method: 'payer_getSponsorshipBalance',
        params: [params],
      }) as Promise<GetSponsorshipBalanceReturnType>
    },
  }
}

/**
 * Creates a client for an ERC-8168 payer web service. Wraps the `payer_*`
 * JSON-RPC methods used by wallets to negotiate and obtain gas sponsorship /
 * token payment for EIP-8130 transactions.
 *
 * @example
 * import { createPayerClient } from 'viem/eip8168'
 *
 * const payer = createPayerClient({ url: 'https://payer.example.com/v1' })
 * const { options } = await payer.getTerms({ chainId: '0x2105', from, calls })
 */
export function createPayerClient(
  parameters: CreatePayerClientParameters,
): PayerClient {
  const { url, transport = http(url) } = parameters
  if (!url && !parameters.transport)
    throw new Error('`url` or `transport` is required.')

  const { request } = createClient<
    Transport,
    undefined,
    undefined,
    PayerRpcSchema
  >({
    transport,
  })

  return payerClientFromRequest(request as PayerRequestFn)
}

/**
 * Adapts an existing viem client into a {@link PayerClient} by routing the
 * `payer_*` methods over its transport. Use it when the chain (or block builder,
 * e.g. a flashblocks endpoint) serves the payer service natively on the same RPC
 * the wallet already talks to — check {@link hasChainPayerService} first, then
 * fold the result into {@link createAggregatePayerClient}'s `payers`.
 *
 * @example
 * import { hasChainPayerService, toChainPayerClient } from 'viem/eip8168'
 *
 * if (hasChainPayerService(client.chain))
 *   payers.push(toChainPayerClient(client))
 */
export function toChainPayerClient(
  client: Client<Transport, Chain | undefined, Account | undefined>,
): PayerClient {
  return payerClientFromRequest(client.request as unknown as PayerRequestFn)
}
