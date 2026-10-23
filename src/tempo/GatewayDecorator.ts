import type { Account } from '../accounts/types.js'
import type { Client } from '../clients/createClient.js'
import type { Transport } from '../clients/transports/createTransport.js'
import type { Chain } from '../types/chain.js'
import * as aiActions from './actions/ai.js'
import * as bucketActions from './actions/bucket.js'
import * as computeActions from './actions/compute.js'
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
    /**
     * Generates text with a Gateway model and yields it as it is produced.
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
     * for await (const event of client.ai.streamText({
     *   model: '@cf/zai-org/glm-5.3',
     *   prompt: 'Write a haiku about Tempo.',
     * })) {
     *   if (event.type === 'text') process.stdout.write(event.delta)
     * }
     * ```
     *
     * @param parameters - Parameters.
     * @returns Text and reasoning deltas, then usage.
     */
    streamText: (
      parameters: aiActions.streamText.Parameters,
    ) => AsyncGenerator<aiActions.streamText.Event>
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
  /** Sandboxed CPU and GPU compute, private to the payer and app. */
  compute: {
    /**
     * Starts a sandbox for `timeout` seconds from a container image, with
     * optional `apt/pip` layers, or from a snapshot. Paid up front by GPU, CPU,
     * memory, and timeout. `ports` are served over public HTTPS tunnels.
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
     * const sandbox = await client.compute.create({
     *   gpu: 'T4',
     *   image: 'pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime',
     *   timeout: 1200,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The sandbox and its tunnels.
     */
    create: <const ports extends readonly number[] = readonly []>(
      parameters?: computeActions.create.Parameters<ports>,
    ) => Promise<computeActions.create.ReturnValue<ports>>
    /**
     * Runs a command in a sandbox and waits up to `timeout` seconds (at most
     * 120). Use `spawn` for longer jobs. Paid per request.
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
     * const { stdout } = await client.compute.exec({
     *   command: ['nvidia-smi'],
     *   sandboxId: sandbox.sandboxId,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The command's output and exit code.
     */
    exec: (
      parameters: computeActions.exec.Parameters,
    ) => Promise<computeActions.exec.ReturnValue>
    /**
     * Lists the app's sandboxes that have not ended. Paid per request.
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
     * const { sandboxes } = await client.compute.list()
     * ```
     *
     * @param parameters - Parameters.
     * @returns A page of sandboxes and the next cursor.
     */
    list: (
      parameters?: computeActions.list.Parameters,
    ) => Promise<computeActions.list.ReturnValue>
    /**
     * Reads a file from a sandbox from `offset`, up to 8 MiB per request. Returns
     * `null` when the file does not exist. Paid per request.
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
     * const log = await client.compute.read({
     *   path: job.logPath,
     *   sandboxId: sandbox.sandboxId,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The bytes read and the whole file size, or `null`.
     */
    read: (
      parameters: computeActions.read.Parameters,
    ) => Promise<computeActions.read.ReturnValue>
    /**
     * Saves a sandbox's filesystem as a snapshot kept for 30 days. Paid per
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
     * const { snapshot } = await client.compute.snapshot({
     *   sandboxId: sandbox.sandboxId,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The snapshot ID and its expiry.
     */
    snapshot: (
      parameters: computeActions.snapshot.Parameters,
    ) => Promise<computeActions.snapshot.ReturnValue>
    /**
     * Starts a command in the background; its output goes to `logPath` and its
     * exit code to `exitPath`. Paid per request.
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
     * const job = await client.compute.spawn({
     *   command: ['python', 'train.py'],
     *   sandboxId: sandbox.sandboxId,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The process ID and the paths of its log and exit code.
     */
    spawn: (
      parameters: computeActions.spawn.Parameters,
    ) => Promise<computeActions.spawn.ReturnValue>
    /**
     * Reads whether a sandbox is running. Paid per request.
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
     * const { status } = await client.compute.status({
     *   sandboxId: sandbox.sandboxId,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The sandbox and its status.
     */
    status: (
      parameters: computeActions.status.Parameters,
    ) => Promise<computeActions.status.ReturnValue>
    /**
     * Terminates a sandbox. Unused time is not refunded. Paid per request.
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
     * await client.compute.terminate({ sandboxId: sandbox.sandboxId })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The final status.
     */
    terminate: (
      parameters: computeActions.terminate.Parameters,
    ) => Promise<computeActions.terminate.ReturnValue>
    /**
     * Writes a file into a sandbox, up to 8 MiB. Paid per request.
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
     * await client.compute.write({
     *   path: '/root/train.py',
     *   sandboxId: sandbox.sandboxId,
     *   value: 'print("training")',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The path and size written.
     */
    write: (
      parameters: computeActions.write.Parameters,
    ) => Promise<computeActions.write.ReturnValue>
    /**
     * Pays for more seconds of a sandbox at its per-second rate, up to its
     * `timeout`. Paid per request.
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
     * await client.compute.renew({ sandboxId: sandbox.sandboxId, seconds: 300 })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The sandbox with its new `paidUntil`.
     */
    renew: (
      parameters: computeActions.renew.Parameters,
    ) => Promise<computeActions.renew.ReturnValue>
    /**
     * Runs a command and yields its output as it is written, then its exit.
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
     * for await (const event of client.compute.stream({
     *   command: ['python', 'train.py'],
     *   sandboxId: sandbox.sandboxId,
     * })) {
     *   if (event.type !== 'exit') process.stdout.write(event.data)
     * }
     * ```
     *
     * @param parameters - Parameters.
     * @returns Output and exit events.
     */
    stream: (
      parameters: computeActions.stream.Parameters,
    ) => AsyncGenerator<computeActions.stream.Event>
    /**
     * Follows the log of a command started with `spawn` and yields it as it
     * grows, then the exit code. Paid per request.
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
     * for await (const event of client.compute.logs({
     *   logPath: job.logPath,
     *   sandboxId: sandbox.sandboxId,
     * })) {
     *   if (event.type === 'log') process.stdout.write(event.data)
     * }
     * ```
     *
     * @param parameters - Parameters.
     * @returns Log, exit, and end events.
     */
    logs: (
      parameters: computeActions.logs.Parameters,
    ) => AsyncGenerator<computeActions.logs.Event>
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
 * Adds Gateway inference (`client.ai`), object storage (`client.bucket`),
 * sandboxed compute (`client.compute`), and key-value state (`client.kv`) to a
 * Client.
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
      streamText: (parameters) => aiActions.streamText(gateway, parameters),
    },
    bucket: {
      delete: (parameters) => bucketActions.delete(gateway, parameters),
      get: (parameters) => bucketActions.get(gateway, parameters),
      head: (parameters) => bucketActions.head(gateway, parameters),
      list: (parameters) => bucketActions.list(gateway, parameters),
      put: (parameters) => bucketActions.put(gateway, parameters),
    },
    compute: {
      create: (parameters) => computeActions.create(gateway, parameters),
      exec: (parameters) => computeActions.exec(gateway, parameters),
      list: (parameters) => computeActions.list(gateway, parameters),
      logs: (parameters) => computeActions.logs(gateway, parameters),
      read: (parameters) => computeActions.read(gateway, parameters),
      renew: (parameters) => computeActions.renew(gateway, parameters),
      snapshot: (parameters) => computeActions.snapshot(gateway, parameters),
      spawn: (parameters) => computeActions.spawn(gateway, parameters),
      status: (parameters) => computeActions.status(gateway, parameters),
      stream: (parameters) => computeActions.stream(gateway, parameters),
      terminate: (parameters) => computeActions.terminate(gateway, parameters),
      write: (parameters) => computeActions.write(gateway, parameters),
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
