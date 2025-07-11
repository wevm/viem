import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import { poll } from '../../utils/poll.js'
import { GameNotFoundError } from '../errors/withdrawal.js'
import type { GetContractAddressParameter } from '../types/contract.js'
import {
  type GetGameErrorType,
  type GetGameReturnType,
  getGame,
} from './getGame.js'
import {
  type GetTimeToNextGameErrorType,
  type GetTimeToNextGameParameters,
  getTimeToNextGame,
} from './getTimeToNextGame.js'

export type WaitForNextGameParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetChainParameter<chain, chainOverride> &
  GetContractAddressParameter<
    _derivedChain,
    'portal' | 'disputeGameFactory'
  > & {
    /**
     * Limit of games to extract.
     * @default 100
     */
    limit?: number | undefined
    /**
     * The buffer to account for discrepancies between non-deterministic time intervals.
     * @default 1.1
     */
    intervalBuffer?: GetTimeToNextGameParameters['intervalBuffer'] | undefined
    l2BlockNumber: bigint
    /**
     * Polling frequency (in ms). Defaults to Client's pollingInterval config.
     * @default client.pollingInterval
     */
    pollingInterval?: number | undefined
  }
export type WaitForNextGameReturnType = GetGameReturnType
export type WaitForNextGameErrorType =
  | GetGameErrorType
  | GetTimeToNextGameErrorType
  | ErrorType

/**
 * Waits for the next dispute game (after the provided block number) to be submitted.
 *
 * - Docs: https://viem.sh/op-stack/actions/waitForNextGame
 *
 * @param client - Client to use
 * @param parameters - {@link WaitForNextGameParameters}
 * @returns The L2 transaction hash. {@link WaitForNextGameReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { getBlockNumber } from 'viem/actions'
 * import { mainnet, optimism } from 'viem/chains'
 * import { waitForNextGame } from 'viem/op-stack'
 *
 * const publicClientL1 = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const publicClientL2 = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 *
 * const l2BlockNumber = await getBlockNumber(publicClientL2)
 * await waitForNextGame(publicClientL1, {
 *   l2BlockNumber,
 *   targetChain: optimism
 * })
 */
export async function waitForNextGame<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: WaitForNextGameParameters<chain, chainOverride>,
): Promise<WaitForNextGameReturnType> {
  const { pollingInterval = client.pollingInterval } = parameters

  const { seconds } = await getTimeToNextGame(client, parameters)

  return new Promise((resolve, reject) => {
    poll(
      async ({ unpoll }) => {
        try {
          const game = await getGame(client, {
            ...parameters,
            strategy: 'random',
          })
          unpoll()
          resolve(game)
        } catch (e) {
          const error = e as GetGameErrorType
          if (!(error instanceof GameNotFoundError)) {
            unpoll()
            reject(e)
          }
        }
      },
      {
        interval: pollingInterval,
        initialWaitTime: async () => seconds * 1000,
      },
    )
  })
}
