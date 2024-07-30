import type { ErrorType } from '../../errors/utils.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type {
  ExtractChainFormatterExclude,
  ExtractChainFormatterReturnType,
} from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import type { RpcTransaction } from '../../types/rpc.js'
import type { Transaction, TransactionType } from '../../types/transaction.js'
import type { ExactPartial, UnionLooseOmit } from '../../types/utils.js'
import { hexToNumber } from '../encoding/fromHex.js'
import { type DefineFormatterErrorType, defineFormatter } from './formatter.js'

type TransactionPendingDependencies =
  | 'blockHash'
  | 'blockNumber'
  | 'transactionIndex'

export type FormattedTransaction<
  chain extends Chain | undefined = undefined,
  blockTag extends BlockTag = BlockTag,
  _FormatterReturnType = ExtractChainFormatterReturnType<
    chain,
    'transaction',
    Transaction
  >,
  _ExcludedPendingDependencies extends string = TransactionPendingDependencies &
    ExtractChainFormatterExclude<chain, 'transaction'>,
> = UnionLooseOmit<_FormatterReturnType, TransactionPendingDependencies> & {
  [_K in _ExcludedPendingDependencies]: never
} & Pick<
    Transaction<bigint, number, blockTag extends 'pending' ? true : false>,
    TransactionPendingDependencies
  >

export const transactionType = {
  '0x0': 'legacy',
  '0x1': 'eip2930',
  '0x2': 'eip1559',
  '0x3': 'eip4844',
} as const satisfies Record<Hex, TransactionType>

export type FormatTransactionErrorType = ErrorType

export function formatTransaction(transaction: ExactPartial<RpcTransaction>) {
  const transaction_ = {
    ...transaction,
    blockHash: transaction.blockHash ? transaction.blockHash : null,
    blockNumber: transaction.blockNumber
      ? BigInt(transaction.blockNumber)
      : null,
    chainId: transaction.chainId ? hexToNumber(transaction.chainId) : undefined,
    gas: transaction.gas ? BigInt(transaction.gas) : undefined,
    gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : undefined,
    maxFeePerBlobGas: transaction.maxFeePerBlobGas
      ? BigInt(transaction.maxFeePerBlobGas)
      : undefined,
    maxFeePerGas: transaction.maxFeePerGas
      ? BigInt(transaction.maxFeePerGas)
      : undefined,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas
      ? BigInt(transaction.maxPriorityFeePerGas)
      : undefined,
    nonce: transaction.nonce ? hexToNumber(transaction.nonce) : undefined,
    to: transaction.to ? transaction.to : null,
    transactionIndex: transaction.transactionIndex
      ? Number(transaction.transactionIndex)
      : null,
    type: transaction.type
      ? (transactionType as any)[transaction.type]
      : undefined,
    typeHex: transaction.type ? transaction.type : undefined,
    value: transaction.value ? BigInt(transaction.value) : undefined,
    v: transaction.v ? BigInt(transaction.v) : undefined,
  } as Transaction

  transaction_.yParity = (() => {
    // If `yParity` is provided, we will use it.
    if (transaction.yParity) return Number(transaction.yParity)

    // If no `yParity` provided, try derive from `v`.
    if (typeof transaction_.v === 'bigint') {
      if (transaction_.v === 0n || transaction_.v === 27n) return 0
      if (transaction_.v === 1n || transaction_.v === 28n) return 1
      if (transaction_.v >= 35n) return transaction_.v % 2n === 0n ? 1 : 0
    }

    return undefined
  })()

  if (transaction_.type === 'legacy') {
    delete transaction_.accessList
    delete transaction_.maxFeePerBlobGas
    delete transaction_.maxFeePerGas
    delete transaction_.maxPriorityFeePerGas
    delete transaction_.yParity
  }
  if (transaction_.type === 'eip2930') {
    delete transaction_.maxFeePerBlobGas
    delete transaction_.maxFeePerGas
    delete transaction_.maxPriorityFeePerGas
  }
  if (transaction_.type === 'eip1559') {
    delete transaction_.maxFeePerBlobGas
  }
  return transaction_
}

export type DefineTransactionErrorType = DefineFormatterErrorType | ErrorType

export const defineTransaction = /*#__PURE__*/ defineFormatter(
  'transaction',
  formatTransaction,
)
