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
  type GetL2OutputParameters,
  type GetL2OutputReturnType,
  getL2Output,
} from '../actions/getL2Output.js'
import {
  type GetTimeToNextL2OutputParameters,
  type GetTimeToNextL2OutputReturnType,
  getTimeToNextL2Output,
} from '../actions/getTimeToNextL2Output.js'
import {
  type WaitForL2OutputParameters,
  type WaitForL2OutputReturnType,
  waitForL2Output,
} from '../actions/waitForL2Output.js'
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
   * - Docs: https://viem.sh/op-stack/actions/buildInitiateWithdrawal.html
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
   * const request = await client.buildInitiateWithdrawal({
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
   * Retrieves the first L2 output proposal that occurred after a provided block number. Used for the [Withdrawal](/op-stack/guides/withdrawals.html) flow.
   *
   * - Docs: https://viem.sh/op-stack/actions/getL2Output.html
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
   * Returns the time until the next L2 output (after a provided block number) is submitted. Used for the [Withdrawal](/op-stack/guides/withdrawals.html) flow.
   *
   * - Docs: https://viem.sh/op-stack/actions/getTimeToNextL2Output.html
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
   * Waits for the next L2 output (after the provided block number) to be submitted.
   *
   * - Docs: https://viem.sh/op-stack/actions/waitForL2Output.html
   *
   * @param client - Client to use
   * @param parameters - {@link WaitForL2OutputParameters}
   * @returns The L2 transaction hash. {@link WaitForL2OutputReturnType}
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
   * await waitForL2Output(publicClientL1, {
   *   l2BlockNumber,
   *   targetChain: optimism
   * })
   */
  waitForL2Output: <chainOverride extends Chain | undefined = undefined>(
    parameters: WaitForL2OutputParameters<chain, chainOverride>,
  ) => Promise<WaitForL2OutputReturnType>
  /**
   * Waits until the L2 withdrawal transaction is provable. Used for the [Withdrawal](/op-stack/guides/withdrawals.html) flow.
   *
   * - Docs: https://viem.sh/op-stack/actions/waitToProve.html
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
      getL2Output: (args) => getL2Output(client, args),
      getTimeToNextL2Output: (args) => getTimeToNextL2Output(client, args),
      waitForL2Output: (args) => waitForL2Output(client, args),
      waitToProve: (args) => waitToProve(client, args),
    }
  }
}
