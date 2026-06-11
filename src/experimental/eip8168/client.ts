import { createClient } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { http } from '../../clients/transports/http.js'
import type {
  FillTransactionParameters,
  FillTransactionReturnType,
  GetBalanceParameters,
  GetBalanceReturnType,
  GetCapabilitiesParameters,
  GetCapabilitiesReturnType,
  GetOptionsParameters,
  GetOptionsReturnType,
  GetTermsParameters,
  GetTermsReturnType,
  SendTransactionParameters,
  SendTransactionReturnType,
  SignTransactionParameters,
  SignTransactionReturnType,
} from './types.js'

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
  /** Sponsorship/token-payment terms for a transaction intent (pre-signature). */
  getTerms(parameters: GetTermsParameters): Promise<GetTermsReturnType>
  /** Co-sign a sender-signed EIP-8130 transaction and submit it. */
  sendTransaction(
    parameters: SendTransactionParameters,
  ): Promise<SendTransactionReturnType>
  /** Co-sign a sender-signed EIP-8130 transaction and return it (no submit). */
  signTransaction(
    parameters: SignTransactionParameters,
  ): Promise<SignTransactionReturnType>
  /**
   * Fill a transaction intent into a complete unsigned EIP-8130 transaction
   * with phases assembled and `payer` set. Wallet MUST verify before signing.
   * (OPTIONAL per ERC-8168.)
   */
  fillTransaction(
    parameters: FillTransactionParameters,
  ): Promise<FillTransactionReturnType>
  /** Standing, intent-free balances (sponsorship allowance / prepaid credit). */
  getBalance(parameters: GetBalanceParameters): Promise<GetBalanceReturnType>
  /** Ranked payer options for a transaction intent. */
  getOptions(
    parameters: GetOptionsParameters,
  ): Promise<GetOptionsReturnType>
  /** Static, intent-free descriptor of what the payer accepts. */
  getCapabilities(
    parameters?: GetCapabilitiesParameters,
  ): Promise<GetCapabilitiesReturnType>
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
 * const terms = await payer.getTerms({ chainId: '0x2105', from, calls })
 */
export function createPayerClient(
  parameters: CreatePayerClientParameters,
): PayerClient {
  const { url, transport = http(url) } = parameters
  if (!url && !parameters.transport)
    throw new Error('`url` or `transport` is required.')

  const { request } = createClient({ transport })

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
    fillTransaction(params) {
      return request({
        method: 'payer_fillTransaction',
        params: [params],
      }) as Promise<FillTransactionReturnType>
    },
    getBalance(params) {
      return request({
        method: 'payer_getBalance',
        params: [params],
      }) as Promise<GetBalanceReturnType>
    },
    getOptions(params) {
      return request({
        method: 'payer_getOptions',
        params: [params],
      }) as Promise<GetOptionsReturnType>
    },
    getCapabilities(params) {
      return request({
        method: 'payer_getCapabilities',
        params: [params ?? {}],
      }) as Promise<GetCapabilitiesReturnType>
    },
  }
}
