import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import {
  type GetCallsStatusParameters,
  type GetCallsStatusReturnType,
  getCallsStatus,
} from '../actions/getCallsStatus.js'
import {
  type GetCapabilitiesReturnType,
  getCapabilities,
} from '../actions/getCapabilities.js'
import {
  type SendCallsParameters,
  type SendCallsReturnType,
  sendCalls,
} from '../actions/sendCalls.js'

export type WalletActionsEip5792<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  /**
   * Returns the status of a call batch that was sent via `sendCalls`.
   *
   * - Docs: https://viem.sh/experimental/actions/getCallsStatus
   * - JSON-RPC Methods: [`wallet_getCallsStatus`](https://eips.ethereum.org/EIPS/eip-5792)
   *
   * @param client - Client to use
   * @returns Status of the calls. {@link GetCallsStatusReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { walletActionsEip5792 } from 'viem/experimental'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(walletActionsEip5792())
   *
   * const { receipts, status } = await client.getCallsStatus({ id: '0xdeadbeef' })
   */
  getCallsStatus: (
    parameters: GetCallsStatusParameters,
  ) => Promise<GetCallsStatusReturnType>
  /**
   * Extract capabilities that a connected wallet supports (e.g. paymasters, session keys, etc).
   *
   * - Docs: https://viem.sh/experimental/actions/getCapabilities
   * - JSON-RPC Methods: [`wallet_getCapabilities`](https://eips.ethereum.org/EIPS/eip-5792)
   *
   * @param client - Client to use
   * @returns The wallet's capabilities. {@link GetCapabilitiesReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { walletActionsEip5792 } from 'viem/experimental'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(walletActionsEip5792())
   *
   * const capabilities = await client.getCapabilities()
   */
  getCapabilities: () => Promise<GetCapabilitiesReturnType>
  /**
   * Requests the connected wallet to send a batch of calls.
   *
   * - Docs: https://viem.sh/experimental/actions/sendCalls
   * - JSON-RPC Methods: [`wallet_sendCalls`](https://eips.ethereum.org/EIPS/eip-5792)
   *
   * @param client - Client to use
   * @returns Transaction identifier. {@link SendCallsReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { walletActionsEip5792 } from 'viem/experimental'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(walletActionsEip5792())
   *
   * const id = await client.sendCalls({
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
  sendCalls: <chainOverride extends Chain | undefined = undefined>(
    parameters: SendCallsParameters<chain, account, chainOverride>,
  ) => Promise<SendCallsReturnType>
}

/**
 * A suite of EIP-5792 Wallet Actions.
 *
 * - Docs: https://viem.sh/experimental
 *
 * @example
 * import { createPublicClient, createWalletClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { walletActionsEip5792 } from 'viem/experimental'
 *
 * const walletClient = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(walletActionsEip5792())
 *
 * const hash = await walletClient.sendCalls({...})
 */
export function walletActionsEip5792() {
  return <
    transport extends Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): WalletActionsEip5792<chain, account> => {
    return {
      getCallsStatus: (parameters) => getCallsStatus(client, parameters),
      getCapabilities: () => getCapabilities(client),
      sendCalls: (parameters) => sendCalls(client, parameters),
    }
  }
}
