import {
  ChainDoesNotSupportContract,
  ChainMismatchError,
  ChainNotFoundError,
} from '../errors/chain.js'
import type { Chain, ChainContract } from '../types/chain.js'
import type { Formatters } from '../types/formatter.js'

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
  TFormatters extends Formatters = Formatters,
  TChain extends Chain<TFormatters> = Chain<TFormatters>,
>(chain: TChain) {
  return chain
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
