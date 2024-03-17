import type { Account } from '../accounts/types.js'
import type { EstimateGasParameters } from '../actions/public/estimateGas.js'
import type { Chain } from '../types/chain.js'
import { formatEther } from '../utils/unit/formatEther.js'
import { formatGwei } from '../utils/unit/formatGwei.js'

import { BaseError } from './base.js'
import { prettyPrint } from './transaction.js'

export type EstimateGasExecutionErrorType = EstimateGasExecutionError & {
  name: 'EstimateGasExecutionError'
}
export class EstimateGasExecutionError extends BaseError {
  override cause: BaseError

  override name = 'EstimateGasExecutionError'

  constructor(
    cause: BaseError,
    {
      account,
      docsPath,
      chain,
      data,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
    }: Omit<EstimateGasParameters<any>, 'account'> & {
      account?: Account | undefined
      chain?: Chain | undefined
      docsPath?: string | undefined
    },
  ) {
    const prettyArgs = prettyPrint({
      from: account?.address,
      to,
      value:
        typeof value !== 'undefined' &&
        `${formatEther(value)} ${chain?.nativeCurrency?.symbol || 'ETH'}`,
      data,
      gas,
      gasPrice:
        typeof gasPrice !== 'undefined' && `${formatGwei(gasPrice)} gwei`,
      maxFeePerGas:
        typeof maxFeePerGas !== 'undefined' &&
        `${formatGwei(maxFeePerGas)} gwei`,
      maxPriorityFeePerGas:
        typeof maxPriorityFeePerGas !== 'undefined' &&
        `${formatGwei(maxPriorityFeePerGas)} gwei`,
      nonce,
    })

    super(cause.shortMessage, {
      cause,
      docsPath,
      metaMessages: [
        ...(cause.metaMessages ? [...cause.metaMessages, ' '] : []),
        'Estimate Gas Arguments:',
        prettyArgs,
      ].filter(Boolean) as string[],
    })
    this.cause = cause
  }
}
