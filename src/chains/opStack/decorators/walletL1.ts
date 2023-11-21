import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import {
  type DepositTransactionParameters,
  type DepositTransactionReturnType,
  depositTransaction,
} from '../actions/depositTransaction.js'

export type WalletActionsL1<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  /**
   * Initiates a [deposit transaction](https://github.com/ethereum-optimism/optimism/blob/develop/specs/deposits.md) on an L1, which executes a transaction on L2.
   *
   * Internally performs a contract write to the [`depositTransaction` function](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L1/OptimismPortal.sol#L378)
   * on the [Optimism Portal contract](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L1/OptimismPortal.sol).
   *
   * - Docs: https://viem.sh/op-stack/actions/depositTransaction.html
   *
   * @param client - Client to use
   * @param parameters - {@link DepositTransactionParameters}
   * @returns The L1 transaction hash. {@link DepositTransactionReturnType}
   *
   * @example
   * import { createWalletClient, custom, parseEther } from 'viem'
   * import { base, mainnet } from 'viem/chains'
   * import { walletActionsL1 } from 'viem/op-stack'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(walletActionsL1())
   *
   * const hash = await client.depositTransaction({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   args: {
   *     gas: 21_000n,
   *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *     value: parseEther('1'),
   *   },
   *   targetChain: base,
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { base, mainnet } from 'viem/chains'
   * import { walletActionsL1 } from 'viem/op-stack'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(walletActionsL1())
   *
   * const hash = await client.depositTransaction({
   *   args: {
   *     gas: 21_000n,
   *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *     value: parseEther('1'),
   *   },
   *   targetChain: base,
   * })
   */
  depositTransaction: <chainOverride extends Chain | undefined = undefined,>(
    parameters: DepositTransactionParameters<chain, account, chainOverride>,
  ) => Promise<DepositTransactionReturnType>
}

export function walletActionsL1() {
  return <
    TTransport extends Transport,
    TChain extends Chain | undefined = Chain | undefined,
    TAccount extends Account | undefined = Account | undefined,
  >(
    client: Client<TTransport, TChain, TAccount>,
  ): WalletActionsL1<TChain, TAccount> => {
    return {
      depositTransaction: (args) => depositTransaction(client, args),
    }
  }
}
