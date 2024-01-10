import type { Address } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import {
  type BuildInitiateWithdrawalParameters,
  type BuildInitiateWithdrawalReturnType,
  buildInitiateWithdrawal,
} from '../actions/buildInitiateWithdrawal.js'
import {
  type EstimateDepositTransactionGasParameters,
  type EstimateDepositTransactionGasReturnType,
  estimateDepositTransactionGas,
} from '../actions/estimateDepositTransactionGas.js'
import {
  type EstimateFinalizeWithdrawalGasParameters,
  type EstimateFinalizeWithdrawalGasReturnType,
  estimateFinalizeWithdrawalGas,
} from '../actions/estimateFinalizeWithdrawalGas.js'
import {
  type EstimateProveWithdrawalGasParameters,
  type EstimateProveWithdrawalGasReturnType,
  estimateProveWithdrawalGas,
} from '../actions/estimateProveWithdrawalGas.js'
import {
  type GetL2OutputParameters,
  type GetL2OutputReturnType,
  getL2Output,
} from '../actions/getL2Output.js'
import {
  type GetTimeToFinalizeParameters,
  type GetTimeToFinalizeReturnType,
  getTimeToFinalize,
} from '../actions/getTimeToFinalize.js'
import {
  type GetTimeToNextL2OutputParameters,
  type GetTimeToNextL2OutputReturnType,
  getTimeToNextL2Output,
} from '../actions/getTimeToNextL2Output.js'
import {
  type GetTimeToProveParameters,
  type GetTimeToProveReturnType,
  getTimeToProve,
} from '../actions/getTimeToProve.js'
import {
  type GetWithdrawalStatusParameters,
  type GetWithdrawalStatusReturnType,
  getWithdrawalStatus,
} from '../actions/getWithdrawalStatus.js'
import {
  type WaitForNextL2OutputParameters,
  type WaitForNextL2OutputReturnType,
  waitForNextL2Output,
} from '../actions/waitForNextL2Output.js'
import {
  type WaitToFinalizeParameters,
  type WaitToFinalizeReturnType,
  waitToFinalize,
} from '../actions/waitToFinalize.js'
import {
  type WaitToProveParameters,
  type WaitToProveReturnType,
  waitToProve,
} from '../actions/waitToProve.js'

