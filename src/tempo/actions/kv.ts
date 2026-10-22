import * as Gateway from '../Gateway.js'

/**
 * Entry in a Gateway key-value store.
 *
 * @experimental
 */
export type Entry = {
  /** Expiry as a Unix timestamp in milliseconds, or `null` without a TTL. */
  expiresAt: number | null
  /** Key. */
  key: string
  /** JSON value. Validate it before use. */
  value: unknown
  /** Version, incremented on every write. */
  version: number
}

/**
 * Deletes a key from the app's key-value store. Paid per request.
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
 * const { deleted } = await Actions.kv.delete(gateway, { key: 'counter' })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns Whether the key existed.
 */
// biome-ignore lint/correctness/noUnusedVariables: exported as delete
async function delete_(
  gateway: Gateway.Gateway,
  parameters: delete_.Parameters,
): Promise<delete_.ReturnValue> {
  const { key, signal } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ key }),
    path: '/kv/delete',
    signal,
  })
  return (await response.json()) as delete_.ReturnValue
}

declare namespace delete_ {
  type Parameters = {
    /** Key. */
    key: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnValue = {
    /** Whether the key existed. */
    deleted: boolean
  }

  type ErrorType = Gateway.request.ErrorType
}

export { delete_ as delete }

/**
 * Reads a key from the app's key-value store. Returns `null` when the key does
 * not exist or expired. Paid per request.
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
 * const entry = await Actions.kv.get(gateway, { key: 'counter' })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The entry, or `null`.
 */
export async function get(
  gateway: Gateway.Gateway,
  parameters: get.Parameters,
): Promise<get.ReturnValue> {
  const { key, signal } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ key }),
    path: '/kv/get',
    signal,
  })
  return (await response.json()) as get.ReturnValue
}

export declare namespace get {
  type Parameters = {
    /** Key. */
    key: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnValue = Entry | null

  type ErrorType = Gateway.request.ErrorType
}

/**
 * Lists entries in the app's key-value store by key prefix, in key order. Paid
 * per request.
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
 * const { cursor, entries } = await Actions.kv.list(gateway, {
 *   prefix: 'settings/',
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns A page of entries and the next cursor.
 */
export async function list(
  gateway: Gateway.Gateway,
  parameters: list.Parameters = {},
): Promise<list.ReturnValue> {
  const { cursor, limit, prefix, signal } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ cursor, limit, prefix }),
    path: '/kv/list',
    signal,
  })
  return (await response.json()) as list.ReturnValue
}

export declare namespace list {
  type Parameters = {
    /** Cursor from a previous page. */
    cursor?: string | undefined
    /** Maximum entries per page. */
    limit?: number | undefined
    /** Key prefix. */
    prefix?: string | undefined
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnValue = {
    /** Cursor of the next page, or `null` on the last page. */
    cursor: string | null
    /** Entries on this page. */
    entries: readonly Entry[]
  }

  type ErrorType = Gateway.request.ErrorType
}

/**
 * Writes a JSON value to the app's key-value store. Paid per request.
 *
 * Pass `ifVersion` to write conditionally: `null` creates the key only if it
 * does not exist, and a version replaces the value only if it is still that
 * version. A failed condition throws `Gateway.VersionConflictError`.
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
 * const entry = await Actions.kv.set(gateway, {
 *   ifVersion: null,
 *   key: 'counter',
 *   value: { count: 1 },
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The written entry.
 */
export async function set(
  gateway: Gateway.Gateway,
  parameters: set.Parameters,
): Promise<set.ReturnValue> {
  const { ifVersion, key, signal, ttl, value } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ ifVersion, key, ttl, value }),
    path: '/kv/set',
    signal,
  })
  return (await response.json()) as set.ReturnValue
}

export declare namespace set {
  type Parameters = {
    /**
     * Write condition: `null` creates the key only if it does not exist; a
     * version replaces the value only if it is still that version.
     */
    ifVersion?: number | null | undefined
    /** Key. */
    key: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
    /** Time to live in seconds. Without it, the entry does not expire. */
    ttl?: number | undefined
    /** JSON-serializable value. */
    value: unknown
  }

  type ReturnValue = Entry

  type ErrorType = Gateway.request.ErrorType
}
