import type { Block } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { ExtractFormatterReturnType } from '../../types/formatter.js'
import type { RpcBlock } from '../../types/rpc.js'

import { defineFormatter } from './formatter.js'
import { formatTransaction } from './transaction.js'

export type FormattedBlock<
  TChain extends Chain | undefined = Chain | undefined,
> = ExtractFormatterReturnType<TChain, 'block', Block>

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

export const defineBlock = /*#__PURE__*/ defineFormatter('block', formatBlock)
