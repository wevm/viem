import type { Client, ClientConfig } from './createClient'
import { createClient } from './createClient'
import type { Transport } from './transports/createTransport'
import type { Account, Address, Chain, ParseAccount } from '../types'
import { WalletActions, walletActions } from './decorators'
import { parseAccount } from '../utils'

export type WalletClientConfig<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain,
  TAccount extends Account | Address | undefined = undefined,
> = {
  account?: TAccount
  chain?: TChain
  /** The key of the Wallet Client. */
  key?: ClientConfig['key']
  /** The name of the Wallet Client. */
  name?: ClientConfig['name']
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval?: ClientConfig['pollingInterval']
  transport: ClientConfig<TTransport, TChain>['transport']
}

export type WalletClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = undefined,
  TAccount extends Account | undefined = undefined,
  TIncludeActions extends boolean = true,
> = Client<TTransport, TChain> & {
  account: TAccount
} & (TIncludeActions extends true ? WalletActions<TChain, TAccount> : {})

export type WalletClientArg<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TIncludeActions extends boolean = boolean,
> = WalletClient<TTransport, TChain, TAccount, TIncludeActions>

/**
 * @description Creates a wallet client with a given transport.
 */
export function createWalletClient<
  TTransport extends Transport,
  TChain extends Chain | undefined = undefined,
  TAccountOrAddress extends Account | Address | undefined = undefined,
  TAccount extends Account | undefined = ParseAccount<TAccountOrAddress>,
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
  TAccount,
  true
> {
  const baseClient = createClient({
    chain,
    key,
    name,
    pollingInterval,
    transport: () => transport({ retryCount: 0 }),
    type: 'walletClient',
  })
  const client = {
    account: account ? parseAccount(account) : undefined,
    ...baseClient,
  }
  return {
    ...client,
    ...(walletActions(client as any) as any),
  }
}
