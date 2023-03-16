import type { EstimateGasParameters } from '../actions'
import type { Chain } from '../types'
import { formatEther, formatGwei } from '../utils'
import { BaseError } from './base'
import { prettyPrint } from './transaction'

export class EstimateGasExecutionError extends BaseError {
  cause: BaseError

  name = 'EstimateGasExecutionError'

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
    }: EstimateGasParameters & { chain?: Chain; docsPath?: string },
  ) {
    const prettyArgs = prettyPrint({
      from: account.address,
      to,
      value:
        typeof value !== 'undefined' &&
        `${formatEther(value)} ${chain?.nativeCurrency.symbol || 'ETH'}`,
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
