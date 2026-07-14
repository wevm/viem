import type { Errors, Hex } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import { l2OutputOracleAbi } from '../../abis.js'
import { getGame } from './getGame.js'
import { getPortalVersion } from './getPortalVersion.js'
import { type ContractParameters, getContractAddress } from './internal.js'

/** Retrieves the first L2 output after an L2 block number. */
export async function getL2Output<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getL2Output.Options,
): Promise<getL2Output.ReturnType> {
  const chain = options.chain ?? client.chain
  const version = await getPortalVersion(client, options)

  if (version.major >= 3) {
    const game = await getGame(client, options)
    return {
      l2BlockNumber: game.l2BlockNumber,
      outputIndex: game.index,
      outputRoot: game.rootClaim,
      timestamp: game.timestamp,
    }
  }

  const address = getContractAddress({ ...options, chain }, 'l2OutputOracle')
  const outputIndex = await read(client, {
    abi: l2OutputOracleAbi,
    address,
    args: [options.l2BlockNumber],
    functionName: 'getL2OutputIndexAfter',
  })
  const output = await read(client, {
    abi: l2OutputOracleAbi,
    address,
    args: [outputIndex],
    functionName: 'getL2Output',
  })
  return { outputIndex, ...output }
}

export declare namespace getL2Output {
  /** Options for {@link getL2Output}. */
  type Options = ContractParameters<
    'disputeGameFactory' | 'l2OutputOracle' | 'portal'
  > & {
    /** Chain used to resolve L1 contracts. @default client.chain */
    chain?: Chain.Chain | undefined
    /** L2 block number or super-root timestamp. */
    l2BlockNumber: bigint
    /** Maximum number of dispute games to inspect. @default 100 */
    limit?: number | undefined
  }

  /** An L2 output proposal or dispute-game claim. */
  type ReturnType = {
    /** Anchored L2 block number or timestamp. */
    l2BlockNumber: bigint
    /** Output or game index. */
    outputIndex: bigint
    /** Output root or root claim. */
    outputRoot: Hex.Hex
    /** Proposal or game timestamp. */
    timestamp: bigint
  }

  /** Errors thrown by {@link getL2Output}. */
  type ErrorType =
    | read.ErrorType
    | getGame.ErrorType
    | getPortalVersion.ErrorType
    | Chain.getContractAddress.ErrorType
    | Errors.GlobalErrorType
}
