import { type Address, Value } from 'ox'

import * as Errors from '../core/Errors.js'

/**
 * Free discovery document of a Gateway.
 *
 * @experimental
 */
export type Capabilities = {
  /** Chain the Gateway accepts payments on. */
  chainId: number
  /** Sandboxed compute. */
  compute: {
    /** Whether this Gateway offers compute. */
    available: boolean
    /** Price per CPU core-second in currency units. */
    cpuPerSecond: number
    /** Defaults of `compute.create`. */
    defaults: {
      /** CPU cores. */
      cpu: number
      /** Container image. */
      image: string
      /** Memory in MiB. */
      memory: number
      /** Seconds the sandbox may live. */
      timeout: number
    }
    /** Price per GPU-second in currency units, by GPU type. */
    gpusPerSecond: Record<string, number>
    /** Price per GiB-second of memory in currency units. */
    memoryGiBPerSecond: number
  }
  /** Payment currencies by name. */
  currencies: Record<string, Address.Address>
  /** Request and storage limits. */
  limits: {
    /** Maximum CPU cores per sandbox. */
    cpu: number
    /** Maximum `compute.exec` timeout in seconds. */
    execSeconds: number
    /** Maximum GPUs per sandbox. */
    gpuCount: number
    /** Maximum key size in bytes. */
    keyBytes: number
    /** Maximum page size of `list` actions. */
    listLimit: number
    /** Maximum `maxOutputTokens` of `ai.generateText`. */
    maxOutputTokens: number
    /** Maximum sandbox memory in MiB. */
    memory: number
    /** Maximum object size in bytes. */
    objectBytes: number
    /** Maximum retention or TTL in seconds. */
    retentionSeconds: number
    /** Maximum sandbox lifetime in seconds. */
    sandboxSeconds: number
    /** Maximum `compute.stream` timeout in seconds. */
    streamSeconds: number
    /** Maximum serialized key-value size in bytes. */
    valueBytes: number
  }
  /** Operations priced per token instead of per request. */
  metered: readonly string[]
  /** Supported models by operation. */
  models: {
    /** Embedding models. */
    embed: readonly string[]
    /** Text generation models. */
    generate: readonly string[]
  }
  /**
   * Price of each operation in human-readable currency units. Metered
   * operations list their minimum.
   */
  prices: Record<string, string>
  /** Payment recipient. */
  recipient: Address.Address
  /**
   * Price of metered AI operations per million tokens, by model. A request
   * reserves the most it can cost and the unused part is refunded.
   */
  tokens: Record<string, { input: number; output: number }>
  /** Pricing version. */
  version: string
}

/**
 * Fetch function, such as `globalThis.fetch` or `mppx`'s payment-aware fetch.
 *
 * @experimental
 */
export type Fetch = (input: string, init: RequestInit) => Promise<Response>

/**
 * Connection to a Tempo Gateway: the service URL, the app namespace, and the
 * payment-aware `fetch` that pays for each request.
 *
 * @experimental
 */
export type Gateway = {
  /** App namespace sent as `Gateway-App`. Data is scoped by chain, payer, and app. */
  app: string
  /** Fetch function used for every request. */
  fetch: Fetch
  /** Gateway origin, without the `/v1` version path. */
  url: string
}

const defaultUrl = 'https://gateway.tempo-dev.workers.dev'

/**
 * Creates a {@link Gateway} connection.
 *
 * Viem does not pay for requests: pass a payment-aware `fetch`, such as
 * `mppx`'s client fetch, to pay for each operation. A plain `fetch` reaches
 * only the free routes; paid routes throw {@link PaymentRequiredError}.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 * ```
 *
 * @param options - Options.
 * @returns The Gateway connection.
 */
export function from(options: from.Options = {}): Gateway {
  const { app = 'default', url = defaultUrl } = options
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(app)) throw new InvalidAppError({ app })
  return {
    app,
    fetch: options.fetch ?? ((input, init) => globalThis.fetch(input, init)),
    url: trimSlashes(url),
  }
}

