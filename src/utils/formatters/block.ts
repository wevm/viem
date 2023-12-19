import type { ErrorType } from '../../errors/utils.js'
import type { Block, BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type {
  ExtractChainFormatterExclude,
  ExtractChainFormatterReturnType,
} from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { RpcBlock } from '../../types/rpc.js'
import type { Prettify } from '../../types/utils.js'

import { type DefineFormatterErrorType, defineFormatter } from './formatter.js'
import { type FormattedTransaction, formatTransaction } from './transaction.js'

type BlockPendingDependencies = 'hash' | 'logsBloom' | 'nonce' | 'number'

export type FormattedBlock<
  TChain extends { formatters?: Chain['formatters'] } | undefined =
    | { formatters?: Chain['formatters'] }
    | undefined,
  TIncludeTransactions extends boolean = boolean,
  TBlockTag extends BlockTag = BlockTag,
  _FormatterReturnType = ExtractChainFormatterReturnType<
    TChain,
    'block',
    Block<bigint, TIncludeTransactions>
  >,
  _ExcludedPendingDependencies extends string = BlockPendingDependencies &
    ExtractChainFormatterExclude<TChain, 'block'>,
  _Formatted = Omit<_FormatterReturnType, BlockPendingDependencies> & {
    [_key in _ExcludedPendingDependencies]: never
  } & Pick<
      Block<bigint, TIncludeTransactions, TBlockTag>,
      BlockPendingDependencies
    >,
  _Transactions = TIncludeTransactions extends true
    ? Prettify<FormattedTransaction<TChain, TBlockTag>>[]
    : Hash[],
> = Omit<_Formatted, 'transactions'> & {
  transactions: _Transactions
}

export type FormatBlockErrorType = ErrorType

export function formatBlock(block: Partial<RpcBlock>) {
  const transactions = block.transactions?.map((transaction) => {
    if (typeof transaction === 'string') return transaction
    return formatTransaction(transaction)
  })
  return {
    ...block,
    baseFeePerGas: block.baseFeePerGas ? BigInt(block.baseFeePerGas) : null,
    difficulty: block.difficulty ? BigInt(block.difficulty) : undefined,
    gasLimit: block.gasLimit ? BigInt(block.gasLimit) : undefined,
    gasUsed: block.gasUsed ? BigInt(block.gasUsed) : undefined,
    hash: block.hash ? block.hash : null,
    logsBloom: block.logsBloom ? block.logsBloom : null,
    nonce: block.nonce ? block.nonce : null,
    number: block.number ? BigInt(block.number) : null,
    size: block.size ? BigInt(block.size) : undefined,
    timestamp: block.timestamp ? BigInt(block.timestamp) : undefined,
    transactions,
    totalDifficulty: block.totalDifficulty
      ? BigInt(block.totalDifficulty)
      : null,
  } as Block
}

export type DefineBlockErrorType = DefineFormatterErrorType | ErrorType

export const defineBlock = /*#__PURE__*/ defineFormatter('block', formatBlock)
