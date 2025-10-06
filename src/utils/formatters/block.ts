import type { ErrorType } from '../../errors/utils.js'
import type { Block, BlockTag } from '../../types/block.js'
import type {
  Chain,
  ExtractChainFormatterExclude,
  ExtractChainFormatterReturnType,
} from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { RpcBlock } from '../../types/rpc.js'
import type { ExactPartial, Prettify } from '../../types/utils.js'

import { type DefineFormatterErrorType, defineFormatter } from './formatter.js'
import { type FormattedTransaction, formatTransaction } from './transaction.js'

type BlockPendingDependencies = 'hash' | 'logsBloom' | 'nonce' | 'number'

export type FormattedBlock<
  chain extends Chain | undefined = undefined,
  includeTransactions extends boolean = boolean,
  blockTag extends BlockTag = BlockTag,
  _FormatterReturnType = ExtractChainFormatterReturnType<
    chain,
    'block',
    Block<bigint, includeTransactions>
  >,
  _ExcludedPendingDependencies extends string = BlockPendingDependencies &
    ExtractChainFormatterExclude<chain, 'block'>,
  _Formatted = Omit<_FormatterReturnType, BlockPendingDependencies> & {
    [_key in _ExcludedPendingDependencies]: never
  } & Pick<
      Block<bigint, includeTransactions, blockTag>,
      BlockPendingDependencies
    >,
  _Transactions = includeTransactions extends true
    ? Prettify<FormattedTransaction<chain, blockTag>>[]
    : Hash[],
> = Omit<_Formatted, 'transactions'> & {
  transactions: _Transactions
}

export type FormatBlockErrorType = ErrorType

export function formatBlock(
  block: ExactPartial<RpcBlock>,
  _?: string | undefined,
) {
  const transactions = (block.transactions ?? []).map((transaction) => {
    if (typeof transaction === 'string') return transaction
    return formatTransaction(transaction)
  })
  return {
    ...block,
    baseFeePerGas: block.baseFeePerGas ? BigInt(block.baseFeePerGas) : null,
    blobGasUsed: block.blobGasUsed ? BigInt(block.blobGasUsed) : undefined,
    difficulty: block.difficulty ? BigInt(block.difficulty) : undefined,
    excessBlobGas: block.excessBlobGas
      ? BigInt(block.excessBlobGas)
      : undefined,
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