export type PublicActionsL1<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  /**
   * Prepares parameters for a [deposit transaction](https://github.com/ethereum-optimism/optimism/blob/develop/specs/deposits.md) to be initiated on an L1.
   *
   * - Docs: https://viem.sh/op-stack/actions/buildInitiateWithdrawal
   *
   * @param client - Client to use
   * @param parameters - {@link BuildInitiateWithdrawalParameters}
   * @returns Parameters for `depositTransaction`. {@link DepositTransactionReturnType}
   *
   * @example
   * import { createWalletClient, http, parseEther } from 'viem'
   * import { base } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/op-stack'
   *
   * const client = createWalletClient({
   *   chain: base,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const args = await client.buildInitiateWithdrawal({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: parseEther('1'),
   * })
   */
  buildInitiateWithdrawal: <
    chainOverride extends Chain | undefined = undefined,
    accountOverride extends Account | Address | undefined = undefined,
  >(
    parameters: BuildInitiateWithdrawalParameters<
      chain,
      account,
      chainOverride,
      accountOverride
    >,
  ) => Promise<BuildInitiateWithdrawalReturnType<account, accountOverride>>
  /**
   * Estimates gas required to initiate a [deposit transaction](https://github.com/ethereum-optimism/optimism/blob/develop/specs/deposits.md) on an L1, which executes a transaction on L2.
   *
   * - Docs: https://viem.sh/op-stack/actions/estimateDepositTransactionGas
   *
   * @param client - Client to use
   * @param parameters - {@link EstimateDepositTransactionGasParameters}
   * @returns The L1 transaction hash. {@link EstimateDepositTransactionGasReturnType}
   *
   * @example
   * import { createPublicClient, custom, parseEther } from 'viem'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/op-stack'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(publicActionsL1())
   *
   * const gas = await client.estimateDepositTransactionGas({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   args: {
   *     gas: 21_000n,
   *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *     value: parseEther('1'),
   *   },
   *   targetChain: base,
   * })
   */
  estimateDepositTransactionGas: <
    chainOverride extends Chain | undefined = undefined,
  >(
    parameters: EstimateDepositTransactionGasParameters<
      chain,
      account,
      chainOverride
    >,
  ) => Promise<EstimateDepositTransactionGasReturnType>
  /**
   * Estimates gas required to prove a withdrawal that occurred on an L2.
   *
   * - Docs: https://viem.sh/op-stack/actions/estimateProveWithdrawalGas
   *
   * @param client - Client to use
   * @param parameters - {@link EstimateProveWithdrawalGasParameters}
   * @returns Estimated gas. {@link EstimateProveWithdrawalGasReturnType}
   *
   * @example
   * import { createPublicClient, http, parseEther } from 'viem'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/op-stack'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const gas = await client.estimateProveWithdrawalGas({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   l2OutputIndex: 4529n,
   *   outputRootProof: { ... },
   *   targetChain: optimism,
   *   withdrawalProof: [ ... ],
   *   withdrawal: { ... },
   * })
   */
  estimateProveWithdrawalGas: <
    chainOverride extends Chain | undefined = undefined,
  >(
    parameters: EstimateProveWithdrawalGasParameters<
      chain,
      account,
      chainOverride
    >,
  ) => Promise<EstimateProveWithdrawalGasReturnType>
  /**
   * Estimates gas required to finalize a withdrawal that occurred on an L2.
   *
   * - Docs: https://viem.sh/op-stack/actions/estimateFinalizeWithdrawalGas
   *
   * @param client - Client to use
   * @param parameters - {@link EstimateFinalizeWithdrawalGasParameters}
   * @returns Estimated gas. {@link EstimateFinalizeWithdrawalGasReturnType}
   *
   * @example
   * import { createPublicClient, http, parseEther } from 'viem'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/op-stack'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const gas = await client.estimateFinalizeWithdrawalGas({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   targetChain: optimism,
   *   withdrawal: { ... },
   * })
   */
  estimateFinalizeWithdrawalGas: <
    chainOverride extends Chain | undefined = undefined,
  >(
    parameters: EstimateFinalizeWithdrawalGasParameters<
      chain,
      account,
      chainOverride
    >,
  ) => Promise<EstimateFinalizeWithdrawalGasReturnType>
  /**
   * Retrieves the first L2 output proposal that occurred after a provided block number. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.
   *
   * - Docs: https://viem.sh/op-stack/actions/getL2Output
   *
   * @param client - Client to use
   * @param parameters - {@link GetL2OutputParameters}
   * @returns The L2 output. {@link GetL2OutputReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet, optimism } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/op-stack'
   *
   * const publicClientL1 = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const output = await publicClientL1.getL2Output({
   *   l2BlockNumber: 69420n,
   *   targetChain: optimism
   * })
   */
  getL2Output: <chainOverride extends Chain | undefined = undefined>(
    parameters: GetL2OutputParameters<chain, chainOverride>,
  ) => Promise<GetL2OutputReturnType>
  /**
   * Returns the time until the withdrawal transaction can be finalized. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.
   *
   * - Docs: https://viem.sh/op-stack/actions/getTimeToFinalize
   *
   * @param client - Client to use
   * @param parameters - {@link GetTimeToFinalizeParameters}
   * @returns Time until finalize. {@link GetTimeToFinalizeReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { getBlockNumber } from 'viem/actions'
   * import { mainnet, optimism } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/op-stack'
   *
   * const publicClientL1 = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1())
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
   * const { seconds } = await publicClientL1.getTimeToFinalize({
   *   withdrawalHash: withdrawal.withdrawalHash,
   *   targetChain: optimism
   * })
   */
  getTimeToFinalize: <chainOverride extends Chain | undefined = undefined>(
    parameters: GetTimeToFinalizeParameters<chain, chainOverride>,
  ) => Promise<GetTimeToFinalizeReturnType>
  /**
   * Returns the time until the next L2 output (after a provided block number) is submitted. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.
   *
   * - Docs: https://viem.sh/op-stack/actions/getTimeToNextL2Output
   *
   * @param client - Client to use
   * @param parameters - {@link GetTimeToNextL2OutputParameters}
   * @returns The L2 transaction hash. {@link GetTimeToNextL2OutputReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet, optimism } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/op-stack'
   *
   * const publicClientL1 = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1())
   * const publicClientL2 = createPublicClient({
   *   chain: optimism,
   *   transport: http(),
   * })
   *
   * const l2BlockNumber = await publicClientL2.getBlockNumber()
   * const { seconds } = await publicClientL1.getTimeToNextL2Output({
   *   l2BlockNumber,
   *   targetChain: optimism
   * })
   */
  getTimeToNextL2Output: <chainOverride extends Chain | undefined = undefined>(
    parameters: GetTimeToNextL2OutputParameters<chain, chainOverride>,
  ) => Promise<GetTimeToNextL2OutputReturnType>
  /**
   * Returns the time until the withdrawal transaction can be finalized. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.
   *
   * - Docs: https://viem.sh/op-stack/actions/getTimeToFinalize
   *
   * @param client - Client to use
   * @param parameters - {@link GetTimeToFinalizeParameters}
   * @returns Time until finalize. {@link GetTimeToFinalizeReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { getBlockNumber } from 'viem/actions'
   * import { mainnet, optimism } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/op-stack'
   *
   * const publicClientL1 = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1())
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
   * const { seconds } = await publicClientL1.getTimeToFinalize({
   *   withdrawalHash: withdrawal.withdrawalHash,
   *   targetChain: optimism
   * })
   */
  getTimeToProve: <chainOverride extends Chain | undefined = undefined>(
    parameters: GetTimeToProveParameters<chain, chainOverride>,
  ) => Promise<GetTimeToProveReturnType>
  /**
   * Returns the current status of a withdrawal. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.
   *
   * - Docs: https://viem.sh/op-stack/actions/getWithdrawalStatus
   *
   * @param client - Client to use
   * @param parameters - {@link GetWithdrawalStatusParameters}
   * @returns Status of the withdrawal. {@link GetWithdrawalStatusReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { getBlockNumber } from 'viem/actions'
   * import { mainnet, optimism } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/op-stack'
   *
   * const publicClientL1 = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1())
   * const publicClientL2 = createPublicClient({
   *   chain: optimism,
   *   transport: http(),
   * })
   *
   * const receipt = await publicClientL2.getTransactionReceipt({ hash: '0x...' })
   * const status = await publicClientL1.getWithdrawalStatus({
   *   receipt,
   *   targetChain: optimism
   * })
   */
  getWithdrawalStatus: <chainOverride extends Chain | undefined = undefined>(
    parameters: GetWithdrawalStatusParameters<chain, chainOverride>,
  ) => Promise<GetWithdrawalStatusReturnType>
  /**
   * Waits for the next L2 output (after the provided block number) to be submitted.
   *
   * - Docs: https://viem.sh/op-stack/actions/waitForNextL2Output
   *
   * @param client - Client to use
   * @param parameters - {@link WaitForNextL2OutputParameters}
   * @returns The L2 transaction hash. {@link WaitForNextL2OutputReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { mainnet, optimism } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/op-stack'
   *
   * const publicClientL1 = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1())
   * const publicClientL2 = createPublicClient({
   *   chain: optimism,
   *   transport: http(),
   * })
   *
   * const l2BlockNumber = await getBlockNumber(publicClientL2)
   * await waitForNextL2Output(publicClientL1, {
   *   l2BlockNumber,
   *   targetChain: optimism
   * })
   */
  waitForNextL2Output: <chainOverride extends Chain | undefined = undefined>(
    parameters: WaitForNextL2OutputParameters<chain, chainOverride>,
  ) => Promise<WaitForNextL2OutputReturnType>
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
   * import { publicActionsL1 } from 'viem/op-stack'
   *
   * const publicClientL1 = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1)
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
   * await publicClientL1.waitToFinalize({
   *   withdrawalHash: withdrawal.withdrawalHash,
   *   targetChain: optimism
   * })
   */
  waitToFinalize: <chainOverride extends Chain | undefined = undefined>(
    parameters: WaitToFinalizeParameters<chain, chainOverride>,
  ) => Promise<WaitToFinalizeReturnType>
  /**
   * Waits until the L2 withdrawal transaction is provable. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.
   *
   * - Docs: https://viem.sh/op-stack/actions/waitToProve
   *
   * @param client - Client to use
   * @param parameters - {@link WaitToProveParameters}
   * @returns The L2 output and withdrawal message. {@link WaitToProveReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { getBlockNumber } from 'viem/actions'
   * import { mainnet, optimism } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/op-stack'
   *
   * const publicClientL1 = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1)
   * const publicClientL2 = createPublicClient({
   *   chain: optimism,
   *   transport: http(),
   * })
   *
   * const receipt = await publicClientL2.getTransactionReceipt({ hash: '0x...' })
   * await publicClientL1.waitToProve({
   *   receipt,
   *   targetChain: optimism
   * })
   */
  waitToProve: <chainOverride extends Chain | undefined = undefined>(
    parameters: WaitToProveParameters<chain, chainOverride>,
  ) => Promise<WaitToProveReturnType>
}

