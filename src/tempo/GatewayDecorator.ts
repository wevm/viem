import type { Address } from 'ox'

import type * as Account from '../core/Account.js'
import type * as Chain from '../core/Chain.js'
import type * as Client from '../core/Client.js'
import type * as Transport from '../core/Transport.js'
import { read } from '../core/actions/contract/read.js'
import * as Abis from './Abis.js'
import * as ai from './actions/ai/index.js'
import * as bucket from './actions/bucket/index.js'
import * as compute from './actions/compute/index.js'
import * as gateway from './actions/gateway/index.js'
import * as kv from './actions/kv/index.js'
import * as Gateway from './Gateway.js'

/**
 * Adds Gateway inference (`client.ai`), object storage (`client.bucket`),
 * sandboxed compute (`client.compute`), and key-value state (`client.kv`) to a
 * Client.
 *
 * When the Client has a local account, requests are paid with it through
 * `mppx` (an optional peer dependency, loaded on the first paid request).
 * Other Clients use `globalThis.fetch`, which the Accounts SDK makes
 * payment-aware for Tempo Wallet. Pass `fetch` to pay another way. Data is
 * scoped by chain, the paying wallet, and `app`.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Account, Client, gatewayActions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 * }).extend(gatewayActions())
 *
 * const { text } = await client.ai.generateText({
 *   model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
 *   prompt: 'Describe this app in one sentence.',
 * })
 * await client.kv.set({ key: 'description', value: text })
 * ```
 *
 * @param options - Gateway connection options.
 * @returns A Client decorator.
 */
export function gatewayActions(options: gatewayActions.Options = {}) {
  return <
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account, Transport.Transport>,
  ): Decorator => {
    const connection = Gateway.from({
      ...options,
      fetch:
        options.fetch ??
        (client.account?.type === 'local'
          ? pay(client as Client.Client)
          : undefined),
    })
    return {
      ai: {
        embed: (options) => ai.embed(connection, options),
        generateText: (options) => ai.generateText(connection, options),
        streamText: (options) => ai.streamText(connection, options),
      },
      bucket: {
        delete: (options) => bucket.delete(connection, options),
        get: (options) => bucket.get(connection, options),
        head: (options) => bucket.head(connection, options),
        list: (options) => bucket.list(connection, options),
        put: (options) => bucket.put(connection, options),
      },
      compute: {
        create: (options) => compute.create(connection, options),
        exec: (options) => compute.exec(connection, options),
        list: (options) => compute.list(connection, options),
        logs: (options) => compute.logs(connection, options),
        read: (options) => compute.read(connection, options),
        renew: (options) => compute.renew(connection, options),
        snapshot: (options) => compute.snapshot(connection, options),
        spawn: (options) => compute.spawn(connection, options),
        status: (options) => compute.status(connection, options),
        stream: (options) => compute.stream(connection, options),
        terminate: (options) => compute.terminate(connection, options),
        write: (options) => compute.write(connection, options),
      },
      gateway: {
        getCapabilities: (options) =>
          gateway.getCapabilities(connection, options),
      },
      kv: {
        delete: (options) => kv.delete(connection, options),
        get: (options) => kv.get(connection, options),
        list: (options) => kv.list(connection, options),
        set: (options) => kv.set(connection, options),
      },
    }
  }
}

export declare namespace gatewayActions {
  type Options = Gateway.from.Options
}

