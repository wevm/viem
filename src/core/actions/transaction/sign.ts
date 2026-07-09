import { TransactionRequest } from 'ox'
import type {
  Address,
  Errors,
  Hex,
  Kzg,
  TransactionEnvelope as TxEnvelope,
} from 'ox'

import * as Account from '../../Account.js'
import * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import * as transactionRequest from '../internal/transactionRequest.js'
import { getId } from '../chains/getId.js'
import { prepare } from './prepare.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

/**
 * Signs a transaction.
 *
 * - Local Accounts: signs locally (no JSON-RPC request).
 * - JSON-RPC Accounts: signs via `eth_signTransaction`.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const signed = await Actions.transaction.sign(client, {
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1n,
 * })
 * ```
 */
export async function sign<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: sign.Options<chain>,
): Promise<sign.ReturnType> {
  // Optionally run the prepare ceremony to populate the fields that must be
  // signed over (e.g. `nonce`, `chainId`, fees, `gas`, `type`) before signing.
  const options_ = await (async () => {
    if (!options.prepare) return options
    const { request } = await prepare(client, {
      ...options,
      prepare: undefined,
    } as never)
    return { ...options, ...request }
  })()

  const {
    account: account_ = client.account,
    chain: chain_,
    kzg,
    prepare: _prepare,
    requestOptions,
    ...rest
  } = options_

  if (!account_) throw new Account.NotFoundError()
  const account =
    typeof account_ === 'string' ? Account.from(account_) : account_

  // `null` opts out of the current-chain assertion; `undefined` falls back to
  // the client's chain.
  const chain = chain_ === null ? null : (chain_ ?? client.chain)
  // The chain whose converter encodes the request (the opt-out does not apply).
  const schemaChain = chain_ ?? client.chain

  transactionRequest.assert(rest)

  const chainId = await getId(client)
  // Only json-rpc accounts assert the connected chain: a local account signs
  // offline against the resolved `chainId`, so there is no wallet chain to
  // mismatch.
  if (chain && account.type === 'json-rpc')
    Chain.assertCurrent({ chain, currentChainId: chainId })

  const request = {
    ...rest,
    chainId,
    from: account.address,
  } satisfies TransactionRequest.toRpc.Input

  if (account.type === 'local') {
    // A chain hook may produce a custom (opaque) envelope; it round-trips
    // into the same chain's `getSignPayload`/`serialize` via the account.
    // A hook returning `undefined` delegates to the generic default.
    const envelope = ((await schemaChain?.transaction?.toEnvelope?.(
      request as TransactionRequest.TransactionRequest,
      { kzg },
    )) ??
      TransactionRequest.toEnvelope(
        request as TransactionRequest.TransactionRequest,
        { kzg },
      )) as TxEnvelope.TxEnvelope
    return account.signTransaction(envelope, { chain: schemaChain })
  }

  // Chain converters are untyped; assert back to the RPC shape produced.
  const toRpc = schemaChain?.schema?.transactionRequest?.toRpc
  const rpc: TransactionRequest.Rpc = toRpc
    ? (toRpc(request) as TransactionRequest.Rpc)
    : TransactionRequest.toRpc(request)

  return client.request(
    { method: 'eth_signTransaction', params: [rpc] },
    { ...requestOptions, retryCount: 0 },
  )
}

export declare namespace sign {
  type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  > = Chain.ExtractTransactionRequest<chain> & {
    /** Account (or address) signing the transaction. @default client.account */
    account?: Account.Account | Address.Address | undefined
    /**
     * Chain the transaction targets. Pass `null` to skip the current-chain
     * assertion.
     * @default client.chain
     */
    chain?: Chain.Chain | null | undefined
    /** KZG context, used to derive blob fields from `blobs`. */
    kzg?: Kzg.Kzg | undefined
    /**
     * Whether to prepare the transaction request before signing (populating
     * `nonce`, `chainId`, fees, `gas`, and `type`).
     * @default false
     */
    prepare?: boolean | undefined
    /** Options to pass to the underlying RPC request. */
    requestOptions?: RequestOptions | undefined
  }

  type ReturnType = Hex.Hex

  type ErrorType =
    | Account.NotFoundError
    | Account.from.ErrorType
    | Chain.assertCurrent.ErrorType
    | getId.ErrorType
    | prepare.ErrorType
    | transactionRequest.assert.ErrorType
    | TransactionRequest.toEnvelope.ErrorType
    | TransactionRequest.toRpc.ErrorType
    | Errors.GlobalErrorType
}
