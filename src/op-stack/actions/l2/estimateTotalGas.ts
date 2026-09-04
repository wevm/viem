import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { estimateGas } from '../../../core/actions/transaction/estimateGas.js'
import { estimateL1Gas } from './estimateL1Gas.js'

/** Estimates the L1 data gas and L2 execution gas for an L2 transaction. */
export async function estimateTotalGas<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: estimateTotalGas.Options,
): Promise<estimateTotalGas.ReturnType> {
  const { chain: _, gasPriceOracleAddress: __, ...request } = options
  const [l1Gas, l2Gas] = await Promise.all([
    estimateL1Gas(client, options),
    estimateGas(client, request),
  ])
  return l1Gas + l2Gas
}

export declare namespace estimateTotalGas {
  /** Options for {@link estimateTotalGas}. */
  type Options = estimateL1Gas.Options

  /** Return type of {@link estimateTotalGas}. */
  type ReturnType = bigint

  /** Errors thrown by {@link estimateTotalGas}. */
  type ErrorType =
    | estimateL1Gas.ErrorType
    | estimateGas.ErrorType
    | Errors.GlobalErrorType
}
