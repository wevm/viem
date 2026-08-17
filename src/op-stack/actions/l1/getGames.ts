import { Address } from 'ox'
import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import { multicall } from '../../../core/actions/multicall.js'
import { BaseError } from '../../../core/Errors.js'
import * as Game from '../../Game.js'
import {
  disputeGameAbi,
  disputeGameFactoryAbi,
  portal2Abi,
} from '../../abis.js'
import { type ContractParameters, getContractAddress } from './internal.js'

/** Retrieves recent respected dispute games for an OP Stack L2. */
export async function getGames<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getGames.Options,
): Promise<getGames.ReturnType> {
  const { l2BlockNumber, limit = 100 } = options
  const chain = options.chain ?? client.chain
  const portalAddress = getContractAddress({ ...options, chain }, 'portal')
  const disputeGameFactoryAddress = getContractAddress(
    { ...options, chain },
    'disputeGameFactory',
  )

  const [gameCount, gameType] = await Promise.all([
    read(client, {
      abi: disputeGameFactoryAbi,
      address: disputeGameFactoryAddress,
      functionName: 'gameCount',
    }),
    read(client, {
      abi: portal2Abi,
      address: portalAddress,
      functionName: 'respectedGameType',
    }),
  ])

  const count = BigInt(Math.max(0, limit))
  const rawGames = await read(client, {
    abi: disputeGameFactoryAbi,
    address: disputeGameFactoryAddress,
    args: [
      gameType,
      gameCount > 0n ? gameCount - 1n : 0n,
      count < gameCount ? count : gameCount,
    ],
    functionName: 'findLatestGames',
  })

  const { results } = await multicall(client, {
    allowFailure: false,
    calls: rawGames.map((game) => ({
      abi: disputeGameAbi,
      functionName: 'l2SequenceNumber' as const,
      to: Address.from(`0x${game.metadata.slice(26)}`),
    })),
  })

  const usesSuperRoots = Game.isSuper(Number(gameType))
  const games: getGames.Result[] = []
  for (const [index, game] of rawGames.entries()) {
    const blockNumber = results[index]
    if (typeof blockNumber !== 'bigint') throw new GameSequenceNotFoundError()
    if (!l2BlockNumber || blockNumber > l2BlockNumber)
      games.push({
        ...game,
        l2BlockNumber: blockNumber,
        usesSuperRoots,
      })
  }
  return games
}

export declare namespace getGames {
  /** Options for {@link getGames}. */
  type Options = ContractParameters<'disputeGameFactory' | 'portal'> & {
    /** Chain used to resolve L1 contracts. @default client.chain */
    chain?: Chain.Chain | undefined
    /** Minimum anchored L2 block number or timestamp. */
    l2BlockNumber?: bigint | undefined
    /** Maximum number of recent games to inspect. @default 100 */
    limit?: number | undefined
  }

  /** A dispute game with its anchored L2 position. */
  type Result = Game.Game & {
    /** Anchored L2 block number, or timestamp for super-root games. */
    l2BlockNumber: bigint
    /** Whether the game anchors on super roots. */
    usesSuperRoots: boolean
  }

  /** Return type of {@link getGames}. */
  type ReturnType = readonly Result[]

  /** Errors thrown by {@link getGames}. */
  type ErrorType =
    | read.ErrorType
    | multicall.ErrorType
    | Address.from.ErrorType
    | Chain.getContractAddress.ErrorType
    | GameSequenceNotFoundError
    | Errors.GlobalErrorType
}

/** Thrown when a dispute game sequence number is unavailable. */
export class GameSequenceNotFoundError extends BaseError {
  override readonly name = 'Actions.l1.getGames.GameSequenceNotFoundError'

  constructor() {
    super('Dispute game sequence number is missing.')
  }
}
