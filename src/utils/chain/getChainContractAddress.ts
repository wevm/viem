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
  allowMissing,
}: {
  blockNumber?: bigint
  chain: Chain
  contract: string
  allowMissing?: boolean
}) {
  const contract = (chain?.contracts as Record<string, ChainContract>)?.[name]

  if (!contract && !allowMissing)
    throw new ChainDoesNotSupportContract({
      chain,
      contract: { name },
    })

  const deployedContract = blockNumber
    ? contract?.blockCreated && contract.blockCreated <= blockNumber
    : !!contract

  if (!allowMissing && !deployedContract)
    throw new ChainDoesNotSupportContract({
      blockNumber,
      chain,
      contract: {
        name,
        blockCreated: contract.blockCreated,
      },
    })

  return deployedContract ? contract.address : undefined
}
