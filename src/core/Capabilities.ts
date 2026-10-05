import type { Compute } from './internal/types.js'

/**
 * Registry slot for capability schemas. Augment via declaration merging to type
 * the capabilities exchanged for a specific RPC method, keyed by method name
 * with a `Request` and/or `ReturnType` entry.
 *
 * @example
 * ```ts
 * declare module 'viem' {
 *   namespace Capabilities {
 *     interface Register {
 *       Schema: {
 *         fillTransaction: {
 *           ReturnType: {
 *             paymasterService?: { sponsored: boolean } | undefined
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 */
export interface Register {}

/** The resolved capability schema (the {@link Register} `Schema` slot, if set). */
export type Schema = Register extends {
  Schema: infer schema extends Record<string, unknown>
}
  ? schema
  : {}

/**
 * An open, extensible capabilities bag. Known capabilities (supplied via
 * `capabilities`) are typed; unknown keys remain accessible as `unknown`.
 */
export type Capabilities<capabilities extends Record<string, unknown> = {}> =
  Compute<{ [key: string]: unknown } & capabilities>

/**
 * Extracts the capabilities type for a given `method` and direction (`Request`
 * or `ReturnType`) from the resolved {@link Schema}, falling back to the open
 * {@link Capabilities} bag when the method (or direction) is not registered.
 */
export type Extract<
  method extends string,
  key extends 'Request' | 'ReturnType',
> = method extends keyof Schema
  ? Schema[method] extends {
      [k in key]: infer value extends Record<string, unknown>
    }
    ? Capabilities<value>
    : Capabilities
  : Capabilities
