import * as Gateway from '../../Gateway.js'

/**
 * Reads an object from the app's bucket as a stream. Returns `null` when the
 * object does not exist or expired. Paid per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * const object = await Actions.bucket.get(gateway, { key: 'notes/today.txt' })
 * const text = object ? await new Response(object.body).text() : null
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The object body and metadata, or `null`.
 */
export async function get(
  gateway: Gateway.Gateway,
  options: get.Options,
): Promise<get.ReturnType> {
  const { key, signal } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ key }),
    path: '/bucket/get',
    signal,
  }).catch((error) => {
    if (error instanceof Gateway.RequestError && error.code === 'not_found')
      return null
    throw error
  })
  if (!response?.body) return null

  const { headers } = response
  return {
    body: response.body,
    contentType: headers.get('content-type'),
    etag: headers.get('etag'),
    expiresAt: Number(headers.get('gateway-expires-at')),
    key,
  }
}

export declare namespace get {
  type Options = {
    /** Object key. */
    key: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnType = {
    /** Object bytes. */
    body: ReadableStream<Uint8Array>
    /** Content type. */
    contentType: string | null
    /** Entity tag. */
    etag: string | null
    /** Expiry as a Unix timestamp in milliseconds. */
    expiresAt: number
    /** Object key. */
    key: string
  } | null

  type ErrorType = Gateway.request.ErrorType
}
