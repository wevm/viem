import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { BaseError } from '../../errors/base.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import {
  type SendSponsoredCallsParameters,
  type SendSponsoredCallsReturnType,
  sendSponsoredCalls,
} from '../actions/sendSponsoredCalls.js'
import {
  type PrepareTransactionRequestParameters,
  type PrepareTransactionRequestReturnType,
  prepareTransactionRequest,
  type SendTransactionParameters,
  type SendTransactionReturnType,
  type SendTransactionSyncParameters,
  type SendTransactionSyncReturnType,
  sendTransaction,
  sendTransactionSync,
} from '../actions/sendTransaction.js'
import type { PayerClient } from '../client.js'

/** Makes `payerClient` optional (a bound default from the decorator fills it). */
type WithOptionalPayer<parameters extends { payerClient: PayerClient }> = Omit<
  parameters,
  'payerClient'
> & { payerClient?: PayerClient | undefined }

export type Eip8168Actions = {
  payer: {
    /**
     * Fill an EIP-8130 transaction and surface payment offers as a component of
     * the fill (`capabilities.paymentOptions`).
     */
    prepareTransactionRequest: (
      parameters: WithOptionalPayer<PrepareTransactionRequestParameters>,
    ) => Promise<PrepareTransactionRequestReturnType>
    /** Submit an EIP-8130 transaction paid for by the chosen `capabilities.paymentOption`. */
    sendTransaction: (
      parameters: WithOptionalPayer<SendTransactionParameters>,
    ) => Promise<SendTransactionReturnType>
    /** Sponsored send that awaits the EIP-8130 receipt. */
    sendTransactionSync: (
      parameters: WithOptionalPayer<SendTransactionSyncParameters>,
    ) => Promise<SendTransactionSyncReturnType>
    /** End-to-end ERC-8168 sponsored-calls flow (fetch terms, select, submit). */
    sendSponsoredCalls: (
      parameters: WithOptionalPayer<SendSponsoredCallsParameters>,
    ) => Promise<SendSponsoredCallsReturnType>
  }
}

export type Eip8168ActionsParameters = {
  /**
   * Default payer service client used by every `client.payer.*` call. Individual
   * calls may still pass their own `payerClient` to override it. Omit to require
   * `payerClient` on each call.
   */
  payerClient?: PayerClient | undefined
}

/**
 * A suite of ERC-8168 payer actions, added to a client under `client.payer`.
 * Payment is a capability of the fill: `prepareTransactionRequest` surfaces
 * offers, and `sendTransaction` submits the chosen one.
 *
 * @example
 * import { createClient, http } from 'viem'
 * import { baseSepolia } from 'viem/chains'
 * import { createPayerClient, eip8168Actions } from 'viem/eip8168'
 *
 * const payerClient = createPayerClient({ url: 'https://payer.example.com/v1' })
 * const client = createClient({
 *   chain: baseSepolia,
 *   transport: http(),
 * }).extend(eip8168Actions({ payerClient }))
 *
 * const { capabilities } = await client.payer.prepareTransactionRequest({
 *   account,
 *   calls: [{ to, data }],
 *   capabilities: { paymasterService: {} },
 * })
 * const { transactionHash } = await client.payer.sendTransaction({
 *   account,
 *   calls: [{ to, data }],
 *   capabilities: { paymentOption: capabilities.paymentOptions[0], gasEstimate: capabilities.gasEstimate },
 * })
 */
export function eip8168Actions(parameters: Eip8168ActionsParameters = {}) {
  const { payerClient: defaultPayerClient } = parameters

  const withPayer = <p extends { payerClient?: PayerClient | undefined }>(
    p: p,
  ): p & { payerClient: PayerClient } => {
    const payerClient = p.payerClient ?? defaultPayerClient
    if (!payerClient)
      throw new BaseError(
        '`payerClient` is required: pass it to `eip8168Actions({ payerClient })` or on the call.',
      )
    return { ...p, payerClient }
  }

  return <
    transport extends Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): Eip8168Actions => ({
    payer: {
      prepareTransactionRequest: (parameters) =>
        prepareTransactionRequest(client, withPayer(parameters)),
      sendTransaction: (parameters) =>
        sendTransaction(client, withPayer(parameters)),
      sendTransactionSync: (parameters) =>
        sendTransactionSync(client, withPayer(parameters)),
      sendSponsoredCalls: (parameters) =>
        sendSponsoredCalls(client, withPayer(parameters)),
    },
  })
}
