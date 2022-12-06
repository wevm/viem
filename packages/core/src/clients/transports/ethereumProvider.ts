import {
  BaseRpcRequests,
  Transport,
  TransportConfig,
  createTransport,
} from './createTransport'

type EthereumProvider = { request: BaseRpcRequests['request'] }

export type EthereumProviderTransportConfig<TProvider> = {
  /** The key of the transport. */
  key?: TransportConfig['key']
  /** The name of the transport. */
  name?: TransportConfig['name']
  /** An EIP-1193 or equivalent provider with a "request" function. */
  provider: TProvider
}

export type EthereumProviderTransport = Transport<
  'ethereumProvider',
  EthereumProvider['request']
>

/**
 * @description Creates a transport based on an EIP-1193 provider (eg. `window.ethereum`).
 */
export function ethereumProvider<TProvider extends EthereumProvider>({
  key = 'ethereumProvider',
  name = 'Ethereum Provider',
  provider,
}: EthereumProviderTransportConfig<TProvider>): EthereumProviderTransport {
  return createTransport({
    key,
    name,
    request: provider.request.bind(provider),
    type: 'ethereumProvider',
  })
}
