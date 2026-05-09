import {
  ChainDoesNotSupportContract,
  type ChainDoesNotSupportContractErrorType,
} from '../../errors/chain.js'
import type { Chain, ChainContract } from '../../types/chain.js'

export type GetChainContractAddressErrorType =
  ChainDoesNotSupportContractErrorType

export function getChainContractAddress({
  blockNumber,
  chain,
  contract: name,
}: {
  blockNumber?: bigint | undefined
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
