import {
  Adapter,
  AdapterConfig,
  BaseRpcRequests,
  createAdapter,
} from './createAdapter'

type EthereumProvider = { request: BaseRpcRequests['request'] }

export type EthereumProviderAdapterConfig<TProvider> = {
  /** The key of the adapter. */
  key?: AdapterConfig['key']
  /** The name of the adapter. */
  name?: AdapterConfig['name']
  /** An EIP-1193 or equivalent provider with a "request" function. */
  provider: TProvider
}

export type EthereumProviderAdapter = Adapter<
  'ethereumProvider',
  EthereumProvider['request']
>

/**
 * @description Creates an adapter based on an EIP-1193 provider (eg. `window.ethereum`).
 */
export function ethereumProvider<TProvider extends EthereumProvider>({
  key = 'ethereumProvider',
  name = 'Ethereum Provider',
  provider,
}: EthereumProviderAdapterConfig<TProvider>): EthereumProviderAdapter {
  return createAdapter({
    key,
    name,
    request: provider.request.bind(provider),
    type: 'ethereumProvider',
  })
}
