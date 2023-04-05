import type { Client, ClientConfig } from './createClient'
import { createClient } from './createClient'
import type { Transport } from './transports/createTransport'
import type {
  Account,
  Address,
  Chain,
  JsonRpcAccount,
  Prettify,
} from '../types'
import { WalletActions, walletActions } from './decorators'
import { parseAccount } from '../utils'
import type { Requests } from '../types/eip1193'

export type WalletClientConfig<
  TChain extends Chain | undefined = Chain | undefined,
  TAccountOrAddress extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
  TTransport extends Transport = Transport,
> = Pick<
  ClientConfig<TChain, TTransport>,
  'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
> & {
  /** The Account to use for the Wallet Client. This will be used for Actions that require an account as an argument. */
  account?: TAccountOrAddress
}

export type WalletClient<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TTransport extends Transport = Transport,
  TIncludeActions extends boolean = true,
> = Prettify<
  Client<TChain, Requests, TTransport> &
    (TIncludeActions extends true
      ? WalletActions<TChain, TAccount>
      : unknown) & {
      /** The Account to use for the Wallet Client. */
      account: TAccount
    }
>

/**
 * @description Creates a wallet client with a given transport.
 */
export function createWalletClient<
  TChain extends Chain | undefined = undefined,
  TAccountOrAddress extends Account | Address | undefined = undefined,
  TTransport extends Transport = Transport,
>({
  account,
  chain,
  transport,
  key = 'wallet',
  name = 'Wallet Client',
  pollingInterval,
}: WalletClientConfig<TChain, TAccountOrAddress, TTransport>): WalletClient<
  TChain,
  TAccountOrAddress extends Address
    ? Prettify<JsonRpcAccount<TAccountOrAddress>>
    : TAccountOrAddress,
  TTransport,
  true
> {
  const client = {
    ...createClient({
      chain,
      key,
      name,
      pollingInterval,
      transport: (opts) => transport({ ...opts, retryCount: 0 }),
      type: 'walletClient',
    }),
    account: account ? parseAccount(account) : undefined,
  } as WalletClient<
    TChain,
    TAccountOrAddress extends Address
      ? JsonRpcAccount<TAccountOrAddress>
      : TAccountOrAddress,
    TTransport
  >
  return {
    ...client,
    ...walletActions(client),
  }
}
