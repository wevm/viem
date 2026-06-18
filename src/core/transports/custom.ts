import * as Provider from 'ox/Provider'

import * as Transport from '../Transport.js'

/** A custom EIP-1193 {@link Transport}. */
export type Custom = Transport.Transport<'custom'>

/**
 * Creates a {@link Transport} from an EIP-1193-compatible `provider`. Provider
 * errors are normalized via ox `Provider.from`.
 */
export function custom<
  provider extends { request(...args: any): Promise<any> },
>(provider: provider, options: custom.Options = {}): Custom {
  const provider_ = Provider.from(provider)
  return Transport.from({
    key: options.key ?? 'custom',
    name: options.name ?? 'Custom Provider',
    type: 'custom',
    setup({ retryCount }) {
      return {
        methods: options.methods,
        retryCount: options.retryCount ?? retryCount,
        retryDelay: options.retryDelay,
        request: (args) => provider_.request(args),
      }
    },
  })
}

export declare namespace custom {
  type Options = {
    /** Transport key. @default 'custom' */
    key?: string | undefined
    /** RPC methods to include or exclude. */
    methods?: { include?: string[] } | { exclude?: string[] } | undefined
    /** Transport name. @default 'Custom Provider' */
    name?: string | undefined
    /** Max retries per request. @default 3 */
    retryCount?: number | undefined
    /** Base delay (ms) between retries. @default 150 */
    retryDelay?: number | undefined
  }
}
