import {
  Adapter,
  AdapterConfig,
  BaseRpcRequests,
  createAdapter,
} from './createAdapter'

type ExternalProvider = { request: BaseRpcRequests['request'] }

export type ExternalAdapterConfig<TProvider extends ExternalProvider = any> = {
  /** The key of the HTTP adapter. */
  key?: AdapterConfig['key']
  /** The name of the HTTP adapter. */
  name?: AdapterConfig['name']
  /** An EIP-1193 or equivalent provider with a "request" function. */
  provider: TProvider
}

export type ExternalAdapter = Adapter<'external', ExternalProvider['request']>

/**
 * @description Creates an adapter based on an EIP-1193 provider (eg. `window.ethereum`).
 */
export function external({
  key = 'external',
  name = 'External',
  provider,
}: ExternalAdapterConfig): ExternalAdapter {
  return createAdapter({
    key,
    name,
    request: provider.request.bind(provider),
    type: 'external',
  })
}
