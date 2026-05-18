import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import {
  type WithdrawParameters,
  type WithdrawReturnType,
  withdraw,
} from '../actions/withdraw.js'
import type { ChainEIP712 } from '../types/chain.js'

export type WalletActionsL2<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  /**
   * Initiates the withdrawal process which withdraws ETH or any ERC20 token
   * from the associated account on L2 network to the target account on L1 network.
   *
   * @param args - {@link WithdrawParameters}
   * @returns hash - The [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash. {@link WithdrawReturnType}
   *
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { zksync } from 'viem/chains'
   * import { publicActionsL2, legacyEthAddress } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksync,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const hash = await client.withdraw({
   *     account: privateKeyToAccount('0x…'),
   *     amount: 1_000_000_000_000_000_000n,
   *     token: legacyEthAddress,
   * })
   *
   * @example Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { zksync } from 'viem/chains'
   * import { publicActionsL2, legacyEthAddress } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: zksync,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const hash = await client.withdraw({
   *     amount: 1_000_000_000_000_000_000n,
   *     token: legacyEthAddress,
   * })
   *
   * @example Paymaster
   * import { createPublicClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { zksync } from 'viem/chains'
   * import { publicActionsL2, legacyEthAddress } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksync,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const hash = await client.withdraw({
   *     account: privateKeyToAccount('0x…'),
   *     amount: 1_000_000_000_000_000_000n,
   *     token: legacyEthAddress,
   *     paymaster: '0x0EEc6f45108B4b806e27B81d9002e162BD910670',
   *     paymasterInput: getApprovalBasedPaymasterInput({
   *       minAllowance: 1n,
   *       token: '0x2dc3685cA34163952CF4A5395b0039c00DFa851D',
   *       innerInput: new Uint8Array(),
   *     }),
   * })
   */
  withdraw: <chainOverride extends ChainEIP712 | undefined = undefined>(
    args: WithdrawParameters<chain, account, chainOverride>,
  ) => Promise<WithdrawReturnType>
}

export function walletActionsL2() {
  return <
    transport extends Transport,
    chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): WalletActionsL2<chain, account> => ({
    withdraw: (args) => withdraw(client, args),
  })
}
