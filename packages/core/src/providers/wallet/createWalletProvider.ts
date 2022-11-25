import { Events } from '../../types/ethereum-provider'
import {
  BaseProvider,
  BaseProviderConfig,
  BaseProviderRequests,
  createBaseProvider,
} from '../createBaseProvider'

export type WalletProviderConfig<
  TRequests extends BaseProviderRequests = BaseProviderRequests,
  TKey extends string = string,
> = Omit<BaseProviderConfig<TRequests, TKey>, 'type'> & {
  /** Event listener callback that matches the EIP-1193 events spec. */
  on: Events['on']
  /** Event listener callback that matches the EIP-1193 events spec. */
  removeListener: Events['removeListener']
}

export type WalletProvider<
  TRequests extends BaseProviderRequests = BaseProviderRequests,
  TKey extends string = string,
> = BaseProvider<TRequests, TKey> & {
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
  TRequests extends BaseProviderRequests,
  TKey extends string,
>({
  key,
  name,
  on,
  pollingInterval,
  removeListener,
  request,
}: WalletProviderConfig<TRequests, TKey>): WalletProvider<TRequests, TKey> {
  const baseProvider = createBaseProvider({
    key,
    name,
    pollingInterval,
    request,
    type: 'walletProvider',
  })
  return {
    ...baseProvider,
    on,
    removeListener,
  }
}
