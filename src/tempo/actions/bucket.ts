import * as Gateway from '../Gateway.js'

/**
 * Metadata of an object in a Gateway bucket.
 *
 * @experimental
 */
export type Metadata = {
  /** Content type. */
  contentType: string | null
  /** Entity tag. */
  etag: string
  /** Expiry as a Unix timestamp in milliseconds. */
  expiresAt: number
  /** Object key. */
  key: string
  /** Size in bytes. */
  size: number
  /** Upload time as a Unix timestamp in milliseconds. */
  uploadedAt: number
}

/**
 * Deletes an object from the app's bucket. Paid per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({
 *   app: 'my-app',
 *   fetch: mppx.fetch,
 *   url: 'https://gateway.example.com',
 * })
 *
 * await Actions.bucket.delete(gateway, { key: 'notes/today.txt' })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns Whether the request succeeded.
 */
// biome-ignore lint/correctness/noUnusedVariables: exported as delete
async function delete_(
  gateway: Gateway.Gateway,
  parameters: delete_.Parameters,
): Promise<delete_.ReturnValue> {
  const { key, signal } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ key }),
    path: '/bucket/delete',
    signal,
  })
  return (await response.json()) as delete_.ReturnValue
}

declare namespace delete_ {
  type Parameters = {
    /** Object key. */
    key: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnValue = {
    /** Whether the request succeeded. */
    deleted: boolean
  }

  type ErrorType = Gateway.request.ErrorType
}

export { delete_ as delete }

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
 * const gateway = Gateway.from({
 *   app: 'my-app',
 *   fetch: mppx.fetch,
 *   url: 'https://gateway.example.com',
 * })
 *
 * const object = await Actions.bucket.get(gateway, { key: 'notes/today.txt' })
 * const text = object ? await new Response(object.body).text() : null
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The object body and metadata, or `null`.
 */
export async function get(
  gateway: Gateway.Gateway,
  parameters: get.Parameters,
): Promise<get.ReturnValue> {
  const { key, signal } = parameters
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
  type Parameters = {
    /** Object key. */
    key: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnValue = {
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

/**
 * Reads the metadata of an object in the app's bucket. Returns `null` when the
 * object does not exist or expired. Paid per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({
 *   app: 'my-app',
 *   fetch: mppx.fetch,
 *   url: 'https://gateway.example.com',
 * })
 *
 * const metadata = await Actions.bucket.head(gateway, { key: 'notes/today.txt' })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The object metadata, or `null`.
 */
export async function head(
  gateway: Gateway.Gateway,
  parameters: head.Parameters,
): Promise<head.ReturnValue> {
  const { key, signal } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ key }),
    path: '/bucket/head',
    signal,
  })
  return (await response.json()) as head.ReturnValue
}

export declare namespace head {
  type Parameters = {
    /** Object key. */
    key: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnValue = Metadata | null

  type ErrorType = Gateway.request.ErrorType
}

/**
 * Lists objects in the app's bucket by key prefix. Paid per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({
 *   app: 'my-app',
 *   fetch: mppx.fetch,
 *   url: 'https://gateway.example.com',
 * })
 *
 * const { cursor, objects } = await Actions.bucket.list(gateway, {
 *   prefix: 'notes/',
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns A page of object metadata and the next cursor.
 */
export async function list(
  gateway: Gateway.Gateway,
  parameters: list.Parameters = {},
): Promise<list.ReturnValue> {
  const { cursor, limit, prefix, signal } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ cursor, limit, prefix }),
    path: '/bucket/list',
    signal,
  })
  return (await response.json()) as list.ReturnValue
}

export declare namespace list {
  type Parameters = {
    /** Cursor from a previous page. */
    cursor?: string | undefined
    /** Maximum objects per page. */
    limit?: number | undefined
    /** Key prefix. */
    prefix?: string | undefined
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnValue = {
    /** Cursor of the next page, or `null` on the last page. */
    cursor: string | null
    /** Objects on this page. */
    objects: readonly Metadata[]
  }

  type ErrorType = Gateway.request.ErrorType
}

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
 * const gateway = Gateway.from({
 *   app: 'my-app',
 *   fetch: mppx.fetch,
 *   url: 'https://gateway.example.com',
 * })
 *
 * const metadata = await Actions.bucket.put(gateway, {
 *   key: 'notes/today.txt',
 *   retention: 86_400,
 *   value: new Blob(['hello'], { type: 'text/plain' }),
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The object metadata.
 */
export async function put(
  gateway: Gateway.Gateway,
  parameters: put.Parameters,
): Promise<put.ReturnValue> {
  const { key, retention, signal, value } = parameters
  const body =
    typeof value === 'string' ? new TextEncoder().encode(value) : value
  const size = body instanceof Blob ? body.size : body.byteLength
  const contentType =
    parameters.contentType ??
    (typeof value === 'string' ? 'text/plain;charset=utf-8' : undefined) ??
    (value instanceof Blob && value.type ? value.type : undefined) ??
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
  return (await response.json()) as put.ReturnValue
}

export declare namespace put {
  type Parameters = {
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

  type ReturnValue = Metadata

  type ErrorType = Gateway.request.ErrorType
}
