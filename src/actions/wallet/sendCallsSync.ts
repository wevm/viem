import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { GetCallsStatusReturnType } from './getCallsStatus.js'
import {
  type SendCallsErrorType,
  type SendCallsParameters,
  sendCalls,
} from './sendCalls.js'
import {
  type WaitForCallsStatusParameters,
  waitForCallsStatus,
} from './waitForCallsStatus.js'

export type SendCallsSyncParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  calls extends readonly unknown[] = readonly unknown[],
> = SendCallsParameters<chain, account, chainOverride, calls> &
  Pick<
    WaitForCallsStatusParameters,
    'pollingInterval' | 'status' | 'throwOnFailure'
  > & {
    /** Timeout (ms) to wait for calls to be included in a block. @default chain.blockTime * 3 */
    timeout?: number | undefined
  }

export type SendCallsSyncReturnType = GetCallsStatusReturnType

export type SendCallsSyncErrorType = SendCallsErrorType

/**
 * Requests the connected wallet to send a batch of calls, and waits for the calls to be included in a block.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/sendCallsSync
 * - JSON-RPC Methods: [`wallet_sendCalls`](https://eips.ethereum.org/EIPS/eip-5792)
 *
 * @param client - Client to use
 * @returns Calls status. {@link SendCallsSyncReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { sendCalls } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const status = await sendCallsSync(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   calls: [
 *     {
 *       data: '0xdeadbeef',
 *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *     },
 *     {
 *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *       value: 69420n,
 *     },
 *   ],
 * })
 */
export async function sendCallsSync<
  const calls extends readonly unknown[],
  chain extends Chain | undefined,
  account extends Account | undefined = undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: SendCallsSyncParameters<chain, account, chainOverride, calls>,
): Promise<SendCallsSyncReturnType> {
  const { chain = client.chain } = parameters
  const timeout =
    parameters.timeout ?? Math.max((chain?.blockTime ?? 0) * 3, 5_000)
  const result = await sendCalls(client, parameters)
  const status = await waitForCallsStatus(client, {
    ...parameters,
    id: result.id,
    timeout,
  })
  return status
}
