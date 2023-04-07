import type { EstimateGasParameters } from '../actions/index.js'
import type { Account, Chain } from '../types/index.js'
import { formatEther, formatGwei } from '../utils/index.js'
import { BaseError } from './base.js'
import { prettyPrint } from './transaction.js'

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
    }: Omit<EstimateGasParameters<any, any>, 'account'> & {
      account?: Account
      chain?: Chain
      docsPath?: string
    },
  ) {
    const prettyArgs = prettyPrint({
      from: account?.address,
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
