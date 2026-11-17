import { TxEnvelopeEip1559, Value } from 'ox'
import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import { gasPriceOracleAbi } from '../../abis.js'
import type { estimateL1Fee } from './estimateL1Fee.js'
import { resolveGasPriceOracleAddress } from './internal.js'

/** Estimates the L1 data gas required to execute an L2 transaction. */
export async function estimateL1Gas<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: estimateL1Gas.Options,
): Promise<estimateL1Gas.ReturnType> {
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
    functionName: 'getL1GasUsed',
  })
}

export declare namespace estimateL1Gas {
  /** Options for {@link estimateL1Gas}. */
  type Options = estimateL1Fee.Options

  /** Return type of {@link estimateL1Gas}. */
  type ReturnType = bigint

  /** Errors thrown by {@link estimateL1Gas}. */
  type ErrorType =
    | read.ErrorType
    | TxEnvelopeEip1559.serialize.ErrorType
    | Errors.GlobalErrorType
}
