import type * as Errors from 'ox/Errors'

import type * as Account from '../../Account.js'
import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { type getCallsStatus } from './getCallsStatus.js'
import { sendCalls } from './sendCalls.js'
import { waitForCallsStatus } from './waitForCallsStatus.js'

/**
 * Requests the connected wallet to send a batch of calls, and waits for the
 * calls to be included in a block.
 *
 * @example
 * ```ts
 * import { Actions, Client, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: custom(window.ethereum!),
 * })
 * const status = await Actions.wallet.sendCallsSync(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   calls: [
 *     { data: '0xdeadbeef', to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8' },
 *     { to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', value: 69420n },
 *   ],
 * })
 * ```
 */
export async function sendCallsSync<
  const calls extends readonly unknown[],
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined = undefined,
  chainOverride extends Chain.Chain | undefined = undefined,
>(
  client: Client.Client<chain, account>,
  options: sendCallsSync.Options<chain, account, chainOverride, calls>,
): Promise<sendCallsSync.ReturnType> {
  const { chain = client.chain } = options as sendCallsSync.Options
  const timeout =
    options.timeout ?? Math.max((chain?.blockTime ?? 0) * 3, 5_000)
  const result = await sendCalls(client, options)
  const status = await waitForCallsStatus(client, {
    ...options,
    id: result.id,
    timeout,
  })
  return status
}

export declare namespace sendCallsSync {
  type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
    chainOverride extends Chain.Chain | undefined = Chain.Chain | undefined,
    calls extends readonly unknown[] = readonly unknown[],
  > = sendCalls.Options<chain, account, chainOverride, calls> &
    Pick<
      waitForCallsStatus.Options,
      'pollingInterval' | 'status' | 'throwOnFailure'
    > & {
      /**
       * Timeout (ms) to wait for calls to be included in a block.
       * @default chain.blockTime * 3
       */
      timeout?: number | undefined
    }

  type ReturnType = getCallsStatus.ReturnType

  type ErrorType = sendCalls.ErrorType | Errors.GlobalErrorType
}
