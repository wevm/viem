import type * as Chain from './Chain.js'
import * as Errors from './Errors.js'
import * as internal from './internal/transport.js'
import type { Prettify } from './internal/types.js'
import { uid } from './internal/uid.js'

export type { RequestFn } from './internal/transport.js'
export {
  HttpError,
  SocketClosedError,
  TimeoutError,
} from '../utils/RpcClient.js'
export { custom, type Custom } from './transports/custom.js'
export {
  fallback,
  type Fallback,
  type OnResponse,
  type RankOptions,
} from './transports/fallback.js'
export { http, type Http } from './transports/http.js'
export { loadBalance, type LoadBalance } from './transports/loadBalance.js'
export { rateLimit, type RateLimit } from './transports/rateLimit.js'
export {
  webSocket,
  type WebSocket,
  type WebSocketRpcClient,
} from './transports/webSocket.js'

/** Raw (pre-wrap) rpc request function returned by a transport's `setup`. */
type RawRequestFn = (
  args: { method: string; params?: unknown },
  options?: { signal?: AbortSignal | undefined } | undefined,
) => Promise<unknown>

/**
 * A Transport: a static identity (`key`/`name`/`type`) plus a `setup` the
 * {@link Client} calls with its context to produce a live instance.
 */
export type Transport<
  type extends string = string,
  properties = {},
  requestFn extends internal.RequestFn = internal.RequestFn,
> = {
  key: string
  name: string
  type: type
  setup: (options?: SetupOptions) => Instance<properties, requestFn>
}

export type SetupOptions = {
  /** Chain the transport connects through (supplied by the client). */
  chain?: Chain.Chain | undefined
  /** Client polling interval (ms). */
  pollingInterval?: number | undefined
  /** Max retries per request. */
  retryCount?: number | undefined
  /** Request timeout (ms). */
  timeout?: number | undefined
}

/** Configuration shared by every transport instance (and a `setup` return). */
type InstanceOptions = {
  /** RPC methods to include or exclude. */
  methods?: { include?: string[] } | { exclude?: string[] } | undefined
  /** Max retries per request. @default 3 */
  retryCount?: number | undefined
  /** Base delay (ms) between retries. @default 150 */
  retryDelay?: number | undefined
  /** Request timeout (ms). */
  timeout?: number | undefined
}

export type Instance<
  properties = {},
  requestFn extends internal.RequestFn = internal.RequestFn,
> = Prettify<
  InstanceOptions & {
    /** The retry/dedupe-wrapped request function. */
    request: requestFn
  } & properties
>

/**
 * Builds a {@link Transport} from its identity + a `setup` that produces the
 * instance. Injects the retry/dedupe wrap around the instance's `request`.
 *
 * The transport `type` and `properties` are inferred from the `setup` return:
 * any fields beyond the base {@link Instance} shape become the transport's
 * `properties`.
 */
export function from<const type extends string, instance extends from.Instance>(
  parameters: from.Parameters<type, instance>,
): Transport<type, from.Properties<instance>> {
  const { setup, ...identity } = parameters
  return {
    ...identity,
    setup(options = {}) {
      const { request, ...rest } = setup(options)
      return {
        ...rest,
        request: internal.wrapRequest(request, {
          methods: rest.methods,
          retryCount: rest.retryCount,
          retryDelay: rest.retryDelay,
          uid: uid(),
        }),
      } as Instance<from.Properties<instance>>
    },
  } as Transport<type, from.Properties<instance>>
}

export declare namespace from {
  /** Base instance shape a `setup` must return (with a raw `request`). */
  type Instance = InstanceOptions & {
    request: RawRequestFn
  }

  /** Extra fields beyond the base {@link Instance} become `properties`. */
  type Properties<instance extends Instance> = Prettify<
    Omit<instance, keyof Instance>
  >

  type Parameters<type extends string, instance extends Instance> = Omit<
    Transport<type>,
    'setup'
  > & {
    setup: (options: SetupOptions) => instance
  }
}

/** Thrown when a transport has no URL and the chain provides no default. */
export class UrlRequiredError extends Errors.BaseError {
  override readonly name = 'Transport.UrlRequiredError'

  constructor() {
    super('No URL was provided to the Transport.', {
      metaMessages: [
        'Set a URL on the Transport, or pass a `chain` with a default RPC URL.',
      ],
    })
  }
}