export declare namespace from {
  type Options = {
    /**
     * App namespace. Must match `[a-z0-9][a-z0-9-]{0,62}`.
     *
     * @default 'default'
     */
    app?: string | undefined
    /**
     * Fetch function used for every request. Pass a payment-aware fetch to pay
     * for operations.
     *
     * @default globalThis.fetch
     */
    fetch?: Fetch | undefined
    /**
     * Gateway origin, without the `/v1` version path.
     *
     * @default 'https://gateway.tempo-dev.workers.dev'
     */
    url?: string | undefined
  }

  type ErrorType = InvalidAppError
}

/**
 * Reads the free discovery document of a Gateway: chain, currencies, prices,
 * limits, and models.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from()
 * const capabilities = await Gateway.getCapabilities(gateway)
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The Gateway capabilities.
 */
export async function getCapabilities(
  gateway: Gateway,
  options: getCapabilities.Options = {},
): Promise<Capabilities> {
  const response = await request(gateway, {
    method: 'GET',
    path: '/capabilities',
    signal: options.signal,
  })
  return (await response.json()) as Capabilities
}

export declare namespace getCapabilities {
  type Options = {
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ErrorType = request.ErrorType
}

/**
 * Sends a request to a Gateway route under `/v1` and returns the successful
 * response. Problem responses throw a {@link RequestError}.
 *
 * Prefer the typed `ai`, `bucket`, `compute`, and `kv` actions.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from()
 * const response = await Gateway.request(gateway, {
 *   body: JSON.stringify({ key: 'greeting' }),
 *   path: '/kv/get',
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The successful response.
 */
export async function request(
  gateway: Gateway,
  options: request.Options,
): Promise<Response> {
  const { body, method = 'POST', path, signal } = options
  const url = `${gateway.url}/v1${path}`
  const headers = new Headers(options.headers)
  if (!headers.has('gateway-app')) headers.set('gateway-app', gateway.app)
  if (typeof body === 'string' && !headers.has('content-type'))
    headers.set('content-type', 'application/json')
  const response = await gateway.fetch(url, {
    method,
    headers,
    ...(body !== undefined ? { body } : {}),
    ...(signal ? { signal } : {}),
  })
  if (response.ok) return response

  const text = await response.text().catch(() => '')
  const problem = (() => {
    try {
      return JSON.parse(text) as { code?: unknown; detail?: unknown }
    } catch {
      return {}
    }
  })()
  const parameters = {
    code: (() => {
      if (typeof problem.code === 'string') return problem.code
      if (response.status === 402) return 'payment_required'
      return 'unknown'
    })(),
    detail: typeof problem.detail === 'string' ? problem.detail : text,
    status: response.status,
    url,
  }
  if (response.status === 402) throw new PaymentRequiredError(parameters)
  if (parameters.code === 'version_conflict')
    throw new VersionConflictError(parameters)
  throw new RequestError(parameters)
}

export declare namespace request {
  type Options = {
    /** Request body. */
    body?: BodyInit | undefined
    /** Extra request headers. */
    headers?: Record<string, string> | undefined
    /**
     * HTTP method.
     *
     * @default 'POST'
     */
    method?: 'GET' | 'POST' | undefined
    /** Route under `/v1`, such as `/kv/get`. */
    path: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ErrorType = PaymentRequiredError | RequestError | VersionConflictError
}

function trimSlashes(url: string) {
  let end = url.length
  while (end > 0 && url[end - 1] === '/') end--
  return url.slice(0, end)
}

/**
 * Thrown when a Client with an account pays the Gateway on a different chain
 * than the one the Gateway asks for payment on.
 *
 * @experimental
 */
export class ChainMismatchError extends Errors.BaseError {
  override readonly name = 'Gateway.ChainMismatchError'

