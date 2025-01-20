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

export * as Caches from './core/Caches.js'

/**
 * Utilities for instantiating Transports.
 *
 * @example
 * ### Instantiating a HTTP Transport
 *
 * ```ts twoslash
 * import { Transport } from 'viem'
 *
 * const transport = Transport.http('http://cloudflare-eth.com')
 * ```
 *
 * @category General
 */
export * as Transport from './core/Transport.js'
