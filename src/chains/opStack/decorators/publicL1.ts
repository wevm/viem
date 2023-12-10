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
  type GetSecondsToNextL2OutputParameters,
  type GetSecondsToNextL2OutputReturnType,
  getSecondsToNextL2Output,
} from '../actions/getSecondsToNextL2Output.js'

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
  getSecondsToNextL2Output: <
    chainOverride extends Chain | undefined = undefined,
  >(
    parameters: GetSecondsToNextL2OutputParameters<chain, chainOverride>,
  ) => Promise<GetSecondsToNextL2OutputReturnType>
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
      getSecondsToNextL2Output: (args) =>
        getSecondsToNextL2Output(client, args),
    }
  }
}
