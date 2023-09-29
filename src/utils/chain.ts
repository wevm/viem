import {
  ChainDoesNotSupportContract,
  type ChainDoesNotSupportContractErrorType,
  ChainMismatchError,
  type ChainMismatchErrorType,
  ChainNotFoundError,
  type ChainNotFoundErrorType,
} from '../errors/chain.js'
import type { ErrorType } from '../errors/utils.js'
import type {
  Chain,
  ChainConfig,
  ChainContract,
  ChainFormatters,
} from '../types/chain.js'
import type { Assign } from '../types/utils.js'

export type AssertCurrentChainParameters = {
  chain?: Chain
  currentChainId: number
}

export type AssertCurrentChainErrorType =
  | ChainNotFoundErrorType
  | ChainMismatchErrorType
  | ErrorType

export function assertCurrentChain({
  chain,
  currentChainId,
}: AssertCurrentChainParameters): void {
  if (!chain) throw new ChainNotFoundError()
  if (currentChainId !== chain.id)
    throw new ChainMismatchError({ chain, currentChainId })
}

export function defineChain<
  const chain extends Chain,
  formatters extends ChainFormatters,
>(
  chain: chain,
  config: ChainConfig<formatters> = {},
): Assign<chain, ChainConfig<formatters>> {
  const {
    fees = chain.fees,
    formatters = chain.formatters,
    serializers = chain.serializers,
  } = config
  return {
    ...chain,
    fees,
    formatters,
    serializers,
  } as unknown as Assign<chain, ChainConfig<formatters>>
}

export type GetChainContractAddressErrorType =
  ChainDoesNotSupportContractErrorType

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
