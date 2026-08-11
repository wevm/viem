import { createClient } from '../clients/createClient.js'
import type { Transport } from '../clients/transports/createTransport.js'
import { http } from '../clients/transports/http.js'
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

/**
 * Creates a client for an ERC-8168 payer web service. Wraps the `payer_*`
 * JSON-RPC methods used by wallets to negotiate and obtain gas sponsorship /
 * token payment for EIP-8130 transactions.
 *
 * @example
 * import { createPayerClient } from 'viem/experimental'
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
