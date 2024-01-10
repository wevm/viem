import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import {
  type DepositTransactionParameters,
  type DepositTransactionReturnType,
  depositTransaction,
} from '../actions/depositTransaction.js'
import {
  type FinalizeWithdrawalParameters,
  type FinalizeWithdrawalReturnType,
  finalizeWithdrawal,
} from '../actions/finalizeWithdrawal.js'
import {
  type ProveWithdrawalParameters,
  type ProveWithdrawalReturnType,
  proveWithdrawal,
} from '../actions/proveWithdrawal.js'

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
   * - Docs: https://viem.sh/op-stack/actions/depositTransaction
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
   *   request: {
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
   *   request: {
   *     gas: 21_000n,
   *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *     value: parseEther('1'),
   *   },
   *   targetChain: base,
   * })
   */
  depositTransaction: <chainOverride extends Chain | undefined = undefined>(
    parameters: DepositTransactionParameters<chain, account, chainOverride>,
  ) => Promise<DepositTransactionReturnType>
  /**
   * Finalizes a withdrawal that occurred on an L2. Used in the Withdrawal flow.
   *
   * - Docs: https://viem.sh/op-stack/actions/finalizeWithdrawal
   *
   * @param client - Client to use
   * @param parameters - {@link FinalizeWithdrawalParameters}
   * @returns The finalize transaction hash. {@link FinalizeWithdrawalReturnType}
   *
   * @example
   * import { createWalletClient, http } from 'viem'
   * import { mainnet, optimism } from 'viem/chains'
   * import { walletActionsL1 } from 'viem/op-stack'
   *
   * const walletClientL1 = createWalletClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(walletActionsL1)
   *
   * const hash = await walletClientL1.finalizeWithdrawal({
   *   targetChain: optimism,
   *   withdrawal: { ... },
   * })
   */
  finalizeWithdrawal: <chainOverride extends Chain | undefined = undefined>(
    parameters: FinalizeWithdrawalParameters<chain, account, chainOverride>,
  ) => Promise<FinalizeWithdrawalReturnType>
  /**
   * Proves a withdrawal that occurred on an L2. Used in the Withdrawal flow.
   *
   * - Docs: https://viem.sh/op-stack/actions/proveWithdrawal
   *
   * @param client - Client to use
   * @param parameters - {@link ProveWithdrawalParameters}
   * @returns The prove transaction hash. {@link ProveWithdrawalReturnType}
   *
   * @example
   * import { createWalletClient, http } from 'viem'
   * import { mainnet, optimism } from 'viem/chains'
   * import { walletActionsL1 } from 'viem/op-stack'
   *
   * const walletClientL1 = createWalletClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(walletActionsL1())
   *
   * const hash = await walletClientL1.proveWithdrawal({
   *   l2OutputIndex: 4529n,
   *   outputRootProof: { ... },
   *   targetChain: optimism,
   *   withdrawalProof: [ ... ],
   *   withdrawalTransaction: { ... },
   * })
   */
  proveWithdrawal: <chainOverride extends Chain | undefined = undefined>(
    parameters: ProveWithdrawalParameters<chain, account, chainOverride>,
  ) => Promise<ProveWithdrawalReturnType>
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
      finalizeWithdrawal: (args) => finalizeWithdrawal(client, args),
      proveWithdrawal: (args) => proveWithdrawal(client, args),
    }
  }
}
