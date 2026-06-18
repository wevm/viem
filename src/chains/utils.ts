import type * as Errors from 'ox/Errors'

import type { Chain } from '../core/Chain.js'
import { BaseError } from '../core/Errors.js'

export type AssertCurrentChainParameters = {
  chain?: Chain | undefined
  currentChainId: number
}

export type AssertCurrentChainErrorType =
  | ChainNotFoundErrorType
  | ChainMismatchErrorType
  | Errors.GlobalErrorType

/** Asserts that the connected chain matches the chain targeted by a request. */
export function assertCurrentChain({
  chain,
  currentChainId,
}: AssertCurrentChainParameters): void {
  if (!chain) throw new ChainNotFoundError()
  if (currentChainId !== chain.id)
    throw new ChainMismatchError({ chain, currentChainId })
}

export type ExtractChainParameters<
  chains extends readonly Chain[],
  chainId extends chains[number]['id'],
> = {
  chains: chains
  id: chainId | chains[number]['id']
}

export type ExtractChainReturnType<
  chains extends readonly Chain[],
  chainId extends chains[number]['id'],
> = Extract<chains[number], { id: chainId }>

export type ExtractChainErrorType = Errors.GlobalErrorType

/** Extracts a chain from a list of chains by id, narrowing the return type. */
export function extractChain<
  const chains extends readonly Chain[],
  chainId extends chains[number]['id'],
>({
  chains,
  id,
}: ExtractChainParameters<chains, chainId>): ExtractChainReturnType<
  chains,
  chainId
> {
  return chains.find((chain) => chain.id === id) as ExtractChainReturnType<
    chains,
    chainId
  >
}

export type GetChainContractAddressErrorType =
  ChainDoesNotSupportContractErrorType

/** Resolves a named contract address on a chain (optionally at a block). */
export function getChainContractAddress({
  blockNumber,
  chain,
  contract: name,
}: {
  blockNumber?: bigint | undefined
  chain: Chain
  contract: string
}) {
  const contract = (chain?.contracts as Record<string, Chain.Contract>)?.[name]
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

export type ChainDoesNotSupportContractErrorType =
  ChainDoesNotSupportContract & {
    name: 'ChainDoesNotSupportContract'
  }
export class ChainDoesNotSupportContract extends BaseError {
  override name = 'ChainDoesNotSupportContract'

  constructor({
    blockNumber,
    chain,
    contract,
  }: {
    blockNumber?: bigint | undefined
    chain: Chain
    contract: { name: string; blockCreated?: number | undefined }
  }) {
    super(
      `Chain "${chain.name}" does not support contract "${contract.name}".`,
      {
        metaMessages: [
          'This could be due to any of the following:',
          ...(blockNumber &&
          contract.blockCreated &&
          contract.blockCreated > blockNumber
            ? [
                `- The contract "${contract.name}" was not deployed until block ${contract.blockCreated} (current block ${blockNumber}).`,
              ]
            : [
                `- The chain does not have the contract "${contract.name}" configured.`,
              ]),
        ],
      },
    )
  }
}

export type ChainMismatchErrorType = ChainMismatchError & {
  name: 'ChainMismatchError'
}
export class ChainMismatchError extends BaseError {
  override name = 'ChainMismatchError'

  constructor({
    chain,
    currentChainId,
  }: {
    chain: Chain
    currentChainId: number
  }) {
    super(
      `The current chain of the wallet (id: ${currentChainId}) does not match the target chain for the transaction (id: ${chain.id} – ${chain.name}).`,
      {
        metaMessages: [
          `Current Chain ID:  ${currentChainId}`,
          `Expected Chain ID: ${chain.id} – ${chain.name}`,
        ],
      },
    )
  }
}

export type ChainNotFoundErrorType = ChainNotFoundError & {
  name: 'ChainNotFoundError'
}
export class ChainNotFoundError extends BaseError {
  override name = 'ChainNotFoundError'

  constructor() {
    super(
      [
        'No chain was provided to the request.',
        'Please provide a chain with the `chain` argument on the Action, or by supplying a `chain` to WalletClient.',
      ].join('\n'),
    )
  }
}
