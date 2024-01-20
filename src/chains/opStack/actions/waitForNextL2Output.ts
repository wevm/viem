import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { ContractFunctionRevertedError } from '../../../errors/contract.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account } from '../../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../../types/chain.js'
import { poll } from '../../../utils/poll.js'
import type { GetContractAddressParameter } from '../types/contract.js'
import {
  type GetL2OutputErrorType,
  type GetL2OutputReturnType,
  getL2Output,
} from './getL2Output.js'
import {
  type GetTimeToNextL2OutputErrorType,
  type GetTimeToNextL2OutputParameters,
  getTimeToNextL2Output,
} from './getTimeToNextL2Output.js'

export type WaitForNextL2OutputParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetChainParameter<chain, chainOverride> &
  GetContractAddressParameter<_derivedChain, 'l2OutputOracle'> & {
    /**
     * The buffer to account for discrepencies between non-deterministic time intervals.
     * @default 1.1
     */
    intervalBuffer?: GetTimeToNextL2OutputParameters['intervalBuffer']
    l2BlockNumber: bigint
    /**
     * Polling frequency (in ms). Defaults to Client's pollingInterval config.
     * @default client.pollingInterval
     */
    pollingInterval?: number
  }
export type WaitForNextL2OutputReturnType = GetL2OutputReturnType
export type WaitForNextL2OutputErrorType =
  | GetL2OutputErrorType
  | GetTimeToNextL2OutputErrorType
  | ErrorType

/**
 * Waits for the next L2 output (after the provided block number) to be submitted.
 *
 * - Docs: https://viem.sh/op-stack/actions/waitForNextL2Output
 *
 * @param client - Client to use
 * @param parameters - {@link WaitForNextL2OutputParameters}
 * @returns The L2 transaction hash. {@link WaitForNextL2OutputReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { getBlockNumber } from 'viem/actions'
 * import { mainnet, optimism } from 'viem/chains'
 * import { waitForNextL2Output } from 'viem/op-stack'
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
 * await waitForNextL2Output(publicClientL1, {
 *   l2BlockNumber,
 *   targetChain: optimism
 * })
 */
export async function waitForNextL2Output<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: WaitForNextL2OutputParameters<chain, chainOverride>,
): Promise<WaitForNextL2OutputReturnType> {
  const { pollingInterval = client.pollingInterval } = parameters

  const { seconds } = await getTimeToNextL2Output(client, parameters)

  return new Promise((resolve, reject) => {
    poll(
      async ({ unpoll }) => {
        try {
          const output = await getL2Output(client, parameters)
          unpoll()
          resolve(output)
        } catch (e) {
          const error = e as GetL2OutputErrorType
          if (!(error.cause instanceof ContractFunctionRevertedError)) {
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
