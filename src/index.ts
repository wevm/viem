/** @entrypointCategory Core */
// biome-ignore lint/complexity/noUselessEmptyExport: tsdoc
export type {}

/**
 * Utilities for instantiating Clients.
 *
 * @example
 * ### Instantiating a Client
 *
 * ```ts twoslash
 * import { Client } from 'viem'
 *
 * const client = Client.from({
 *   chain: 'TODO',
 *   transport: 'TODO',
 * })
 * ```
 *
 * @category General
 */
export * as Client from './core/Client.js'
