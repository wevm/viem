import { SignableRequests, WalletRequests } from '../types/eip1193'
import { Transport } from './transports/createTransport'
import { Client, ClientConfig, createClient } from './createClient'

export type WalletClientConfig = {
  /** The key of the Wallet Client. */
  key?: ClientConfig['key']
  /** The name of the Wallet Client. */
  name?: ClientConfig['name']
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval?: ClientConfig['pollingInterval']
}

export type WalletClient<TTransport extends Transport = Transport> = Client<
  TTransport,
  SignableRequests & WalletRequests
>

/**
 * @description Creates a wallet client with a given transport.
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
export function createWalletClient<TTransport extends Transport>(
  transport: TTransport,
  {
    key = 'wallet',
    name = 'Wallet Client',
    pollingInterval,
  }: WalletClientConfig = {},
): WalletClient<TTransport> {
  return {
    ...createClient(transport, {
      key,
      name,
      pollingInterval,
      type: 'walletClient',
    }),
  }
}
