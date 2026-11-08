import type { Address } from 'abitype'
import type { Account } from '../accounts/types.js'
import { readContract } from '../actions/public/readContract.js'
import type { Client } from '../clients/createClient.js'
import type { Transport } from '../clients/transports/createTransport.js'
import { erc20Abi } from '../constants/abis.js'
import type { Chain } from '../types/chain.js'
import * as aiActions from './actions/ai.js'
import * as bucketActions from './actions/bucket.js'
import * as computeActions from './actions/compute.js'
import * as gatewayActions from './actions/gateway.js'
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
     * )
     *
     * const { embeddings } = await client.ai.embed({
     *   input: ['hello world'],
     *   model: '@cf/baai/bge-m3',
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
     * )
     *
     * const { text } = await client.ai.generateText({
     *   model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * Starts a sandbox that can live up to `timeout` seconds, from a container
     * image with optional `apt/pip` layers or from a snapshot. Compute is
     * metered: creation pays for `lease` seconds at the sandbox's GPU, CPU, and
     * memory rate, and `renew` pays for more. `ports` are served over public
     * HTTPS tunnels.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * Terminates a sandbox. The Gateway credits the unused rest of its lease back to the payment channel. Paid per request.
     *
     * @experimental
     *
     * @example
     * ```ts
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient().extend(gatewayActions())
     *
     * const capabilities = await client.gateway.getCapabilities()
     * ```
     *
     * @param parameters - Parameters.
     * @returns The Gateway capabilities.
     */
    getCapabilities: (
      parameters?: gatewayActions.getCapabilities.Parameters | undefined,
    ) => Promise<gatewayActions.getCapabilities.ReturnValue>
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
     * import { createClient, gatewayActions } from 'viem/tempo'
     *
     * const client = createClient({ account }).extend(
     *   gatewayActions(),
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
 * When the Client has a local account, requests are paid with it through
 * `mppx` (an optional peer dependency, loaded on the first request). Other
 * Clients use `globalThis.fetch`, which the Accounts SDK makes payment-aware
 * for Tempo Wallet. Pass `fetch` to pay another way. Data is scoped by chain, the paying wallet, and `app`.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, gatewayActions } from 'viem/tempo'
 *
 * const client = createClient({ account }).extend(gatewayActions())
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
export function decorator(options: decorator.Options = {}) {
  return <
    transport extends Transport,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): Decorator => {
    const gateway = Gateway.from({
      ...options,
      fetch:
        options.fetch ??
        (client.account?.type === 'local' ? pay(client) : undefined),
    })
    return {
      ai: {
        embed: (parameters) => aiActions.embed(gateway, parameters),
        generateText: (parameters) =>
          aiActions.generateText(gateway, parameters),
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
        terminate: (parameters) =>
          computeActions.terminate(gateway, parameters),
        write: (parameters) => computeActions.write(gateway, parameters),
      },
      gateway: {
        getCapabilities: (parameters) =>
          gatewayActions.getCapabilities(gateway, parameters),
      },
      kv: {
        delete: (parameters) => kvActions.delete(gateway, parameters),
        get: (parameters) => kvActions.get(gateway, parameters),
        list: (parameters) => kvActions.list(gateway, parameters),
        set: (parameters) => kvActions.set(gateway, parameters),
      },
    }
  }
}

export declare namespace decorator {
  type Options = Gateway.from.Options
}

/**
 * Pays Gateway requests with the Client's account through `mppx`. Requests go
 * through `globalThis.fetch` until the Gateway first asks for payment, so free
 * routes work without `mppx` installed. `mppx` is loaded then, paying in the
 * Gateway currency the account holds most of. When the account runs out, the
 * next request reads its balances again, so funding it is enough to continue.
 */
function pay(
  client: Client<Transport, Chain | undefined, Account | undefined>,
): Gateway.Fetch {
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
    const response = await (await mppx)(input, init).catch(async (error) => {
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

type Funds = Gateway.InsufficientFundsError.Parameters

/** Reads the account's balance of each Gateway currency, largest first. */
async function balances(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  origin: string,
): Promise<Funds> {
  const address = client.account!.address
  const response = await globalThis.fetch(`${origin}/v1/capabilities`)
  const { chainId, currencies } = (await response.json()) as {
    chainId: number
    currencies: Record<string, Address>
  }
  const expected = client.chain?.id
  if (expected !== undefined && chainId !== expected)
    throw new Gateway.ChainMismatchError({ chainId, expected })
  const balances = await Promise.all(
    Object.entries(currencies).map(async ([symbol, currency]) => ({
      amount: (await readContract(client, {
        abi: erc20Abi,
        address: currency,
        args: [address],
        functionName: 'balanceOf',
      })) as bigint,
      currency,
      symbol: symbol.toUpperCase(),
    })),
  )
  return {
    address,
    balances: balances.sort((a, b) => (b.amount > a.amount ? 1 : -1)),
  }
}

function isCurrency(candidate: unknown, currency: Address) {
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
    getClient: (parameters: { chainId?: number | undefined }) => unknown
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
