import type { Chain, Formatter } from '../../chains'
import type { Block, RpcBlock } from '../../types'
import type { ExtractFormatter, FormatOptions, Formatted } from '../format'
import { format } from '../format'

export type BlockFormatter<TChain extends Chain = Chain> = ExtractFormatter<
  TChain,
  'block'
>

type FormatBlockOptions = {
  formatter?: FormatOptions<RpcBlock, Block>['formatter']
}

export type FormattedBlock<
  TFormatter extends Formatter | undefined = Formatter,
> = Formatted<RpcBlock, Block, TFormatter>

export function formatBlock<
  TFormatter extends Formatter | undefined = Formatter,
>(
  block: RpcBlock,
  { formatter }: FormatBlockOptions = {},
): FormattedBlock<TFormatter> {
  return format<RpcBlock, Block, TFormatter>(block, {
    replacer: {
      baseFeePerGas: (block) =>
        block.baseFeePerGas ? BigInt(block.baseFeePerGas) : null,
      difficulty: (block) => BigInt(block.difficulty),
      gasLimit: (block) => BigInt(block.gasLimit),
      gasUsed: (block) => BigInt(block.gasUsed),
      number: (block) => (block.number ? BigInt(block.number) : null),
      size: (block) => BigInt(block.size),
      timestamp: (block) => BigInt(block.timestamp),
      totalDifficulty: (block) =>
        block.totalDifficulty ? BigInt(block.totalDifficulty) : null,
    },
    formatter,
  })
}
