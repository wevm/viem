// TODO(v3): Remove this.

import {
  type GetCallsStatusParameters,
  type GetCallsStatusReturnType,
  getCallsStatus,
} from '../../../actions/wallet/getCallsStatus.js'
import {
  type GetCapabilitiesParameters,
  type GetCapabilitiesReturnType,
  getCapabilities,
} from '../../../actions/wallet/getCapabilities.js'
import {
  type SendCallsParameters,
  type SendCallsReturnType,
  sendCalls,
} from '../../../actions/wallet/sendCalls.js'
import {
  type ShowCallsStatusParameters,
  type ShowCallsStatusReturnType,
  showCallsStatus,
} from '../../../actions/wallet/showCallsStatus.js'
import {
  type WaitForCallsStatusParameters,
  type WaitForCallsStatusReturnType,
  waitForCallsStatus,
} from '../../../actions/wallet/waitForCallsStatus.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import {
  type WriteContractsParameters,
  type WriteContractsReturnType,
  writeContracts,
} from '../actions/writeContracts.js'

export type Eip5792Actions<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  /**
   * Returns the status of a call batch that was sent via `sendCalls`.
   *
   * - Docs: https://viem.sh/experimental/eip5792/getCallsStatus
   * - JSON-RPC Methods: [`wallet_getCallsStatus`](https://eips.ethereum.org/EIPS/eip-5792)
   *
   * @param client - Client to use
   * @returns Status of the calls. {@link GetCallsStatusReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { eip5792Actions } from 'viem/experimental'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(eip5792Actions())
   *
   * const { receipts, status } = await client.getCallsStatus({ id: '0xdeadbeef' })
   */
  getCallsStatus: (
    parameters: GetCallsStatusParameters,
  ) => Promise<GetCallsStatusReturnType>
  /**
   * Extract capabilities that a connected wallet supports (e.g. paymasters, session keys, etc).
   *
   * - Docs: https://viem.sh/experimental/eip5792/getCapabilities
   * - JSON-RPC Methods: [`wallet_getCapabilities`](https://eips.ethereum.org/EIPS/eip-5792)
   *
   * @param client - Client to use
   * @returns The wallet's capabilities. {@link GetCapabilitiesReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { eip5792Actions } from 'viem/experimental'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(eip5792Actions())
   *
   * const capabilities = await client.getCapabilities({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   * })
   */
  getCapabilities: (
    parameters?: GetCapabilitiesParameters,
  ) => Promise<GetCapabilitiesReturnType>
  /**
   * Requests the connected wallet to send a batch of calls.
   *
   * - Docs: https://viem.sh/experimental/eip5792/sendCalls
   * - JSON-RPC Methods: [`wallet_sendCalls`](https://eips.ethereum.org/EIPS/eip-5792)
   *
   * @param client - Client to use
   * @returns Transaction identifier. {@link SendCallsReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { eip5792Actions } from 'viem/experimental'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(eip5792Actions())
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
  sendCalls: <
    const calls extends readonly unknown[],
    chainOverride extends Chain | undefined = undefined,
  >(
    parameters: SendCallsParameters<chain, account, chainOverride, calls>,
  ) => Promise<SendCallsReturnType>
  /**
   * Requests for the wallet to show information about a call batch
   * that was sent via `sendCalls`.
   *
   * - Docs: https://viem.sh/experimental/eip5792/showCallsStatus
   * - JSON-RPC Methods: [`wallet_showCallsStatus`](https://eips.ethereum.org/EIPS/eip-5792)
   *
   * @param client - Client to use
   * @returns Displays status of the calls in wallet. {@link ShowCallsStatusReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { eip5792Actions } from 'viem/experimental'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(eip5792Actions())
   *
   * await client.showCallsStatus({ id: '0xdeadbeef' })
   */
  showCallsStatus: (
    parameters: ShowCallsStatusParameters,
  ) => Promise<ShowCallsStatusReturnType>
  /**
   * Waits for the status & receipts of a call bundle that was sent via `sendCalls`.
   *
   * - Docs: https://viem.sh/experimental/eip5792/waitForCallsStatus
   * - JSON-RPC Methods: [`wallet_getCallsStatus`](https://eips.ethereum.org/EIPS/eip-5792)
   *
   * @param client - Client to use
   * @param parameters - {@link WaitForCallsStatusParameters}
   * @returns Status & receipts of the call bundle. {@link WaitForCallsStatusReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { waitForCallsStatus } from 'viem/experimental'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   *
   * const { receipts, status } = await waitForCallsStatus(client, { id: '0xdeadbeef' })
   */
  waitForCallsStatus: (
    parameters: WaitForCallsStatusParameters,
  ) => Promise<WaitForCallsStatusReturnType>
  /**
   * Requests for the wallet to sign and broadcast a batch of write contract calls (transactions) to the network.
   *
   * - Docs: https://viem.sh/experimental/eip5792/writeContracts
   *
   * @param client - Client to use
   * @param parameters - {@link WriteContractsParameters}
   * @returns Unique identifier for the call batch. {@link WriteContractsReturnType}
   *
   * @example
   * import { createPublicClient, http, parseAbi } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { writeContracts } from 'viem/experimental'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const abi = parseAbi([
   *   'function approve(address, uint256) returns (bool)',
   *   'function transferFrom(address, address, uint256) returns (bool)',
   * ])
   * const id = await client.writeContracts({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   contracts: [
   *     {
   *       address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *       abi,
   *       functionName: 'approve',
   *       args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', 100n],
   *     },
   *     {
   *       address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *       abi,
   *       functionName: 'transferFrom',
   *       args: [
   *         '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
   *         '0x0000000000000000000000000000000000000000',
   *         100n
   *       ],
   *     },
   *   ],
   * })
   */
  writeContracts: <
    const contracts extends readonly unknown[],
    chainOverride extends Chain | undefined = undefined,
  >(
    parameters: WriteContractsParameters<
      contracts,
      chain,
      account,
      chainOverride
    >,
  ) => Promise<WriteContractsReturnType>
}

/**
 * A suite of EIP-5792 Wallet Actions.
 *
 * - Docs: https://viem.sh/experimental
 *
 * @example
 * import { createPublicClient, createWalletClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { eip5792Actions } from 'viem/experimental'
 *
 * const walletClient = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(eip5792Actions())
 *
 * const hash = await walletClient.sendCalls({...})
 */
export function eip5792Actions() {
  return <
    transport extends Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): Eip5792Actions<chain, account> => {
    return {
      getCallsStatus: (parameters) => getCallsStatus(client, parameters),
      getCapabilities: ((parameters: any) =>
        getCapabilities(client as any, parameters)) as any,
      sendCalls: (parameters) => sendCalls(client, parameters),
      showCallsStatus: (parameters) => showCallsStatus(client, parameters),
      waitForCallsStatus: (parameters) =>
        waitForCallsStatus(client, parameters),
      writeContracts: (parameters) => writeContracts(client, parameters),
    }
  }
}
