import { Chain } from '../../chains'
import { Events } from '../../types/ethereum-provider'
import {
  BaseProvider,
  BaseProviderConfig,
  BaseProviderRequestFn,
  createBaseProvider,
} from '../createBaseProvider'

export type WalletProviderConfig<
  TChain extends Chain = Chain,
  TRequestFn extends BaseProviderRequestFn = BaseProviderRequestFn,
  TKey extends string = string,
> = Omit<BaseProviderConfig<TChain, TRequestFn, TKey>, 'type'> & {
  /** Event listener callback that matches the EIP-1193 events spec. */
  on: Events['on']
  /** Event listener callback that matches the EIP-1193 events spec. */
  removeListener: Events['removeListener']
}

export type WalletProvider<
  TChain extends Chain = Chain,
  TRequestFn extends BaseProviderRequestFn = BaseProviderRequestFn,
  TKey extends string = string,
> = BaseProvider<TChain, TRequestFn, TKey> & {
  /** Event listener callback that matches the EIP-1193 events spec. */
  on: Events['on']
  /** Event listener callback that matches the EIP-1193 events spec. */
  removeListener: Events['removeListener']
  type: 'walletProvider'
}

/**
 * @description Creates a provider that is intended to be used as a base for
 * wallet providers. A wallet provider performs requests to an Ethereum node
 * via a JSON-RPC API that the wallet controls (Injected MetaMask, WalletConnect, etc).
 * They have access to "public" RPC methods as well as event listeners. */
export function createWalletProvider<
  TChain extends Chain,
  TRequestFn extends BaseProviderRequestFn,
  TKey extends string,
>({
  chains,
  key,
  name,
  on,
  pollingInterval,
  removeListener,
  request,
  uniqueId,
}: WalletProviderConfig<TChain, TRequestFn, TKey>): WalletProvider<
  TChain,
  TRequestFn,
  TKey
> {
  const baseProvider = createBaseProvider({
    chains,
    key,
    name,
    pollingInterval,
    request,
    type: 'walletProvider',
    uniqueId,
  })
  return {
    ...baseProvider,
    on,
    removeListener,
  }
}
