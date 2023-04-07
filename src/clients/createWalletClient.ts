import type { Client, ClientConfig } from './createClient.js'
import { createClient } from './createClient.js'
import type { Transport } from './transports/createTransport.js'
import type {
  Account,
  Address,
  Chain,
  JsonRpcAccount,
  Prettify,
} from '../types/index.js'
import { walletActions } from './decorators/index.js'
import type { WalletActions } from './decorators/index.js'
import { parseAccount } from '../utils/index.js'
import type { Requests } from '../types/eip1193.js'

export type WalletClientConfig<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccountOrAddress extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = Pick<
  ClientConfig<TTransport, TChain>,
  'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
> & {
  /** The Account to use for the Wallet Client. This will be used for Actions that require an account as an argument. */
  account?: TAccountOrAddress
}

export type WalletClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TIncludeActions extends boolean = true,
> = Prettify<
  Client<TTransport, Requests, TChain> &
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
  TAccountOrAddress extends Address
    ? Prettify<JsonRpcAccount<TAccountOrAddress>>
    : TAccountOrAddress,
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
    TTransport,
    TChain,
    TAccountOrAddress extends Address
      ? JsonRpcAccount<TAccountOrAddress>
      : TAccountOrAddress
  >
  return {
    ...client,
    ...walletActions(client),
  }
}
