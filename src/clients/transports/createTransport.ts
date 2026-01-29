import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import type { OneOf } from '../../types/utils.js'
import { buildRequest } from '../../utils/buildRequest.js'
import { uid as uid_ } from '../../utils/uid.js'
import type { ClientConfig } from '../createClient.js'

export type TransportConfig<
  type extends string = string,
  eip1193RequestFn extends EIP1193RequestFn = EIP1193RequestFn,
> = {
  /** The name of the transport. */
  name: string
  /** The key of the transport. */
  key: string
  /** Methods to include or exclude from executing RPC requests. */
  methods?:
    | OneOf<
        | {
            include?: string[] | undefined
          }
        | {
            exclude?: string[] | undefined
          }
      >
    | undefined
  /** The JSON-RPC request function that matches the EIP-1193 request spec. */
  request: eip1193RequestFn
  /** The base delay (in ms) between retries. */
  retryDelay?: number | undefined
  /** The max number of times to retry. */
  retryCount?: number | undefined
  /** The timeout (in ms) for requests. */
  timeout?: number | undefined
  /** The type of the transport. */
  type: type
}

export type Transport<
  type extends string = string,
  rpcAttributes = Record<string, any>,
  eip1193RequestFn extends EIP1193RequestFn = EIP1193RequestFn,
> = <chain extends Chain | undefined = Chain>({
  chain,
}: {
  chain?: chain | undefined
  pollingInterval?: ClientConfig['pollingInterval'] | undefined
  retryCount?: TransportConfig['retryCount'] | undefined
  timeout?: TransportConfig['timeout'] | undefined
}) => {
  config: TransportConfig<type>
  request: eip1193RequestFn
  value?: rpcAttributes | undefined
}

export type CreateTransportErrorType = ErrorType

/**
 * @description Creates an transport intended to be used with a client.
 */
export function createTransport<
  type extends string,
  rpcAttributes extends Record<string, any>,
>(
  {
    key,
    methods,
    name,
    request,
    retryCount = 3,
    retryDelay = 150,
    timeout,
    type,
  }: TransportConfig<type>,
  value?: rpcAttributes | undefined,
): ReturnType<Transport<type, rpcAttributes>> {
  const uid = uid_()
  return {
    config: {
      key,
      methods,
      name,
      request,
      retryCount,
      retryDelay,
      timeout,
      type,
    },
    request: buildRequest(request, { methods, retryCount, retryDelay, uid }),
    value,
  }
}
