import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import {
  type SendCallsParameters,
  type SendCallsReturnType,
  sendCalls,
} from '../actions/sendCalls.js'

export type Erc8132Actions<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  /**
   * Requests the connected wallet to send a batch of calls with ERC-8132 gas limit override support.
   *
   * - Docs: https://viem.sh/experimental/erc8132/sendCalls
   * - JSON-RPC Methods: [`wallet_sendCalls`](https://eips.ethereum.org/EIPS/eip-5792)
   * - ERC-8132: https://github.com/ethereum/ERCs/pull/1485
   *
   * @param parameters - {@link SendCallsParameters}
   * @returns Transaction identifier. {@link SendCallsReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { erc8132Actions } from 'viem/experimental'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(erc8132Actions())
   *
   * const id = await client.sendCalls({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   calls: [
   *     {
   *       data: '0xdeadbeef',
   *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *       gas: 100000n,
   *     },
   *   ],
   * })
   */
  sendCalls: <
    chainOverride extends Chain | undefined = undefined,
    const calls extends readonly unknown[] = readonly unknown[],
  >(
    parameters: SendCallsParameters<chain, account, chainOverride, calls>,
  ) => Promise<SendCallsReturnType>
}

/**
 * A suite of ERC-8132 Wallet Actions.
 *
 * ERC-8132 introduces a capability that allows apps to specify gas limits
 * for individual calls in an EIP-5792 batch.
 *
 * @see https://github.com/ethereum/ERCs/pull/1485
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { erc8132Actions } from 'viem/experimental'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * }).extend(erc8132Actions())
 *
 * const id = await client.sendCalls({
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   calls: [
 *     {
 *       data: '0xdeadbeef',
 *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *       gas: 100000n,
 *     },
 *     {
 *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *       value: 69420n,
 *     },
 *   ],
 * })
 */
export function erc8132Actions() {
  return <
    transport extends Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): Erc8132Actions<chain, account> => {
    return {
      sendCalls: (parameters) => sendCalls(client, parameters),
    }
  }
}