/**
 * A suite of Public Actions for suited for development with Layer 2 (OP Stack) chains.
 *
 * - Docs: https://viem.sh/op-stack/client
 *
 * @example
 * import { publicActionsL1 } from 'viem/op-stack'
 * import { mainnet } from 'viem/chains'
 * import { buildDepositTransaction } from 'viem/wallet'
 *
 * export const opStackPublicClientL1 = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(publicActionsL1())
 */
export function publicActionsL1() {
  return <
    TTransport extends Transport,
    TChain extends Chain | undefined = Chain | undefined,
    TAccount extends Account | undefined = Account | undefined,
  >(
    client: Client<TTransport, TChain, TAccount>,
  ): PublicActionsL1<TChain, TAccount> => {
    return {
      buildInitiateWithdrawal: (args) => buildInitiateWithdrawal(client, args),
      estimateDepositTransactionGas: (args) =>
        estimateDepositTransactionGas(client, args),
      estimateFinalizeWithdrawalGas: (args) =>
        estimateFinalizeWithdrawalGas(client, args),
      estimateProveWithdrawalGas: (args) =>
        estimateProveWithdrawalGas(client, args),
      getL2Output: (args) => getL2Output(client, args),
      getTimeToFinalize: (args) => getTimeToFinalize(client, args),
      getTimeToNextL2Output: (args) => getTimeToNextL2Output(client, args),
      getTimeToProve: (args) => getTimeToProve(client, args),
      getWithdrawalStatus: (args) => getWithdrawalStatus(client, args),
      waitForNextL2Output: (args) => waitForNextL2Output(client, args),
      waitToFinalize: (args) => waitToFinalize(client, args),
      waitToProve: (args) => waitToProve(client, args),
    }
  }
}
