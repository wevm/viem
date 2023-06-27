import type { Address } from 'abitype'

import type { Account } from '../accounts/types.js'
import type { ParseAccount } from '../types/account.js'
import type { Chain } from '../types/chain.js'
import type { WalletRpcSchema } from '../types/eip1193.js'
import type { Prettify } from '../types/utils.js'
import { type Client, type ClientConfig, createClient } from './createClient.js'
import { type WalletActions, walletActions } from './decorators/wallet.js'
import type { Transport } from './transports/createTransport.js'

export type WalletClientConfig<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccountOrAddress extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = Pick<
  ClientConfig<TTransport, TChain, TAccountOrAddress>,
  'account' | 'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
>

export type WalletClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
> = Prettify<
  Client<
    TTransport,
    TChain,
    TAccount,
    WalletRpcSchema,
    WalletActions<TChain, TAccount>
  >
>

/**
 * Creates a Wallet Client with a given [Transport](https://viem.sh/docs/clients/intro.html) configured for a [Chain](https://viem.sh/docs/clients/chains.html).
 *
 * - Docs: https://viem.sh/docs/clients/wallet.html
 *
 * A Wallet Client is an interface to interact with [Ethereum Account(s)](https://ethereum.org/en/glossary/#account) and provides the ability to retrieve accounts, execute transactions, sign messages, etc. through [Wallet Actions](https://viem.sh/docs/actions/wallet/introduction.html).
 *
 * The Wallet Client supports signing over:
 * - [JSON-RPC Accounts](https://viem.sh/docs/clients/wallet.html#json-rpc-accounts) (e.g. Browser Extension Wallets, WalletConnect, etc).
 * - [Local Accounts](https://viem.sh/docs/clients/wallet.html#local-accounts-private-key-mnemonic-etc) (e.g. private key/mnemonic wallets).
 *
 * @param config - {@link WalletClientConfig}
 * @returns A Wallet Client. {@link WalletClient}
 *
 * @example
 * // JSON-RPC Account
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 *
 * @example
 * // Local Account
 * import { createWalletClient, custom } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…')
 *   chain: mainnet,
 *   transport: http(),
 * })
 */
export function createWalletClient<
  TTransport extends Transport,
  TChain extends Chain | undefined = undefined,
  TAccountOrAddress extends Account | Address | undefined = undefined,
>({
  account,
  chain,
  transport,
  key = 'wallet',
  name = 'Wallet Client',
  pollingInterval,
}: WalletClientConfig<TTransport, TChain, TAccountOrAddress>): WalletClient<
  TTransport,
  TChain,
  ParseAccount<TAccountOrAddress>
> {
  return createClient({
    account,
    chain,
    key,
    name,
    pollingInterval,
    transport: (opts) => transport({ ...opts, retryCount: 0 }),
    type: 'walletClient',
  }).extend(walletActions)
}