/**
 * Gateway actions added to a Client by {@link gatewayActions}.
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
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const { embeddings } = await client.ai.embed({
     *   input: ['hello world'],
     *   model: '@cf/baai/bge-m3',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The embeddings and their shape.
     */
    embed: (options: ai.embed.Options) => Promise<ai.embed.ReturnType>
    /**
     * Generates text with a Gateway model. Paid per request.
     *
     * Pass either `prompt` or `messages`.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const { text } = await client.ai.generateText({
     *   model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
     *   prompt: 'Describe this app in one sentence.',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The generated text and token usage.
     */
    generateText: (
      options: ai.generateText.Options,
    ) => Promise<ai.generateText.ReturnType>
    /**
     * Generates text with a Gateway model and yields it as it is produced.
     * Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * for await (const event of client.ai.streamText({
     *   model: '@cf/zai-org/glm-5.3',
     *   prompt: 'Write a haiku about Tempo.',
     * })) {
     *   if (event.type === 'text') process.stdout.write(event.delta)
     * }
     * ```
     *
     * @param options - Options.
     * @returns Text and reasoning deltas, then usage.
     */
    streamText: (
      options: ai.streamText.Options,
    ) => AsyncGenerator<ai.streamText.Event>
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
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * await client.bucket.delete({ key: 'notes/today.txt' })
     * ```
     *
     * @param options - Options.
     * @returns Whether the request succeeded.
     */
    delete: (
      options: bucket.delete.Options,
    ) => Promise<bucket.delete.ReturnType>
    /**
     * Reads an object from the app's bucket as a stream. Returns `null` when
     * the object does not exist or expired. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const object = await client.bucket.get({ key: 'notes/today.txt' })
     * const text = object ? await new Response(object.body).text() : null
     * ```
     *
     * @param options - Options.
     * @returns The object body and metadata, or `null`.
     */
    get: (options: bucket.get.Options) => Promise<bucket.get.ReturnType>
    /**
     * Reads the metadata of an object in the app's bucket. Returns `null` when
     * the object does not exist or expired. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const metadata = await client.bucket.head({ key: 'notes/today.txt' })
     * ```
     *
     * @param options - Options.
     * @returns The object metadata, or `null`.
     */
    head: (options: bucket.head.Options) => Promise<bucket.head.ReturnType>
    /**
     * Lists objects in the app's bucket by key prefix. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const { objects } = await client.bucket.list({ prefix: 'notes/' })
     * ```
     *
     * @param options - Options.
     * @returns A page of object metadata and the next cursor.
     */
    list: (
      options?: bucket.list.Options | undefined,
    ) => Promise<bucket.list.ReturnType>
    /**
     * Writes an object to the app's bucket for a retention period. Paid per
     * request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const metadata = await client.bucket.put({
     *   key: 'notes/today.txt',
     *   retention: 86_400,
     *   value: new Blob(['hello'], { type: 'text/plain' }),
     * })
     * ```
     *
     * @param options - Options.
     * @returns The object metadata.
     */
    put: (options: bucket.put.Options) => Promise<bucket.put.ReturnType>
  }
  /** Sandboxed CPU and GPU compute, private to the payer and app. */
  compute: {
    /**
     * Starts a sandbox that can live up to `timeout` seconds, from a container
     * image with optional `apt/pip` layers or from a snapshot. Compute is
     * metered: creation pays for `lease` seconds at the sandbox's GPU, CPU,
     * and memory rate, and `renew` pays for more. `ports` are served over
     * public HTTPS tunnels.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const sandbox = await client.compute.create({
     *   gpu: 'T4',
     *   image: 'pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime',
     *   timeout: 1200,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The sandbox and its tunnels.
     */
    create: <const ports extends readonly number[] = readonly []>(
      options?: compute.create.Options<ports> | undefined,
    ) => Promise<compute.create.ReturnType<ports>>
    /**
     * Runs a command in a sandbox and waits up to `timeout` seconds (at most
     * 120). Use `spawn` for longer jobs. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const { stdout } = await client.compute.exec({
     *   command: ['nvidia-smi'],
     *   sandboxId: sandbox.sandboxId,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The command's output and exit code.
     */
    exec: (options: compute.exec.Options) => Promise<compute.exec.ReturnType>
    /**
     * Lists the app's sandboxes that have not ended. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const { sandboxes } = await client.compute.list()
     * ```
     *
     * @param options - Options.
     * @returns A page of sandboxes and the next cursor.
     */
    list: (
      options?: compute.list.Options | undefined,
    ) => Promise<compute.list.ReturnType>
    /**
     * Follows the log of a command started with `spawn` and yields it as it
     * grows, then the exit code. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * for await (const event of client.compute.logs({
     *   logPath: job.logPath,
     *   sandboxId: sandbox.sandboxId,
     * })) {
     *   if (event.type === 'log') process.stdout.write(event.data)
     * }
     * ```
     *
     * @param options - Options.
     * @returns Log, exit, and end events.
     */
    logs: (options: compute.logs.Options) => AsyncGenerator<compute.logs.Event>
    /**
     * Reads a file from a sandbox from `offset`, up to 8 MiB per request.
     * Returns `null` when the file does not exist. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const log = await client.compute.read({
     *   path: job.logPath,
     *   sandboxId: sandbox.sandboxId,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The bytes read and the whole file size, or `null`.
     */
    read: (options: compute.read.Options) => Promise<compute.read.ReturnType>
    /**
     * Pays for more seconds of a sandbox at its per-second rate, up to its
     * `timeout`. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * await client.compute.renew({ sandboxId: sandbox.sandboxId, seconds: 300 })
     * ```
     *
     * @param options - Options.
     * @returns The sandbox with its new `paidUntil`.
     */
    renew: (options: compute.renew.Options) => Promise<compute.renew.ReturnType>
    /**
     * Saves a sandbox's filesystem as a snapshot kept for 30 days. Paid per
     * request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const { snapshot } = await client.compute.snapshot({
     *   sandboxId: sandbox.sandboxId,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The snapshot ID and its expiry.
     */
    snapshot: (
      options: compute.snapshot.Options,
    ) => Promise<compute.snapshot.ReturnType>
    /**
     * Starts a command in the background; its output goes to `logPath` and its
     * exit code to `exitPath`. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const job = await client.compute.spawn({
     *   command: ['python', 'train.py'],
     *   sandboxId: sandbox.sandboxId,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The process ID and the paths of its log and exit code.
     */
    spawn: (options: compute.spawn.Options) => Promise<compute.spawn.ReturnType>
    /**
     * Reads whether a sandbox is running. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const { status } = await client.compute.status({
     *   sandboxId: sandbox.sandboxId,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The sandbox and its status.
     */
    status: (
      options: compute.status.Options,
    ) => Promise<compute.status.ReturnType>
    /**
     * Runs a command and yields its output as it is written, then its exit.
     * Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * for await (const event of client.compute.stream({
     *   command: ['python', 'train.py'],
     *   sandboxId: sandbox.sandboxId,
     * })) {
     *   if (event.type !== 'exit') process.stdout.write(event.data)
     * }
     * ```
     *
     * @param options - Options.
     * @returns Output and exit events.
     */
    stream: (
      options: compute.stream.Options,
    ) => AsyncGenerator<compute.stream.Event>
    /**
     * Terminates a sandbox. The Gateway credits the unused rest of its lease
     * back to the payment channel. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * await client.compute.terminate({ sandboxId: sandbox.sandboxId })
     * ```
     *
     * @param options - Options.
     * @returns The final status.
     */
    terminate: (
      options: compute.terminate.Options,
    ) => Promise<compute.terminate.ReturnType>
    /**
     * Writes a file into a sandbox, up to 8 MiB. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * await client.compute.write({
     *   path: '/root/train.py',
     *   sandboxId: sandbox.sandboxId,
     *   value: 'print("training")',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The path and size written.
     */
    write: (options: compute.write.Options) => Promise<compute.write.ReturnType>
  }
  /** Gateway discovery. */
  gateway: {
    /**
     * Reads the Gateway's free discovery document: chain, currencies, prices,
     * limits, and models.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create().extend(gatewayActions())
     *
     * const capabilities = await client.gateway.getCapabilities()
     * ```
     *
     * @param options - Options.
     * @returns The Gateway capabilities.
     */
    getCapabilities: (
      options?: gateway.getCapabilities.Options | undefined,
    ) => Promise<gateway.getCapabilities.ReturnType>
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
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const { deleted } = await client.kv.delete({ key: 'counter' })
     * ```
     *
     * @param options - Options.
     * @returns Whether the key existed.
     */
    delete: (options: kv.delete.Options) => Promise<kv.delete.ReturnType>
    /**
     * Reads a key from the app's key-value store. Returns `null` when the key
     * does not exist or expired. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const entry = await client.kv.get({ key: 'counter' })
     * ```
     *
     * @param options - Options.
     * @returns The entry, or `null`.
     */
    get: (options: kv.get.Options) => Promise<kv.get.ReturnType>
    /**
     * Lists entries in the app's key-value store by key prefix, in key order.
     * Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const { entries } = await client.kv.list({ prefix: 'settings/' })
     * ```
     *
     * @param options - Options.
     * @returns A page of entries and the next cursor.
     */
    list: (options?: kv.list.Options | undefined) => Promise<kv.list.ReturnType>
    /**
     * Writes a JSON value to the app's key-value store. Paid per request.
     *
     * Pass `ifVersion` to write conditionally: `null` creates the key only if
     * it does not exist, and a version replaces the value only if it is still
     * that version. A failed condition throws `Gateway.VersionConflictError`.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { Account, Client, gatewayActions } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     * }).extend(gatewayActions())
     *
     * const entry = await client.kv.set({
     *   ifVersion: null,
     *   key: 'counter',
     *   value: { count: 1 },
     * })
     * ```
     *
     * @param options - Options.
     * @returns The written entry.
     */
    set: (options: kv.set.Options) => Promise<kv.set.ReturnType>
  }
}

