import type { Chain } from '../../chains/index.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import {
  type GetL1AllowanceParameters,
  type GetL1AllowanceReturnType,
  getL1Allowance,
} from '../actions/getL1Allowance.js'
import {
  type GetL1BalanceParameters,
  type GetL1BalanceReturnType,
  getL1Balance,
} from '../actions/getL1Balance.js'
import {
  type GetL1TokenBalanceParameters,
  type GetL1TokenBalanceReturnType,
  getL1TokenBalance,
} from '../actions/getL1TokenBalance.js'

export type PublicActionsL1<
  TAccount extends Account | undefined = Account | undefined,
> = {
  /**
   * Returns the amount of approved tokens for a specific L1 bridge.
   *
   * - Docs: https://viem.sh/zksync/actions/getL1Allowance
   *
   * @param client - Client to use
   * @param parameters - {@link AllowanceL1Parameters}
   * @returns The amount of approved tokens for a specific L1 bridge. {@link GetL1AllowanceReturnType}
   *
   * @example
   * import { createPublicClient, custom, parseEther } from 'viem'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(publicActionsL1())
   *
   * const data = await client.getL1Allowance({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   token: '0x5C221E77624690fff6dd741493D735a17716c26B'
   *   bridgeAddress: '0x84DbCC0B82124bee38e3Ce9a92CdE2f943bab60D',
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const data = await client.getL1Allowance({
   *   token: '0x5C221E77624690fff6dd741493D735a17716c26B'
   *   bridgeAddress: '0x84DbCC0B82124bee38e3Ce9a92CdE2f943bab60D',
   * })
   */
  getL1Allowance: (
    parameters: GetL1AllowanceParameters<TAccount>,
  ) => Promise<GetL1AllowanceReturnType>
  /**
   * Returns the amount of the ERC20 token the client has on specific address.
   *
   * - Docs: https://viem.sh/zksync/actions/getL1TokenBalance
   *
   * @param client - Client to use
   * @param parameters - {@link GetL1TokenBalanceParameters}
   * @returns The amount of the ERC20 token the client has on specific address. {@link GetL1TokenBalanceReturnType}
   *
   * @example
   * import { createPublicClient, custom, parseEther } from 'viem'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(publicActionsL1())
   *
   * const data = await client.getL1TokenBalance({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   token: '0x5C221E77624690fff6dd741493D735a17716c26B'
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const data = await client.getL1TokenBalance({
   *   token: '0x5C221E77624690fff6dd741493D735a17716c26B'
   * })
   */
  getL1TokenBalance: (
    parameters: GetL1TokenBalanceParameters<TAccount>,
  ) => Promise<GetL1TokenBalanceReturnType>
  /**
   * Returns the amount of the token held by the account on the L1 network.
   *
   * - Docs: https://viem.sh/zksync/actions/getL1TokenBalance
   *
   * @param client - Client to use
   * @param parameters - {@link BalanceL1Parameters}
   * @returns Returns the amount of the token held by the account on the L1 network. {@link GetL1BalanceReturnType}
   *
   * @example
   * import { createPublicClient, custom, parseEther } from 'viem'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(publicActionsL1())
   *
   * const data = await client.getL1Balance({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'
   * })
   *
   * const data = await client.getL1Balance({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   token: '0x5C221E77624690fff6dd741493D735a17716c26B'
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const data = await client.getL1Balance({})
   *
   * const data = await client.getL1Balance({
   *  token: '0x5C221E77624690fff6dd741493D735a17716c26B'
   * })
   */
  getL1Balance: (
    ...parameters: TAccount extends undefined
      ? [GetL1BalanceParameters<TAccount>]
      : [GetL1BalanceParameters<TAccount>] | []
  ) => Promise<GetL1BalanceReturnType>
}

export function publicActionsL1() {
  return <
    TChain extends Chain | undefined = Chain | undefined,
    TAccount extends Account | undefined = Account | undefined,
  >(
    client: Client<Transport, TChain, TAccount>,
  ): PublicActionsL1<TAccount> => ({
    getL1Allowance: (args) => getL1Allowance(client, args),
    getL1TokenBalance: (args) => getL1TokenBalance(client, args),
    // @ts-expect-error
    getL1Balance: (args) => getL1Balance(client, args),
  })
}
