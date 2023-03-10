import type {
  BaseRpcRequests,
  Transport,
  TransportConfig,
} from './createTransport'
import { createTransport } from './createTransport'

type EthereumProvider = { request: BaseRpcRequests['request'] }

export type CustomTransportConfig = Partial<Pick<TransportConfig, 'key' | 'name' | 'retryCount' | 'retryDelay'>>

export type CustomTransport = Transport<'custom', EthereumProvider['request']>

/**
 * @description Creates a custom transport given an EIP-1193 compliant `request` attribute.
 */
export function custom<TProvider extends EthereumProvider>(
  provider: TProvider,
  config: CustomTransportConfig = {},
): CustomTransport {
  const { key = 'custom', name = 'Custom Provider', retryDelay } = config
  return ({ retryCount: defaultRetryCount }) =>
    createTransport({
      key,
      name,
      request: provider.request.bind(provider),
      retryCount: config.retryCount ?? defaultRetryCount,
      retryDelay,
      type: 'custom',
    })
}
