import type { Client, ClientConfig } from './createClient'
import { createClient } from './createClient'
import type { Transport } from './transports/createTransport'
import type { Account, Address, Chain, ParseAccount } from '../types'
import { WalletActions, walletActions } from './decorators'
import { parseAccount } from '../utils'

export type WalletClientConfig<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = undefined,
  TAccountOrAddress extends Account | Address | undefined = undefined,
> = Pick<
  ClientConfig<TTransport, TChain>,
  'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
> & {
  /** The Account to use for the Wallet Client. This will be used for Actions that require an account as an argument. */
  account?: TAccountOrAddress
}

export type WalletClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = undefined,
  TAccount extends Account | undefined = undefined,
  TIncludeActions extends boolean = true,
> = Client<TTransport, TChain> &
  (TIncludeActions extends true ? WalletActions<TChain, TAccount> : unknown) & {
    /** The Account to use for the Wallet Client. */
    account: TAccount
  }

/**
 * @description Creates a wallet client with a given transport.
 */
export function createWalletClient<
  TTransport extends Transport,
  TChain extends Chain | undefined = undefined,
  TAccountOrAddress extends Account | Address | undefined = undefined,
  _Account extends Account | undefined = ParseAccount<TAccountOrAddress>,
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
  _Account,
  true
> {
  const client = {
    ...createClient({
      chain,
      key,
      name,
      pollingInterval,
      transport: () => transport({ retryCount: 0 }),
      type: 'walletClient',
    }),
    account: account ? parseAccount(account) : undefined,
  } as WalletClient<TTransport, TChain, _Account>
  return {
    ...client,
    ...walletActions(client),
  }
}
