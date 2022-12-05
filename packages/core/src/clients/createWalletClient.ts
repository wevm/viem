import { SignableRequests, WalletRequests } from '../types/eip1193'
import { Adapter } from './adapters/createAdapter'
import { Client, ClientConfig, createClient } from './createClient'

export type WalletClientConfig = {
  /** The key of the Wallet Client. */
  key?: ClientConfig['key']
  /** The name of the Wallet Client. */
  name?: ClientConfig['name']
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval?: ClientConfig['pollingInterval']
}

export type WalletClient<TAdapter extends Adapter = Adapter> = Client<
  TAdapter,
  SignableRequests & WalletRequests
>

/**
 * @description Creates a wallet client with a given adapter.
 *
 * - Only has access to "wallet" & "signable" EIP-1474 RPC methods
 * (ie. `eth_sendTransaction`, `eth_requestAccounts`, etc).
 *
 * @example
 * import { createWalletClient, ethereumProvider } from 'viem/clients'
 * const client = createWalletClient(
 *  ethereumProvider({ provider: window.ethereum })
 * )
 */
export function createWalletClient<TAdapter extends Adapter>(
  adapter: TAdapter,
  {
    key = 'wallet',
    name = 'Wallet Client',
    pollingInterval,
  }: WalletClientConfig = {},
): WalletClient<TAdapter> {
  return {
    ...createClient(adapter, {
      key,
      name,
      pollingInterval,
      type: 'walletClient',
    }),
  }
}
