import type { Block } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { Formatter, Formatters } from '../../types/formatter.js'
import type { RpcBlock } from '../../types/rpc.js'

import {
  type ExtractFormatter,
  type Formatted,
  defineFormatter,
} from './format.js'
import { formatTransaction } from './transaction.js'

export type BlockFormatter<TChain extends Chain | undefined = Chain> =
  TChain extends Chain
    ? ExtractFormatter<TChain, 'block', NonNullable<Formatters['block']>>
    : Formatters['block']

export type FormattedBlock<
  TFormatter extends Formatter | undefined = Formatter,
> = Formatted<TFormatter, Block>

export function formatBlock(block: Partial<RpcBlock>) {
  // TODO: Properly format transactions with a custom formatter
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

export const defineBlock = defineFormatter({ format: formatBlock })
