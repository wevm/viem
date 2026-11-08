import * as Gateway from '../../Gateway.js'
import type { Metadata } from './types.js'

/**
 * Writes an object to the app's bucket for a retention period. Paid per
 * request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * const metadata = await Actions.bucket.put(gateway, {
 *   key: 'notes/today.txt',
 *   retention: 86_400,
 *   value: new Blob(['hello'], { type: 'text/plain' }),
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The object metadata.
 */
export async function put(
  gateway: Gateway.Gateway,
  options: put.Options,
): Promise<put.ReturnType> {
  const { key, retention, signal, value } = options
  const body =
    typeof value === 'string' ? new TextEncoder().encode(value) : value
  const size = isBlob(body) ? body.size : body.byteLength
  const contentType =
    options.contentType ??
    (typeof value === 'string' ? 'text/plain;charset=utf-8' : undefined) ??
    (isBlob(value) && value.type ? value.type : undefined) ??
    'application/octet-stream'
  const response = await Gateway.request(gateway, {
    body: body as BodyInit,
    headers: {
      'content-type': contentType,
      'gateway-key': key,
      'gateway-retention': String(retention),
      'gateway-size': String(size),
    },
    path: '/bucket/put',
    signal,
  })
  return (await response.json()) as put.ReturnType
}

export declare namespace put {
  type Options = {
    /**
     * Content type.
     *
     * @default The Blob's type, `text/plain;charset=utf-8` for strings, or `application/octet-stream`.
     */
    contentType?: string | undefined
    /** Object key. */
    key: string
    /** Retention in seconds. The object expires afterwards. */
    retention: number
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
    /** Object bytes. */
    value: Blob | Uint8Array | ArrayBuffer | string
  }

  type ReturnType = Metadata

  type ErrorType = Gateway.request.ErrorType
}

/** Detects a `Blob` without `instanceof`, so ones from another realm count. */
function isBlob(value: unknown): value is Blob {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Blob).arrayBuffer === 'function' &&
    typeof (value as Blob).size === 'number'
  )
}