/**
 * Pays Gateway requests with the Client's account through `mppx`. Requests go
 * through `globalThis.fetch` until the Gateway first asks for payment, so free
 * routes work without `mppx` installed. `mppx` is loaded then, paying in the
 * Gateway currency the account holds most of. When the account runs out, the
 * next request reads its balances again, so funding it is enough to continue.
 */
function pay(client: Client.Client): Gateway.Fetch {
  let mppx: Promise<Gateway.Fetch> | undefined
  let funds: Funds | undefined
  return async (input, init) => {
    if (!mppx) {
      const response = await globalThis.fetch(input, init)
      if (response.status !== 402) return response
      await response.body?.cancel().catch(() => {})
      funds = await balances(client, new URL(input).origin)
      const [best] = funds.balances
      if (!best || best.amount === 0n)
        throw new Gateway.InsufficientFundsError(funds)
      mppx = load().then(
        ({ Mppx, tempo }) =>
          Mppx.create({
            methods: [
              tempo({
                account: client.account,
                getClient: ({ chainId }) => {
                  const expected = client.chain?.id
                  if (
                    chainId !== undefined &&
                    expected !== undefined &&
                    chainId !== expected
                  )
                    throw new Gateway.ChainMismatchError({ chainId, expected })
                  return client
                },
              }),
            ],
            orderChallenges: (candidates) =>
              [...candidates].sort(
                (a, b) =>
                  Number(!isCurrency(a, best.currency)) -
                  Number(!isCurrency(b, best.currency)),
              ),
            polyfill: false,
          }).fetch,
        (error: unknown) => {
          mppx = undefined
          throw error
        },
      )
    }
    const underfunded = async (error: unknown) => {
      if (!(error instanceof Error) || !isUnderfunded(error)) return error
      mppx = undefined
      const current = await balances(client, new URL(input).origin).catch(
        () => funds,
      )
      return new Gateway.InsufficientFundsError({
        ...(current ?? { address: '0x', balances: [] }),
        cause: error,
      })
    }
    const response = await (
      await mppx
    )(input, init).catch(async (error) => {
      throw await underfunded(error)
    })
    if (!response.body) return response
    const reader = response.body.getReader()
    const body = new ReadableStream<Uint8Array>({
      cancel: (reason) => reader.cancel(reason),
      async pull(controller) {
        try {
          const { done, value } = await reader.read()
          if (done) controller.close()
          else controller.enqueue(value)
        } catch (error) {
          controller.error(await underfunded(error))
        }
      },
    })
    const wrapped = new Response(body, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    })
    Object.defineProperty(wrapped, 'url', { value: response.url })
    return wrapped
  }
}

