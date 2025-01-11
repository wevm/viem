import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import {
  type RequestExecuteParameters,
  type RequestExecuteReturnType,
  requestExecute,
} from '../actions/requestExecute.js'
import type { ChainEIP712 } from '../types/chain.js'

export type WalletActionsL1<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  /**
   * Requests execution of a L2 transaction from L1.
   *
   * @param parameters - {@link RequestExecuteParameters}
   * @returns hash - The [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash. {@link RequestExecuteReturnType}
   *
   * @example
   * import { createPublicClient, createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { zksync, mainnet } from 'viem/chains'
   * import { walletActionsL1, publicActionsL2 } from 'viem/zksync'
   *
   * const walletClient = createWalletClient({
   *   chain: mainnet,
   *   transport: http(),
   *   account: privateKeyToAccount('0x…'),
   * }).extend(walletActionsL1())
   *
   * const clientL2 = createPublicClient({
   *   chain: zksync,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const hash = await walletClient.requestExecute({
   *     client: clientL2,
   *     contractAddress: '0x43020e6e11cef7dce8e37baa09d9a996ac722057'
   *     calldata: '0x',
   *     l2Value: 1_000_000_000_000_000_000n,
   * })
   */
  requestExecute: <
    chainOverride extends Chain | undefined = undefined,
    chainL2 extends ChainEIP712 | undefined = ChainEIP712 | undefined,
    accountL2 extends Account | undefined = Account | undefined,
  >(
    parameters: RequestExecuteParameters<
      chain,
      account,
      chainOverride,
      chainL2,
      accountL2
    >,
  ) => Promise<RequestExecuteReturnType>
}

export function walletActionsL1() {
  return <
    transport extends Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): WalletActionsL1<chain, account> => ({
    requestExecute: (args) => requestExecute(client, args),
  })
}
