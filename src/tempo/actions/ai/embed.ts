import * as Gateway from '../../Gateway.js'

/**
 * Embeds text with a Gateway model. Paid per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * const { embeddings } = await Actions.ai.embed(gateway, {
 *   input: ['hello world'],
 *   model: '@cf/baai/bge-m3',
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The embeddings and their shape.
 */
export async function embed(
  gateway: Gateway.Gateway,
  options: embed.Options,
): Promise<embed.ReturnType> {
  const { input, model, signal } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({
      input: typeof input === 'string' ? [input] : input,
      model,
    }),
    path: '/ai/embed',
    signal,
  })
  return (await response.json()) as embed.ReturnType
}

export declare namespace embed {
  type Options = {
    /** Text or texts to embed. */
    input: string | readonly string[]
    /** Embedding model. See `Gateway.getCapabilities`. */
    model: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnType = {
    /** One embedding per input. */
    embeddings: readonly (readonly number[])[]
    /** Shape of `embeddings`. */
    shape: readonly number[]
  }

  type ErrorType = Gateway.request.ErrorType
}
