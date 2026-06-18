import type * as Chain from './Chain.js'
import * as Errors from './Errors.js'
import * as internal from './internal/transport.js'
import type { Prettify } from './internal/types.js'
import { uid } from './internal/uid.js'

export { HttpError, TimeoutError } from './RpcClient.js'
export { http } from './transports/http.js'

/** Raw (pre-wrap) rpc request function returned by a transport's `setup`. */
type RawRequestFn = (
  args: { method: string; params?: unknown },
  options?: { signal?: AbortSignal | undefined } | undefined,
) => Promise<unknown>

/**
 * A Transport: a static identity (`key`/`name`/`type`) plus a `setup` the
 * {@link Client} calls with its context to produce a live instance.
 */
export type Transport<type extends string = string, properties = {}> = {
  key: string
  name: string
  type: type
  setup: (options: Transport.SetupOptions) => Transport.Instance<properties>
}

export declare namespace Transport {
  type SetupOptions = {
    /** Chain the transport connects through (supplied by the client). */
    chain?: Chain.Chain | undefined
    /** Client polling interval (ms). */
    pollingInterval?: number | undefined
    /** Max retries per request. */
    retryCount?: number | undefined
    /** Request timeout (ms). */
    timeout?: number | undefined
  }

  type Instance<properties = {}> = Prettify<
    {
      /** RPC methods to include or exclude. */
      methods?: { include?: string[] } | { exclude?: string[] } | undefined
      /** Max retries per request. @default 3 */
      retryCount?: number | undefined
      /** Base delay (ms) between retries. @default 150 */
      retryDelay?: number | undefined
      /** Request timeout (ms). */
      timeout?: number | undefined
      /** The retry/dedupe-wrapped request function. */
      request: internal.RequestFn
    } & properties
  >
}

/**
 * Builds a {@link Transport} from its identity + a `setup` that produces the
 * instance. Injects the retry/dedupe wrap around the instance's `request`.
 */
export function from<
  type extends string,
  properties extends Record<string, unknown> = {},
>(parameters: from.Parameters<type, properties>): Transport<type, properties> {
  const { setup, ...identity } = parameters
  return {
    ...identity,
    setup(options) {
      const { request, ...rest } = setup(options)
      return {
        ...rest,
        request: internal.wrapRequest(request, {
          methods: rest.methods,
          retryCount: rest.retryCount,
          retryDelay: rest.retryDelay,
          uid: uid(),
        }),
      } as Transport.Instance<properties>
    },
  }
}

export declare namespace from {
  type Parameters<
    type extends string,
    properties extends Record<string, unknown> = {},
  > = {
    key: string
    name: string
    type: type
    setup: (options: Transport.SetupOptions) => Omit<
      Transport.Instance<properties>,
      'request'
    > & {
      request: RawRequestFn
    }
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
