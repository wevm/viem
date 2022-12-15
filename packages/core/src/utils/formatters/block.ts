import type { Chain, Formatter } from '../../chains'
import type { Block, RpcBlock } from '../../types'
import type { ExtractFormatter, Formatted } from './format'

export type BlockFormatter<TChain extends Chain = Chain> = ExtractFormatter<
  TChain,
  'block'
>

export type FormattedBlock<
  TFormatter extends Formatter | undefined = Formatter,
> = Formatted<TFormatter, Block>

export function formatBlock(block: Partial<RpcBlock>) {
  return {
    ...block,
    baseFeePerGas: block.baseFeePerGas ? BigInt(block.baseFeePerGas) : null,
    difficulty: block.difficulty ? BigInt(block.difficulty) : undefined,
    gasLimit: block.gasLimit ? BigInt(block.gasLimit) : undefined,
    gasUsed: block.gasUsed ? BigInt(block.gasUsed) : undefined,
    number: block.number ? BigInt(block.number) : null,
    size: block.size ? BigInt(block.size) : undefined,
    timestamp: block.timestamp ? BigInt(block.timestamp) : undefined,
    totalDifficulty: block.totalDifficulty
      ? BigInt(block.totalDifficulty)
      : null,
  } as Block
}
