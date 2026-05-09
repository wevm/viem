import type { Chain } from '../types/chain.js'

import { BaseError } from './base.js'

export type ChainDoesNotSupportContractErrorType =
  ChainDoesNotSupportContract & {
    name: 'ChainDoesNotSupportContract'
  }
export class ChainDoesNotSupportContract extends BaseError {
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
        name: 'ChainDoesNotSupportContract',
      },
    )
  }
}

export type ChainMismatchErrorType = ChainMismatchError & {
  name: 'ChainMismatchError'
}
export class ChainMismatchError extends BaseError {
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
        name: 'ChainMismatchError',
      },
    )
  }
}

export type ChainNotFoundErrorType = ChainNotFoundError & {
  name: 'ChainNotFoundError'
}
export class ChainNotFoundError extends BaseError {
  constructor() {
    super(
      [
        'No chain was provided to the request.',
        'Please provide a chain with the `chain` argument on the Action, or by supplying a `chain` to WalletClient.',
      ].join('\n'),
      {
        name: 'ChainNotFoundError',
      },
    )
  }
}

export type ClientChainNotConfiguredErrorType =
  ClientChainNotConfiguredError & {
    name: 'ClientChainNotConfiguredError'
  }
export class ClientChainNotConfiguredError extends BaseError {
  constructor() {
    super('No chain was provided to the Client.', {
      name: 'ClientChainNotConfiguredError',
    })
  }
}

export type InvalidChainIdErrorType = InvalidChainIdError & {
  name: 'InvalidChainIdError'
}
export class InvalidChainIdError extends BaseError {
  constructor({ chainId }: { chainId?: number | undefined }) {
    super(
      typeof chainId === 'number'
        ? `Chain ID "${chainId}" is invalid.`
        : 'Chain ID is invalid.',
      { name: 'InvalidChainIdError' },
    )
  }
}
