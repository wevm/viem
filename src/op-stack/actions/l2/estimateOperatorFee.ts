import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import { estimateGas } from '../../../core/actions/transaction/estimateGas.js'
import { gasPriceOracleAbi } from '../../abis.js'
import type { estimateL1Fee } from './estimateL1Fee.js'
import { resolveGasPriceOracleAddress } from './internal.js'

/**
 * Estimates the operator fee required to execute an L2 transaction.
 *
 * Requires an Isthmus-compatible `GasPriceOracle.getOperatorFee` implementation.
 */
export async function estimateOperatorFee<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: estimateOperatorFee.Options,
): Promise<estimateOperatorFee.ReturnType> {
  const { chain = client.chain, gasPriceOracleAddress, ...request } = options
  const address = resolveGasPriceOracleAddress({
    address: gasPriceOracleAddress,
    chain,
  })
  const gasUsed = await estimateGas(client, request)
  return read(client, {
    abi: gasPriceOracleAbi,
    address,
    args: [gasUsed],
    functionName: 'getOperatorFee',
  })
}

export declare namespace estimateOperatorFee {
  /** Options for {@link estimateOperatorFee}. */
  type Options = estimateL1Fee.Options

  /** Return type of {@link estimateOperatorFee}. */
  type ReturnType = bigint

  /** Errors thrown by {@link estimateOperatorFee}. */
  type ErrorType =
    | estimateGas.ErrorType
    | read.ErrorType
    | Errors.GlobalErrorType
}
