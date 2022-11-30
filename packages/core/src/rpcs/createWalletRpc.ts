import { SignableRequests, WalletRequests } from '../types/eip1193'
import { Adapter } from './adapters/createAdapter'
import { Rpc, RpcConfig, createRpc } from './createRpc'

export type WalletRpcConfig = {
  /** The key of the Wallet RPC. */
  key?: RpcConfig['key']
  /** The name of the Wallet RPC. */
  name?: RpcConfig['name']
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval?: RpcConfig['pollingInterval']
}

export type WalletRpc<TAdapter extends Adapter = Adapter> = Rpc<
  TAdapter,
  SignableRequests & WalletRequests
>

/**
 * @description Creates a wallet RPC client with a given adapter.
 *
 * - Only has access to "wallet" & "signable" EIP-1474 RPC methods
 * (ie. `eth_sendTransaction`, `eth_requestAccounts`, etc).
 *
 * @example
 * import { createWalletRpc, external } from 'viem/rpcs'
 * const rpc = createWalletRpc(external({ provider: window.ethereum }))
 */
export function createWalletRpc<TAdapter extends Adapter>(
  adapter: TAdapter,
  {
    key = 'wallet',
    name = 'Wallet RPC Client',
    pollingInterval,
  }: WalletRpcConfig = {},
): WalletRpc<TAdapter> {
  return {
    ...createRpc(adapter, {
      key,
      name,
      pollingInterval,
      type: 'walletRpc',
    }),
  }
}
