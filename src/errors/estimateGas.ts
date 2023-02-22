import { EstimateGasArgs } from '../actions'
import { Chain } from '../types'
import { formatEther, formatGwei } from '../utils'
import { BaseError } from './base'
import { prettyPrint } from './transaction'

export class EstimateGasExecutionError extends BaseError {
  cause: BaseError

  name = 'EstimateGasExecutionError'

  constructor(
    cause: BaseError,
    {
      docsPath,
      from,
      chain,
      data,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
    }: EstimateGasArgs & { chain?: Chain; docsPath?: string },
  ) {
    const prettyArgs = prettyPrint({
      from,
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