  constructor(options: { chainId: number; expected: number }) {
    const { chainId, expected } = options
    super(
      `The Gateway asks for payment on chain ${chainId}, but the Client is on chain ${expected}.`,
      {
        metaMessages: [
          'Create the Client on the chain the Gateway is paid on (see `getCapabilities().chainId`).',
        ],
      },
    )
  }
}

/**
 * Thrown when the Client's account holds too little of the Gateway's
 * currencies to pay for a request.
 *
 * @experimental
 */
export class InsufficientFundsError extends Errors.BaseError<
  Error | undefined
> {
  override readonly name = 'Gateway.InsufficientFundsError'

  /** The paying account. */
  address: Address.Address
  /** The account's balance of each Gateway currency, in base units. */
  balances: InsufficientFundsError.Options['balances']

  constructor(options: InsufficientFundsError.Options) {
    const { address, balances, cause } = options
    const held = balances
      .map(({ amount, symbol }) => `${Value.format(amount, 6)} ${symbol}`)
      .join(' and ')
    super(
      `The account ${address} can't pay the Gateway${held ? `: it holds ${held}` : ''}.`,
      {
        cause,
        metaMessages: [
          'Fund it with OUSD (send it from any wallet), or with MACH through Tempo Wallet (`wallet.deposit`). MACH cannot be transferred to a new address.',
        ],
      },
    )
    this.address = address
    this.balances = balances
  }
}

export declare namespace InsufficientFundsError {
  type Options = {
    /** The paying account. */
    address: Address.Address
    /** The account's balance of each Gateway currency, in base units. */
    balances: readonly {
      amount: bigint
      currency: Address.Address
      symbol: string
    }[]
    /** The payment failure, when a payment was attempted. */
    cause?: Error | undefined
  }
}

/**
 * Thrown when an app namespace does not match `[a-z0-9][a-z0-9-]{0,62}`.
 *
 * @experimental
 */
export class InvalidAppError extends Errors.BaseError {
  override readonly name = 'Gateway.InvalidAppError'

  constructor(options: { app: string }) {
    super(`App "${options.app}" is not a valid Gateway app namespace.`, {
      metaMessages: ['Use 1 to 63 lowercase letters, digits, or hyphens.'],
    })
  }
}

/**
 * Thrown when a Client with a local account pays the Gateway but `mppx` is
 * not installed.
 *
 * @experimental
 */
export class MppxNotInstalledError extends Errors.BaseError<Error | undefined> {
  override readonly name = 'Gateway.MppxNotInstalledError'

  constructor(options: { cause?: Error | undefined } = {}) {
    super('mppx is required to pay the Gateway with the Client account.', {
      cause: options.cause,
      metaMessages: [
        'Install it (`npm i mppx`), or pass a payment-aware `fetch` to `gatewayActions`.',
      ],
    })
  }
}

/**
 * Thrown when a Gateway responds with a problem.
 *
 * @experimental
 */
export class RequestError extends Errors.BaseError {
  override name = 'Gateway.RequestError'

  /** Stable problem code, such as `not_found` or `invalid_request`. */
  code: string
  /** Problem detail. */
  detail: string
  /** HTTP status. */
  status: number
  /** Request URL. */
  url: string

  constructor(
    parameters: RequestError.Parameters,
    options: RequestError.Options = {},
  ) {
    const { code, detail, status, url } = parameters
    super(options.shortMessage ?? 'Gateway request failed.', {
      details: detail,
      metaMessages: [`Code: ${code}`, `Status: ${status}`, `URL: ${url}`],
    })
    if (options.name) this.name = options.name
    this.code = code
    this.detail = detail
    this.status = status
    this.url = url
  }
}

export declare namespace RequestError {
  type Parameters = {
    /** Stable problem code. */
    code: string
    /** Problem detail. */
    detail: string
    /** HTTP status. */
    status: number
    /** Request URL. */
    url: string
  }

  type Options = {
    /** Error name. */
    name?: string | undefined
    /** Short message. */
    shortMessage?: string | undefined
  }
}

/**
 * Thrown when a Gateway asks for payment that the supplied `fetch` did not
 * provide. Pass a payment-aware `fetch` to {@link from}.
 *
 * @experimental
 */
export class PaymentRequiredError extends RequestError {
  constructor(parameters: RequestError.Parameters) {
    super(parameters, {
      name: 'Gateway.PaymentRequiredError',
      shortMessage:
        'Gateway requires payment. Give the Client a local account (with mppx installed), or pass a payment-aware fetch to `gatewayActions`.',
    })
  }
}

/**
 * Thrown when `kv.set` with `ifVersion` does not match the stored version.
 *
 * @experimental
 */
export class VersionConflictError extends RequestError {
  constructor(parameters: RequestError.Parameters) {
    super(parameters, {
      name: 'Gateway.VersionConflictError',
      shortMessage: 'Stored version does not match ifVersion.',
    })
  }
}
