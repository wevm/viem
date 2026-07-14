import { TxEnvelopeEip1559, Value } from 'ox'
import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import { gasPriceOracleAbi } from '../../abis.js'
import { resolveGasPriceOracleAddress } from './internal.js'

/** Estimates the L1 data fee required to execute an L2 transaction. */
export async function estimateL1Fee<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: estimateL1Fee.Options,
): Promise<estimateL1Fee.ReturnType> {
  const {
    account: _,
    chain = client.chain,
    chainId = chain?.id ?? 1,
    gasPriceOracleAddress,
    ...request
  } = options
  const address = resolveGasPriceOracleAddress({
    address: gasPriceOracleAddress,
    chain,
  })
  const transaction = TxEnvelopeEip1559.serialize({
    ...request,
    chainId,
    gas: options.data ? 300_000n : 21_000n,
    maxFeePerGas: Value.fromGwei('5'),
    maxPriorityFeePerGas: Value.fromGwei('1'),
    nonce: 1n,
    type: 'eip1559',
  })

  return read(client, {
    abi: gasPriceOracleAbi,
    address,
    args: [transaction],
    functionName: 'getL1Fee',
  })
}

export declare namespace estimateL1Fee {
  /** Options for {@link estimateL1Fee}. */
  type Options = Omit<
    TxEnvelopeEip1559.TxEnvelopeEip1559<false>,
    | 'chainId'
    | 'from'
    | 'input'
    | 'nonce'
    | 'r'
    | 's'
    | 'type'
    | 'v'
    | 'yParity'
  > & {
    /** Account (or address) sending the transaction. */
    account?: Account.Account | Address.Address | undefined
    /** Chain the transaction targets. @default client.chain */
    chain?: Chain.Chain | null | undefined
    /** Chain id used to serialize the transaction. @default chain.id */
    chainId?: number | undefined
    /** Gas price oracle address. */
    gasPriceOracleAddress?: Address.Address | undefined
    /** Unique number identifying the transaction. */
    nonce?: number | undefined
    /** Transaction type. */
    type?: 'eip1559' | undefined
  }

  /** Return type of {@link estimateL1Fee}. */
  type ReturnType = bigint

  /** Errors thrown by {@link estimateL1Fee}. */
  type ErrorType =
    | read.ErrorType
    | TxEnvelopeEip1559.serialize.ErrorType
    | Errors.GlobalErrorType
}
