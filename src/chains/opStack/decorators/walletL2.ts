import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import {
  type InitiateWithdrawalParameters,
  type InitiateWithdrawalReturnType,
  initiateWithdrawal,
} from '../actions/initiateWithdrawal.js'

export type WalletActionsL2<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  /**
   * Initiates a [withdrawal](https://community.optimism.io/docs/protocol/withdrawal-flow/#withdrawal-initiating-transaction) on an L2 to the L1.
   *
   * Internally performs a contract write to the [`initiateWithdrawal` function](https://github.com/ethereum-optimism/optimism/blob/283f0aa2e3358ced30ff7cbd4028c0c0c3faa140/packages/contracts-bedrock/src/L2/L2ToL1MessagePasser.sol#L73)
   * on the [Optimism L2ToL1MessagePasser predeploy contract](https://github.com/ethereum-optimism/optimism/blob/283f0aa2e3358ced30ff7cbd4028c0c0c3faa140/packages/contracts-bedrock/src/L2/L2ToL1MessagePasser.sol).
   *
   * - Docs: https://viem.sh/op-stack/actions/initiateWithdrawal
   *
   * @param client - Client to use
   * @param parameters - {@link InitiateWithdrawalParameters}
   * @returns The L2 transaction hash. {@link InitiateWithdrawalReturnType}
   *
   * @example
   * import { createWalletClient, custom, parseEther } from 'viem'
   * import { base, mainnet } from 'viem/chains'
   * import { walletActionsL2 } from 'viem/op-stack'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(walletActionsL2())
   *
   * const hash = await client.initiateWithdrawal({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   args: {
   *     gas: 21_000n,
   *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *     value: parseEther('1'),
   *   },
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { base, mainnet } from 'viem/chains'
   * import { walletActionsL2 } from 'viem/op-stack'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(walletActionsL2())
   *
   * const hash = await client.initiateWithdrawal({
   *   args: {
   *     gas: 21_000n,
   *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *     value: parseEther('1'),
   *   },
   * })
   */
  initiateWithdrawal: <chainOverride extends Chain | undefined = undefined>(
    parameters: InitiateWithdrawalParameters<chain, account, chainOverride>,
  ) => Promise<InitiateWithdrawalReturnType>
}

/**
 * A suite of Wallet Actions for suited for development with Layer 2 (OP Stack) chains.
 *
 * - Docs: https://viem.sh/op-stack/client
 *
 * @example
 * import { createPublicClient, createWalletClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { walletActionsL1 } from 'viem/op-stack'
 *
 * const walletClient = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(walletActionsL1())
 *
 * const hash = await walletClient.depositTransaction({...})
 */
export function walletActionsL2() {
  return <
    TTransport extends Transport,
    TChain extends Chain | undefined = Chain | undefined,
    TAccount extends Account | undefined = Account | undefined,
  >(
    client: Client<TTransport, TChain, TAccount>,
  ): WalletActionsL2<TChain, TAccount> => {
    return {
      initiateWithdrawal: (args) => initiateWithdrawal(client, args),
    }
  }
}
