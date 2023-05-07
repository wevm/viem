import type { Chain } from '../../types/chain.js'
import type { Formatter, Formatters } from '../../types/formatter.js'
import type { RpcTransactionReceipt } from '../../types/rpc.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import { hexToNumber } from '../encoding/fromHex.js'

import {
  type ExtractFormatter,
  type Formatted,
  defineFormatter,
} from './format.js'
import { formatLog } from './log.js'
import { transactionType } from './transaction.js'

export type TransactionReceiptFormatter<
  TChain extends Chain | undefined = Chain,
> = TChain extends Chain
  ? ExtractFormatter<
      TChain,
      'transactionReceipt',
      NonNullable<Formatters['transactionReceipt']>
    >
  : Formatters['transactionReceipt']

export type FormattedTransactionReceipt<
  TFormatter extends Formatter | undefined = Formatter,
> = Formatted<TFormatter, TransactionReceipt>

const statuses = {
  '0x0': 'reverted',
  '0x1': 'success',
} as const

export function formatTransactionReceipt(
  transactionReceipt: Partial<RpcTransactionReceipt>,
) {
  return {
    ...transactionReceipt,
    blockNumber: transactionReceipt.blockNumber
      ? BigInt(transactionReceipt.blockNumber)
      : null,
    contractAddress: transactionReceipt.contractAddress
      ? transactionReceipt.contractAddress
      : null,
    cumulativeGasUsed: transactionReceipt.cumulativeGasUsed
      ? BigInt(transactionReceipt.cumulativeGasUsed)
      : null,
    effectiveGasPrice: transactionReceipt.effectiveGasPrice
      ? BigInt(transactionReceipt.effectiveGasPrice)
      : null,
    gasUsed: transactionReceipt.gasUsed
      ? BigInt(transactionReceipt.gasUsed)
      : null,
    logs: transactionReceipt.logs
      ? transactionReceipt.logs.map((log) => formatLog(log))
      : null,
    to: transactionReceipt.to ? transactionReceipt.to : null,
    transactionIndex: transactionReceipt.transactionIndex
      ? hexToNumber(transactionReceipt.transactionIndex)
      : null,
    status: transactionReceipt.status
      ? statuses[transactionReceipt.status]
      : null,
    type: transactionReceipt.type
      ? transactionType[transactionReceipt.type]
      : null,
  } as TransactionReceipt
}

export const defineTransactionReceipt = defineFormatter({
  format: formatTransactionReceipt,
})
