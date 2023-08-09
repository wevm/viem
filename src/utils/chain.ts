import {
  ChainDoesNotSupportContract,
  ChainMismatchError,
  ChainNotFoundError,
} from '../errors/chain.js'
import type { Chain, ChainContract, ChainFormatters } from '../types/chain.js'

export type AssertCurrentChainParameters = {
  chain?: Chain
  currentChainId: number
}

export function assertCurrentChain({
  chain,
  currentChainId,
}: AssertCurrentChainParameters): void {
  if (!chain) throw new ChainNotFoundError()
  if (currentChainId !== chain.id)
    throw new ChainMismatchError({ chain, currentChainId })
}

export function defineChain<
  chain extends Chain,
  formatters extends ChainFormatters,
>(
  chain: chain,
  config?: Pick<Chain<formatters>, 'fees' | 'formatters' | 'serializers'>,
) {
  return {
    ...chain,
    fees: config?.fees,
    formatters: config?.formatters,
    serializers: config?.serializers,
  }
}

export function getChainContractAddress({
  blockNumber,
  chain,
  contract: name,
}: {
  blockNumber?: bigint
  chain: Chain
  contract: string
}) {
  const contract = (chain?.contracts as Record<string, ChainContract>)?.[name]
  if (!contract)
    throw new ChainDoesNotSupportContract({
      chain,
      contract: { name },
    })

  if (
    blockNumber &&
    contract.blockCreated &&
    contract.blockCreated > blockNumber
  )
    throw new ChainDoesNotSupportContract({
      blockNumber,
      chain,
      contract: {
        name,
        blockCreated: contract.blockCreated,
      },
    })

  return contract.address
}
