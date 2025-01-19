import type { ErrorType } from '../../errors/utils.js'
import {
  type CreateTransportErrorType,
  type Transport,
  type TransportConfig,
  createTransport,
} from './createTransport.js'

type EthereumProvider = { request(...args: any): Promise<any> }

export type CustomTransportConfig = {
  /** The key of the transport. */
  key?: TransportConfig['key'] | undefined
  /** Methods to include or exclude from executing RPC requests. */
  methods?: TransportConfig['methods'] | undefined
  /** The name of the transport. */
  name?: TransportConfig['name'] | undefined
  /** The max number of times to retry. */
  retryCount?: TransportConfig['retryCount'] | undefined
  /** The base delay (in ms) between retries. */
  retryDelay?: TransportConfig['retryDelay'] | undefined
}

export type CustomTransport = Transport<
  'custom',
  {},
  EthereumProvider['request']
>

export type CustomTransportErrorType = CreateTransportErrorType | ErrorType

/**
 * @description Creates a custom transport given an EIP-1193 compliant `request` attribute.
 */
export function custom<provider extends EthereumProvider>(
  provider: provider,
  config: CustomTransportConfig = {},
): CustomTransport {
  const {
    key = 'custom',
    methods,
    name = 'Custom Provider',
    retryDelay,
  } = config
  return ({ retryCount: defaultRetryCount }) =>
    createTransport({
      key,
      methods,
      name,
      request: provider.request.bind(provider),
      retryCount: config.retryCount ?? defaultRetryCount,
      retryDelay,
      type: 'custom',
    })
}
