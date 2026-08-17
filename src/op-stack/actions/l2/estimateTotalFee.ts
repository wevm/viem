import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { getGasPrice } from '../../../core/actions/fee/getGasPrice.js'
import { estimateGas } from '../../../core/actions/transaction/estimateGas.js'
import { prepare } from '../../../core/actions/transaction/prepare.js'
import { estimateL1Fee } from './estimateL1Fee.js'
import { estimateOperatorFee } from './estimateOperatorFee.js'

/**
 * Estimates the L1 data, L2 execution, and operator fees for an L2 transaction.
 *
 * Requires an Isthmus-compatible `GasPriceOracle.getOperatorFee` implementation.
 */
export async function estimateTotalFee<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: estimateTotalFee.Options,
): Promise<estimateTotalFee.ReturnType> {
  const { gasPriceOracleAddress, ...transaction } = options
  const { request } = await prepare(
    client,
    transaction as prepare.Options<chain>,
  )
  const feeOptions = {
    ...request,
    gasPriceOracleAddress,
  } as estimateL1Fee.Options
  const [l1Fee, operatorFee, l2Gas, l2GasPrice] = await Promise.all([
    estimateL1Fee(client, feeOptions),
    estimateOperatorFee(client, feeOptions),
    estimateGas(client, request),
    getGasPrice(client),
  ])
  return l1Fee + operatorFee + l2Gas * l2GasPrice
}

export declare namespace estimateTotalFee {
  /** Options for {@link estimateTotalFee}. */
  type Options = estimateL1Fee.Options

  /** Return type of {@link estimateTotalFee}. */
  type ReturnType = bigint

  /** Errors thrown by {@link estimateTotalFee}. */
  type ErrorType =
    | prepare.ErrorType
    | estimateL1Fee.ErrorType
    | estimateOperatorFee.ErrorType
    | estimateGas.ErrorType
    | getGasPrice.ErrorType
    | Errors.GlobalErrorType
}
