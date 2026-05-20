import * as Transport from '../Transport.js'

/**
 * Creates a Custom Provider Transport from an EIP-1193 Provider.
 *
 * @example
 * ```ts twoslash
 * import { custom } from 'viem'
 *
 * const provider = {
 *   request: async ({ method }: { method: string }) => method
 * }
 * const transport = custom(provider)
 *
 * const client = transport({})
 * const blockNumber = await client.request({
 *   method: 'eth_blockNumber'
 * })
 * // @log: 'eth_blockNumber'
 * ```
 *
 * @param provider - EIP-1193 Provider to use for JSON-RPC requests.
 * @param options - Transport options.
 * @returns Custom Provider Transport.
 */
export function custom<provider extends custom.Provider>(
  provider: provider,
  options: custom.Options = {},
): custom.Transport {
  const {
    key = 'custom',
    methods,
    name = 'Custom Provider',
    retryDelay,
  } = options
  return ({ retryCount: retryCount_ }) =>
    Transport.create({
      key,
      methods,
      name,
      request: provider.request.bind(provider) as Transport.AnyRequestFn,
      retryCount: options.retryCount ?? retryCount_,
      retryDelay,
      type: 'custom',
    })
}

export declare namespace custom {
  /** EIP-1193 Provider. */
  type Provider = {
    request(args: {
      method: string
      params?: unknown | undefined
    }): Promise<unknown>
  }

  /** Options for a Custom Provider Transport. */
  type Options = {
    /** Transport key. */
    key?: string | undefined
    /** Methods to include or exclude from this Transport. */
    methods?: Transport.Methods | undefined
    /** Transport display name. */
    name?: string | undefined
    /** Retry count. */
    retryCount?: number | undefined
    /** Retry delay in milliseconds. */
    retryDelay?: number | undefined
  }

  /** Custom Provider Transport. */
  type Transport = Transport.Transport<'custom', {}, Provider['request']>
}