type Funds = Gateway.InsufficientFundsError.Options

/** Reads the account's balance of each Gateway currency, largest first. */
async function balances(client: Client.Client, origin: string): Promise<Funds> {
  const { address } = client.account!
  const response = await globalThis.fetch(`${origin}/v1/capabilities`)
  const { chainId, currencies } = (await response.json()) as {
    chainId: number
    currencies: Record<string, Address.Address>
  }
  const expected = client.chain?.id
  if (expected !== undefined && chainId !== expected)
    throw new Gateway.ChainMismatchError({ chainId, expected })
  const balances = await Promise.all(
    Object.entries(currencies).map(async ([symbol, currency]) => ({
      amount: await read(client, {
        abi: Abis.tip20,
        address: currency,
        args: [address],
        functionName: 'balanceOf',
      }),
      currency,
      symbol: symbol.toUpperCase(),
    })),
  )
  return {
    address,
    balances: balances.sort((a, b) => (b.amount > a.amount ? 1 : -1)),
  }
}

function isCurrency(candidate: unknown, currency: Address.Address) {
  const requested = (
    candidate as { challenge?: { request?: { currency?: string } } }
  ).challenge?.request?.currency
  return requested?.toLowerCase() === currency.toLowerCase()
}

/** Whether a payment failed because the account could not cover it. */
function isUnderfunded(error: Error) {
  for (let cause: unknown = error; cause instanceof Error; cause = cause.cause)
    if (/InsufficientBalance/.test(cause.message)) return true
  return false
}

type MppxClient = {
  Mppx: {
    create: (options: {
      methods: readonly unknown[]
      orderChallenges: (candidates: readonly unknown[]) => unknown[]
      polyfill: boolean
    }) => {
      fetch: Gateway.Fetch
    }
  }
  tempo: (options: {
    account: unknown
    getClient: (options: { chainId?: number | undefined }) => unknown
  }) => unknown
}

/**
 * Loads `mppx/client`. The specifier is cast so TypeScript doesn't pull the
 * optional peer dependency's types into Viem's, while bundlers still see a
 * literal import. The `try` marks the import optional for webpack, so a build
 * without `mppx` warns instead of failing, and the import rejects at runtime.
 */
async function load(): Promise<MppxClient> {
  try {
    return await import('mppx/client' as string)
  } catch (error) {
    throw new Gateway.MppxNotInstalledError({ cause: error as Error })
  }
}
