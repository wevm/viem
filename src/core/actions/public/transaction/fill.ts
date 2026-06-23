import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import * as Transaction from 'ox/Transaction'
import * as TransactionRequest from 'ox/TransactionRequest'
import { z } from 'ox/zod'

import type * as Account from '../../../Account.js'
import type * as Capabilities from '../../../Capabilities.js'
import type * as Chain from '../../../Chain.js'
import type * as Client from '../../../Client.js'
import * as NodeError from '../../../NodeError.js'
import type * as NonceManager from '../../../NonceManager.js'
import { isAbortError } from '../../../internal/errors.js'
import * as transactionRequest from '../../internal/transactionRequest.js'
import { get as getBlock } from '../block/get.js'
import { getId } from '../chains/getId.js'
import { BaseFeeScalarError } from '../fee/estimateFeesPerGas.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

/**
 * Fills a transaction request with the fields required to be signed over, via
 * `eth_fillTransaction`.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const { raw, transaction } = await Actions.transaction.fill(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1n,
 * })
 * ```
 */
export async function fill<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: fill.Options<chain>,
): Promise<fill.ReturnType<chain>> {
  const {
    account: account_ = client.account,
    chain = client.chain,
    nonce: nonce_,
    nonceManager,
    requestOptions,
    ...rest
  } = options

  const from = account_
    ? typeof account_ === 'string'
      ? account_
      : account_.address
    : rest.from

  const nonce = await (async () => {
    if (!from) return nonce_
    if (!nonceManager) return nonce_
    if (typeof nonce_ !== 'undefined') return nonce_
    const chainId = chain ? chain.id : await getId(client)
    return nonceManager.consume({ address: from, chainId, client })
  })()

  transactionRequest.assert(rest)

  const request = {
    ...rest,
    data: rest.data ?? rest.input,
    from,
    input: undefined,
    nonce,
  } satisfies TransactionRequest.toRpc.Input

  // The chain codec is an untyped `z.ZodMiniType`, so its decoded output widens
  // to `unknown`; assert back to the RPC shape it produces.
  const rpcRequest: TransactionRequest.Rpc = chain?.schema?.transactionRequest
    ?.toRpc
    ? (z.decode(
        chain.schema.transactionRequest.toRpc,
        request,
      ) as TransactionRequest.Rpc)
    : TransactionRequest.toRpc(request)

  try {
    const response = await client.request(
      { method: 'eth_fillTransaction', params: [rpcRequest] },
      requestOptions,
    )

    const transaction = (
      chain?.schema?.transaction?.fromRpc
        ? z.decode(chain.schema.transaction.fromRpc, response.tx)
        : Transaction.fromRpc(response.tx)
    ) as Record<string, any>

    // Remove unnecessary fields.
    delete transaction.blockHash
    delete transaction.blockNumber
    delete transaction.r
    delete transaction.s
    delete transaction.transactionIndex
    delete transaction.v
    delete transaction.yParity

    // Rewrite fields.
    transaction.data = transaction.input

    // Preference supplied fees (some nodes do not take these preferences).
    // Coerce to `bigint` so the return type stays consistent with the
    // node-derived (decoded) values regardless of the supplied input format.
    const quantity = (value: bigint | number | Hex.Hex | undefined) =>
      typeof value === 'undefined' ? undefined : BigInt(value)
    if (transaction.gas)
      transaction.gas = quantity(options.gas) ?? transaction.gas
    if (transaction.gasPrice)
      transaction.gasPrice = quantity(options.gasPrice) ?? transaction.gasPrice
    if (transaction.maxFeePerBlobGas)
      transaction.maxFeePerBlobGas =
        quantity(options.maxFeePerBlobGas) ?? transaction.maxFeePerBlobGas
    if (transaction.maxFeePerGas)
      transaction.maxFeePerGas =
        quantity(options.maxFeePerGas) ?? transaction.maxFeePerGas
    if (transaction.maxPriorityFeePerGas)
      transaction.maxPriorityFeePerGas =
        quantity(options.maxPriorityFeePerGas) ??
        transaction.maxPriorityFeePerGas
    if (typeof transaction.nonce !== 'undefined')
      transaction.nonce = quantity(options.nonce) ?? transaction.nonce

    // Build the fee multiplier from the chain's `baseFeeMultiplier`.
    const feeMultiplier = await (async () => {
      if (typeof chain?.fees?.baseFeeMultiplier === 'function')
        return chain.fees.baseFeeMultiplier({
          block: await getBlock(client),
          client,
          request,
        })
      return chain?.fees?.baseFeeMultiplier ?? 1.2
    })()
    if (feeMultiplier < 1) throw new BaseFeeScalarError()

    const decimals = feeMultiplier.toString().split('.')[1]?.length ?? 0
    const denominator = 10 ** decimals
    const multiplyFee = (base: bigint) =>
      (base * BigInt(Math.ceil(feeMultiplier * denominator))) /
      BigInt(denominator)

    // Apply the fee multiplier to node-derived fees the caller did not supply.
    if (!transaction.feePayerSignature) {
      if (transaction.maxFeePerGas && !options.maxFeePerGas)
        transaction.maxFeePerGas = multiplyFee(transaction.maxFeePerGas)
      if (transaction.gasPrice && !options.gasPrice)
        transaction.gasPrice = multiplyFee(transaction.gasPrice)
    }

    return {
      raw: response.raw,
      transaction: { from, ...transaction },
      ...(response.capabilities ? { capabilities: response.capabilities } : {}),
    } as fill.ReturnType<chain>
  } catch (err) {
    if (isAbortError(err)) throw err

    // TODO: wrap in a `TransactionExecutionError` once the node/contract error
    // subsystem is ported.
    const nodeError = NodeError.fromRpcError(err as Error, {
      gas: rest.gas,
      maxFeePerGas: rest.maxFeePerGas,
      maxPriorityFeePerGas: rest.maxPriorityFeePerGas,
      nonce,
    })
    if (nodeError instanceof NodeError.UnknownNodeError) throw err
    throw nodeError
  }
}

export declare namespace fill {
  type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  > = Chain.ExtractTransactionRequest<chain> & {
    /** Account (or address) the transaction is sent from. */
    account?: Account.Account | Address.Address | undefined
    /** Chain the transaction targets. @default client.chain */
    chain?: Chain.Chain | undefined
    /** Nonce manager used to derive the transaction nonce. */
    nonceManager?: NonceManager.NonceManager | undefined
    /** Options to pass to the underlying RPC request. */
    requestOptions?: RequestOptions | undefined
  }

  type ReturnType<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  > = {
    /** Node capabilities (if returned). */
    capabilities?:
      | Capabilities.Extract<'fillTransaction', 'ReturnType'>
      | undefined
    /** Raw signed-over transaction. */
    raw: Hex.Hex
    /** Filled transaction. */
    transaction: Chain.ExtractTransaction<chain, true> & {
      from: Address.Address
    }
  }

  type ErrorType =
    | transactionRequest.assert.ErrorType
    | BaseFeeScalarError
    | Errors.GlobalErrorType
}
