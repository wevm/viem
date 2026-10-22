import type { Account } from '../accounts/types.js'
import type { Client } from '../clients/createClient.js'
import type { Transport } from '../clients/transports/createTransport.js'
import type { Chain } from '../types/chain.js'
import * as aiActions from './actions/ai.js'
import * as bucketActions from './actions/bucket.js'
import * as kvActions from './actions/kv.js'
import * as Gateway from './Gateway.js'

/**
 * Gateway actions added to a Client by {@link decorator}.
 *
 * @experimental
 */
export type Decorator = {
  /** Inference. */
  ai: {
    /**
     * Embeds text with a Gateway model. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Mppx, tempo } from 'mppx/client'
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const mppx = Mppx.create({ methods: [tempo({ account })], polyfill: false })
     * const client = createClient({ account }).extend(
     *   gatewayActions({
     *     app: 'my-app',
     *     fetch: mppx.fetch,
     *     url: 'https://gateway.example.com',
     *   }),
     * )
     *
     * const { embeddings } = await client.ai.embed({
     *   input: ['hello world'],
     *   model: '@cf/baai/bge-base-en-v1.5',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The embeddings and their shape.
     */
    embed: (
      parameters: aiActions.embed.Parameters,
    ) => Promise<aiActions.embed.ReturnValue>
    /**
     * Generates text with a Gateway model. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Mppx, tempo } from 'mppx/client'
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const mppx = Mppx.create({ methods: [tempo({ account })], polyfill: false })
     * const client = createClient({ account }).extend(
     *   gatewayActions({
     *     app: 'my-app',
     *     fetch: mppx.fetch,
     *     url: 'https://gateway.example.com',
     *   }),
     * )
     *
     * const { text } = await client.ai.generateText({
     *   model: '@cf/meta/llama-3.1-8b-instruct',
     *   prompt: 'Describe this app in one sentence.',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The generated text and token usage.
     */
    generateText: (
      parameters: aiActions.generateText.Parameters,
    ) => Promise<aiActions.generateText.ReturnValue>
  }
  /** Object storage, private to the payer and app. */
  bucket: {
    /**
     * Deletes an object from the app's bucket. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Mppx, tempo } from 'mppx/client'
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const mppx = Mppx.create({ methods: [tempo({ account })], polyfill: false })
     * const client = createClient({ account }).extend(
     *   gatewayActions({
     *     app: 'my-app',
     *     fetch: mppx.fetch,
     *     url: 'https://gateway.example.com',
     *   }),
     * )
     *
     * await client.bucket.delete({ key: 'notes/today.txt' })
     * ```
     *
     * @param parameters - Parameters.
     * @returns Whether the request succeeded.
     */
    delete: (
      parameters: bucketActions.delete.Parameters,
    ) => Promise<bucketActions.delete.ReturnValue>
    /**
     * Reads an object from the app's bucket as a stream. Returns `null` when the
     * object does not exist or expired. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Mppx, tempo } from 'mppx/client'
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const mppx = Mppx.create({ methods: [tempo({ account })], polyfill: false })
     * const client = createClient({ account }).extend(
     *   gatewayActions({
     *     app: 'my-app',
     *     fetch: mppx.fetch,
     *     url: 'https://gateway.example.com',
     *   }),
     * )
     *
     * const object = await client.bucket.get({ key: 'notes/today.txt' })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The object body and metadata, or `null`.
     */
    get: (
      parameters: bucketActions.get.Parameters,
    ) => Promise<bucketActions.get.ReturnValue>
    /**
     * Reads the metadata of an object in the app's bucket. Returns `null` when
     * the object does not exist or expired. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Mppx, tempo } from 'mppx/client'
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const mppx = Mppx.create({ methods: [tempo({ account })], polyfill: false })
     * const client = createClient({ account }).extend(
     *   gatewayActions({
     *     app: 'my-app',
     *     fetch: mppx.fetch,
     *     url: 'https://gateway.example.com',
     *   }),
     * )
     *
     * const metadata = await client.bucket.head({ key: 'notes/today.txt' })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The object metadata, or `null`.
     */
    head: (
      parameters: bucketActions.head.Parameters,
    ) => Promise<bucketActions.head.ReturnValue>
    /**
     * Lists objects in the app's bucket by key prefix. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Mppx, tempo } from 'mppx/client'
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const mppx = Mppx.create({ methods: [tempo({ account })], polyfill: false })
     * const client = createClient({ account }).extend(
     *   gatewayActions({
     *     app: 'my-app',
     *     fetch: mppx.fetch,
     *     url: 'https://gateway.example.com',
     *   }),
     * )
     *
     * const { objects } = await client.bucket.list({ prefix: 'notes/' })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A page of object metadata and the next cursor.
     */
    list: (
      parameters?: bucketActions.list.Parameters,
    ) => Promise<bucketActions.list.ReturnValue>
    /**
     * Writes an object to the app's bucket for a retention period. Paid per
     * request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Mppx, tempo } from 'mppx/client'
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const mppx = Mppx.create({ methods: [tempo({ account })], polyfill: false })
     * const client = createClient({ account }).extend(
     *   gatewayActions({
     *     app: 'my-app',
     *     fetch: mppx.fetch,
     *     url: 'https://gateway.example.com',
     *   }),
     * )
     *
     * const metadata = await client.bucket.put({
     *   key: 'notes/today.txt',
     *   retention: 86_400,
     *   value: new Blob(['hello'], { type: 'text/plain' }),
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The object metadata.
     */
    put: (
      parameters: bucketActions.put.Parameters,
    ) => Promise<bucketActions.put.ReturnValue>
  }
  /** Key-value state, private to the payer and app. */
  kv: {
    /**
     * Deletes a key from the app's key-value store. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Mppx, tempo } from 'mppx/client'
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const mppx = Mppx.create({ methods: [tempo({ account })], polyfill: false })
     * const client = createClient({ account }).extend(
     *   gatewayActions({
     *     app: 'my-app',
     *     fetch: mppx.fetch,
     *     url: 'https://gateway.example.com',
     *   }),
     * )
     *
     * const { deleted } = await client.kv.delete({ key: 'counter' })
     * ```
     *
     * @param parameters - Parameters.
     * @returns Whether the key existed.
     */
    delete: (
      parameters: kvActions.delete.Parameters,
    ) => Promise<kvActions.delete.ReturnValue>
    /**
     * Reads a key from the app's key-value store. Returns `null` when the key
     * does not exist or expired. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Mppx, tempo } from 'mppx/client'
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const mppx = Mppx.create({ methods: [tempo({ account })], polyfill: false })
     * const client = createClient({ account }).extend(
     *   gatewayActions({
     *     app: 'my-app',
     *     fetch: mppx.fetch,
     *     url: 'https://gateway.example.com',
     *   }),
     * )
     *
     * const entry = await client.kv.get({ key: 'counter' })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The entry, or `null`.
     */
    get: (
      parameters: kvActions.get.Parameters,
    ) => Promise<kvActions.get.ReturnValue>
    /**
     * Lists entries in the app's key-value store by key prefix, in key order.
     * Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Mppx, tempo } from 'mppx/client'
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const mppx = Mppx.create({ methods: [tempo({ account })], polyfill: false })
     * const client = createClient({ account }).extend(
     *   gatewayActions({
     *     app: 'my-app',
     *     fetch: mppx.fetch,
     *     url: 'https://gateway.example.com',
     *   }),
     * )
     *
     * const { entries } = await client.kv.list({ prefix: 'settings/' })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A page of entries and the next cursor.
     */
    list: (
      parameters?: kvActions.list.Parameters,
    ) => Promise<kvActions.list.ReturnValue>
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
     * import { Mppx, tempo } from 'mppx/client'
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const mppx = Mppx.create({ methods: [tempo({ account })], polyfill: false })
     * const client = createClient({ account }).extend(
     *   gatewayActions({
     *     app: 'my-app',
     *     fetch: mppx.fetch,
     *     url: 'https://gateway.example.com',
     *   }),
     * )
     *
     * const entry = await client.kv.set({
     *   ifVersion: null,
     *   key: 'counter',
     *   value: { count: 1 },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The written entry.
     */
    set: (
      parameters: kvActions.set.Parameters,
    ) => Promise<kvActions.set.ReturnValue>
  }
}

/**
 * Adds Gateway inference (`client.ai`), object storage (`client.bucket`), and
 * key-value state (`client.kv`) to a Client.
 *
 * Viem does not pay for requests: pass a payment-aware `fetch`, such as
 * `mppx`'s client fetch. Data is scoped by chain, the paying wallet, and `app`.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Mppx, tempo } from 'mppx/client'
 * import { createClient, gatewayActions } from 'viem/tempo'
 *
 * const mppx = Mppx.create({ methods: [tempo({ account })], polyfill: false })
 * const client = createClient({ account }).extend(
 *   gatewayActions({
 *     app: 'my-app',
 *     fetch: mppx.fetch,
 *     url: 'https://gateway.example.com',
 *   }),
 * )
 *
 * const { text } = await client.ai.generateText({
 *   model: '@cf/meta/llama-3.1-8b-instruct',
 *   prompt: 'Describe this app in one sentence.',
 * })
 * await client.kv.set({ key: 'description', value: text })
 * ```
 *
 * @param options - Gateway connection options.
 * @returns A Client decorator.
 */
export function decorator(options: decorator.Options) {
  const gateway = Gateway.from(options)
  return <
    transport extends Transport,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    _client: Client<transport, chain, account>,
  ): Decorator => ({
    ai: {
      embed: (parameters) => aiActions.embed(gateway, parameters),
      generateText: (parameters) => aiActions.generateText(gateway, parameters),
    },
    bucket: {
      delete: (parameters) => bucketActions.delete(gateway, parameters),
      get: (parameters) => bucketActions.get(gateway, parameters),
      head: (parameters) => bucketActions.head(gateway, parameters),
      list: (parameters) => bucketActions.list(gateway, parameters),
      put: (parameters) => bucketActions.put(gateway, parameters),
    },
    kv: {
      delete: (parameters) => kvActions.delete(gateway, parameters),
      get: (parameters) => kvActions.get(gateway, parameters),
      list: (parameters) => kvActions.list(gateway, parameters),
      set: (parameters) => kvActions.set(gateway, parameters),
    },
  })
}

export declare namespace decorator {
  type Options = Gateway.from.Options
}
