import * as Transport from '../Transport.js'

/** Creates an EIP-1193 provider transport. */
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
  type Provider = {
    request(args: {
      method: string
      params?: unknown | undefined
    }): Promise<unknown>
  }

  type Options = {
    key?: string | undefined
    methods?: Transport.Methods | undefined
    name?: string | undefined
    retryCount?: number | undefined
    retryDelay?: number | undefined
  }

  type Transport = Transport.Transport<'custom', {}, Provider['request']>
}
