import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { wait } from '../../../utils/wait.js'
import {
  type GetTimeToFinalizeErrorType,
  type GetTimeToFinalizeParameters,
  getTimeToFinalize,
} from './getTimeToFinalize.js'

export type WaitToFinalizeParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
> = GetTimeToFinalizeParameters<chain, chainOverride>
export type WaitToFinalizeReturnType = void
export type WaitToFinalizeErrorType = GetTimeToFinalizeErrorType | ErrorType

/**
 * Waits until the withdrawal transaction can be finalized. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.
 *
 * - Docs: https://viem.sh/op-stack/actions/waitToFinalize
 *
 * @param client - Client to use
 * @param parameters - {@link WaitToFinalizeParameters}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { getBlockNumber } from 'viem/actions'
 * import { mainnet, optimism } from 'viem/chains'
 * import { waitToFinalize } from 'viem/op-stack'
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
 * const receipt = await publicClientL2.getTransactionReceipt({
 *   hash: '0x9a2f4283636ddeb9ac32382961b22c177c9e86dd3b283735c154f897b1a7ff4a',
 * })
 *
 * const [withdrawal] = getWithdrawals(receipt)
 *
 * await waitToFinalize(publicClientL1, {
 *   withdrawalHash: withdrawal.withdrawalHash,
 *   targetChain: optimism
 * })
 */
export async function waitToFinalize<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: WaitToFinalizeParameters<chain, chainOverride>,
): Promise<WaitToFinalizeReturnType> {
  const { seconds } = await getTimeToFinalize(client, parameters)
  await wait(seconds * 1000)
}
