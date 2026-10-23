import * as Gateway from '../Gateway.js'

/**
 * GPU types a Gateway sandbox can run on.
 *
 * @experimental
 */
export type Gpu =
  | 'A100-40GB'
  | 'A100-80GB'
  | 'A10G'
  | 'B200'
  | 'H100'
  | 'H200'
  | 'L4'
  | 'L40S'
  | 'T4'

/**
 * Gateway sandbox.
 *
 * @experimental
 */
export type Sandbox = {
  /** Creation time as a Unix timestamp in milliseconds. */
  createdAt: number
  /** End of the paid lifetime as a Unix timestamp in milliseconds. */
  expiresAt: number
  /** GPU, such as `H100` or `H100:2`, or `null` on CPU. */
  gpu: string | null
  /** Container image, or the snapshot it started from. */
  image: string
  /** End of the paid lease as a Unix timestamp in milliseconds. */
  paidUntil: number
  /** Sandbox ID. */
  sandboxId: string
}

/**
 * Starts a sandbox that can live up to `timeout` seconds, from a container image
 * with optional `apt/pip` layers or from a snapshot. Compute is metered: creation
 * pays for `lease` seconds at the sandbox's GPU, CPU, and memory rate (see
 * `Gateway.getCapabilities`), and `renew` pays for more. `ports` are served
 * over public HTTPS tunnels returned in `tunnels`.
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
 * const sandbox = await Actions.compute.create(gateway, {
 *   gpu: 'T4',
 *   image: 'pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime',
 *   ports: [8000],
 *   timeout: 1200,
 * })
 * const url = sandbox.tunnels[8000]
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The sandbox and its tunnels.
 */
export async function create<
  const ports extends readonly number[] = readonly [],
>(
  gateway: Gateway.Gateway,
  parameters: create.Parameters<ports> = {} as create.Parameters<ports>,
): Promise<create.ReturnValue<ports>> {
  const {
    apt,
    blockNetwork,
    cpu,
    env,
    gpu,
    gpuCount,
    idleTimeout,
    image,
    lease,
    memory,
    pip,
    ports,
    signal,
    snapshot,
    timeout,
    workdir,
  } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({
      apt,
      blockNetwork,
      cpu,
      env,
      gpu,
      gpuCount,
      idleTimeout,
      image,
      lease,
      memory,
      pip,
      ports,
      snapshot,
      timeout,
      workdir,
    }),
    path: '/compute/create',
    signal,
  })
  return (await response.json()) as create.ReturnValue<ports>
}

export declare namespace create {
  type Parameters<ports extends readonly number[] = readonly number[]> = {
    /** Block all network access from the sandbox. */
    blockNetwork?: boolean | undefined
    /**
     * CPU cores.
     *
     * @default 1
     */
    cpu?: number | undefined
    /** Environment variables. */
    env?: Record<string, string> | undefined
    /** Seconds without activity after which the sandbox ends. */
    idleTimeout?: number | undefined
    /**
     * Seconds paid at creation. Pay for more with `renew`; the sandbox is
     * terminated about a minute after its lease ends.
     *
     * @default 300, or `timeout` if shorter
     */
    lease?: number | undefined
    /**
     * Memory in MiB.
     *
     * @default 1024
     */
    memory?: number | undefined
    /** Ports to serve over public HTTPS tunnels, up to 4. */
    ports?: ports | undefined
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
    /**
     * Longest lifetime in seconds, whatever is paid.
     *
     * @default 300
     */
    timeout?: number | undefined
    /** Working directory. */
    workdir?: string | undefined
  } & (
    | {
        /** Debian packages to install on the image. */
        apt?: readonly string[] | undefined
        /**
         * Container image.
         *
         * @default 'python:3.12-slim'
         */
        image?: string | undefined
        /** pip requirements to install on the image. */
        pip?: readonly string[] | undefined
        snapshot?: undefined
      }
    | {
        apt?: undefined
        image?: undefined
        pip?: undefined
        /** Snapshot ID from `snapshot` to start from instead of an image. */
        snapshot: string
      }
  ) &
    (
      | {
          /** GPU type. Omit to run on CPU. */
          gpu: Gpu
          /**
           * Number of GPUs.
           *
           * @default 1
           */
          gpuCount?: number | undefined
        }
      | {
          gpu?: undefined
          gpuCount?: undefined
        }
    )

  type ReturnValue<ports extends readonly number[] = readonly number[]> =
    Sandbox & {
      /** Public HTTPS URL of each requested port. */
      tunnels: { [port in ports[number] as `${port}`]: string }
    }

  type ErrorType = Gateway.request.ErrorType
}

/**
 * Runs a command in a sandbox and waits up to `timeout` seconds (at most 120)
 * for it to finish. Use `spawn` for longer jobs. Paid per request.
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
 * const { exitCode, stdout } = await Actions.compute.exec(gateway, {
 *   command: ['python', '-c', 'print(1 + 1)'],
 *   sandboxId: sandbox.sandboxId,
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The command's output and exit code.
 */
export async function exec(
  gateway: Gateway.Gateway,
  parameters: exec.Parameters,
): Promise<exec.ReturnValue> {
  const { command, env, sandboxId, signal, timeout, workdir } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ command, env, sandboxId, timeout, workdir }),
    path: '/compute/exec',
    signal,
  })
  return (await response.json()) as exec.ReturnValue
}

export declare namespace exec {
  type Parameters = {
    /** Program and arguments, run without a shell. */
    command: readonly [string, ...string[]]
    /** Environment variables. */
    env?: Record<string, string> | undefined
    /** Sandbox ID. */
    sandboxId: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
    /**
     * Command timeout in seconds, at most 120.
     *
     * @default 30
     */
    timeout?: number | undefined
    /** Working directory. */
    workdir?: string | undefined
  }

  type ReturnValue = {
    /** Exit code, or `null` if the command did not exit. */
    exitCode: number | null
    /** Standard error. */
    stderr: string
    /** Standard output. */
    stdout: string
    /** Whether the command was stopped at its timeout. */
    timedOut: boolean
    /** Whether output was cut at 1 MiB per stream. */
    truncated: boolean
  }

  type ErrorType = Gateway.request.ErrorType
}

/**
 * Lists the app's sandboxes that have not ended. Paid per request.
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
 * const { sandboxes } = await Actions.compute.list(gateway)
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns A page of sandboxes and the next cursor.
 */
export async function list(
  gateway: Gateway.Gateway,
  parameters: list.Parameters = {},
): Promise<list.ReturnValue> {
  const { cursor, limit, signal } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ cursor, limit }),
    path: '/compute/list',
    signal,
  })
  return (await response.json()) as list.ReturnValue
}

export declare namespace list {
  type Parameters = {
    /** Cursor from a previous page. */
    cursor?: string | undefined
    /** Maximum sandboxes per page. */
    limit?: number | undefined
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnValue = {
    /** Cursor of the next page, or `null` on the last page. */
    cursor: string | null
    /** Sandboxes on this page. */
    sandboxes: readonly Sandbox[]
  }

  type ErrorType = Gateway.request.ErrorType
}

/**
 * Reads a file from a sandbox, from `offset` for up to `length` bytes (8 MiB
 * per request). Returns `null` when the file does not exist. Paid per request.
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
 * const log = await Actions.compute.read(gateway, {
 *   offset: 0,
 *   path: job.logPath,
 *   sandboxId: sandbox.sandboxId,
 * })
 * const text = log && (await new Response(log.body).text())
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The bytes read and the whole file size, or `null`.
 */
export async function read(
  gateway: Gateway.Gateway,
  parameters: read.Parameters,
): Promise<read.ReturnValue> {
  const { length, offset, path, sandboxId, signal } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ length, offset, path, sandboxId }),
    path: '/compute/read',
    signal,
  }).catch((error) => {
    if (error instanceof Gateway.RequestError && error.code === 'not_found')
      return null
    throw error
  })
  if (!response?.body) return null

  return {
    body: response.body,
    offset: offset ?? 0,
    size: Number(response.headers.get('gateway-file-size')),
  }
}

export declare namespace read {
  type Parameters = {
    /** Maximum bytes to read, at most 8 MiB. */
    length?: number | undefined
    /**
     * Byte offset to read from.
     *
     * @default 0
     */
    offset?: number | undefined
    /** Absolute file path. */
    path: string
    /** Sandbox ID. */
    sandboxId: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnValue = {
    /** Bytes read. */
    body: ReadableStream<Uint8Array>
    /** Offset the bytes start at. */
    offset: number
    /** Size of the whole file in bytes. */
    size: number
  } | null

  type ErrorType = Gateway.request.ErrorType
}

/**
 * Saves a sandbox's filesystem as a snapshot kept for 30 days. Pass it to
 * `create` to start new sandboxes from it. Paid per request.
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
 * const { snapshot } = await Actions.compute.snapshot(gateway, {
 *   sandboxId: sandbox.sandboxId,
 * })
 * const copy = await Actions.compute.create(gateway, { snapshot })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The snapshot ID and its expiry.
 */
export async function snapshot(
  gateway: Gateway.Gateway,
  parameters: snapshot.Parameters,
): Promise<snapshot.ReturnValue> {
  const { sandboxId, signal } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ sandboxId }),
    path: '/compute/snapshot',
    signal,
  })
  return (await response.json()) as snapshot.ReturnValue
}

export declare namespace snapshot {
  type Parameters = {
    /** Sandbox ID. */
    sandboxId: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnValue = {
    /** Creation time as a Unix timestamp in milliseconds. */
    createdAt: number
    /** Expiry as a Unix timestamp in milliseconds. */
    expiresAt: number
    /** Snapshot ID. */
    snapshot: string
  }

  type ErrorType = Gateway.request.ErrorType
}

/**
 * Starts a command in the background and returns at once. Its output goes to
 * `logPath` and its exit code to `exitPath` when it finishes; poll both with
 * `read`. Paid per request.
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
 * const job = await Actions.compute.spawn(gateway, {
 *   command: ['python', 'train.py'],
 *   sandboxId: sandbox.sandboxId,
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The process ID and the paths of its log and exit code.
 */
export async function spawn(
  gateway: Gateway.Gateway,
  parameters: spawn.Parameters,
): Promise<spawn.ReturnValue> {
  const { command, env, sandboxId, signal, workdir } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ command, env, sandboxId, workdir }),
    path: '/compute/spawn',
    signal,
  })
  return (await response.json()) as spawn.ReturnValue
}

export declare namespace spawn {
  type Parameters = {
    /** Program and arguments, run without a shell. */
    command: readonly [string, ...string[]]
    /** Environment variables. */
    env?: Record<string, string> | undefined
    /** Sandbox ID. */
    sandboxId: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
    /** Working directory. */
    workdir?: string | undefined
  }

  type ReturnValue = {
    /** File that holds the exit code once the command finishes. */
    exitPath: string
    /** File with the command's standard output and error. */
    logPath: string
    /** Process ID. */
    pid: number
  }

  type ErrorType = Gateway.request.ErrorType
}

/**
 * Reads whether a sandbox is running. Paid per request.
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
 * const { status } = await Actions.compute.status(gateway, {
 *   sandboxId: sandbox.sandboxId,
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The sandbox and its status.
 */
export async function status(
  gateway: Gateway.Gateway,
  parameters: status.Parameters,
): Promise<status.ReturnValue> {
  const { sandboxId, signal } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ sandboxId }),
    path: '/compute/status',
    signal,
  })
  return (await response.json()) as status.ReturnValue
}

export declare namespace status {
  type Parameters = {
    /** Sandbox ID. */
    sandboxId: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnValue = Sandbox & {
    /** Exit code once terminated, otherwise `null`. */
    exitCode: number | null
    /** Sandbox status. */
    status: 'running' | 'terminated'
  }

  type ErrorType = Gateway.request.ErrorType
}

/**
 * Terminates a sandbox. Unused time is not refunded. Paid per request.
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
 * await Actions.compute.terminate(gateway, { sandboxId: sandbox.sandboxId })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The final status.
 */
export async function terminate(
  gateway: Gateway.Gateway,
  parameters: terminate.Parameters,
): Promise<terminate.ReturnValue> {
  const { sandboxId, signal } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ sandboxId }),
    path: '/compute/terminate',
    signal,
  })
  return (await response.json()) as terminate.ReturnValue
}

export declare namespace terminate {
  type Parameters = {
    /** Sandbox ID. */
    sandboxId: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnValue = {
    /** Exit code of the sandbox, or `null`. */
    exitCode: number | null
    /** Sandbox ID. */
    sandboxId: string
    /** Sandbox status. */
    status: 'terminated'
  }

  type ErrorType = Gateway.request.ErrorType
}

/**
 * Writes a file into a sandbox at an absolute path, creating its directories.
 * Up to 8 MiB. Paid per request.
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
 * await Actions.compute.write(gateway, {
 *   path: '/root/train.py',
 *   sandboxId: sandbox.sandboxId,
 *   value: 'print("training")',
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The path and size written.
 */
export async function write(
  gateway: Gateway.Gateway,
  parameters: write.Parameters,
): Promise<write.ReturnValue> {
  const { path, sandboxId, signal, value } = parameters
  const body =
    typeof value === 'string' ? new TextEncoder().encode(value) : value
  const size = body instanceof Blob ? body.size : body.byteLength
  const response = await Gateway.request(gateway, {
    body: body as BodyInit,
    headers: {
      'content-type': 'application/octet-stream',
      'gateway-path': path,
      'gateway-sandbox': sandboxId,
      'gateway-size': String(size),
    },
    path: '/compute/write',
    signal,
  })
  return (await response.json()) as write.ReturnValue
}

export declare namespace write {
  type Parameters = {
    /** Absolute file path. */
    path: string
    /** Sandbox ID. */
    sandboxId: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
    /** File contents. */
    value: Blob | Uint8Array | ArrayBuffer | string
  }

  type ReturnValue = {
    /** Absolute file path. */
    path: string
    /** Bytes written. */
    size: number
  }

  type ErrorType = Gateway.request.ErrorType
}

/**
 * Pays for more seconds of a sandbox at its per-second rate, up to its
 * `timeout`. A sandbox whose `paidUntil` passes is terminated within about a
 * minute. Paid per request.
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
 * const { paidUntil } = await Actions.compute.renew(gateway, {
 *   sandboxId: sandbox.sandboxId,
 *   seconds: 300,
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The sandbox with its new `paidUntil`.
 */
export async function renew(
  gateway: Gateway.Gateway,
  parameters: renew.Parameters,
): Promise<renew.ReturnValue> {
  const { sandboxId, seconds, signal } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ sandboxId, seconds }),
    path: '/compute/renew',
    signal,
  })
  return (await response.json()) as renew.ReturnValue
}

export declare namespace renew {
  type Parameters = {
    /** Sandbox ID. */
    sandboxId: string
    /** Seconds to pay for. */
    seconds: number
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnValue = Sandbox

  type ErrorType = Gateway.request.ErrorType
}

/**
 * Runs a command in a sandbox and yields its output as it is written, then
 * its exit. Up to `timeout` seconds (at most 3600). Paid per request.
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
 * for await (const event of Actions.compute.stream(gateway, {
 *   command: ['python', 'train.py'],
 *   sandboxId: sandbox.sandboxId,
 * })) {
 *   if (event.type === 'exit') console.log('exit', event.exitCode)
 *   else process.stdout.write(event.data)
 * }
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns Output and exit events.
 */
export async function* stream(
  gateway: Gateway.Gateway,
  parameters: stream.Parameters,
): AsyncGenerator<stream.Event> {
  const { command, env, sandboxId, signal, timeout, workdir } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ command, env, sandboxId, timeout, workdir }),
    path: '/compute/stream',
    signal,
  })
  yield* Gateway.events<stream.Event>(response)
}

export declare namespace stream {
  type Parameters = exec.Parameters

  type Event =
    | {
        /** Output text. */
        data: string
        /** Output stream. */
        type: 'stderr' | 'stdout'
      }
    | {
        /** Exit code, or `null` if the command did not exit. */
        exitCode: number | null
        /** Whether the command was stopped at its timeout. */
        timedOut: boolean
        type: 'exit'
      }

  type ErrorType = Gateway.request.ErrorType
}

/**
 * Follows the log of a command started with `spawn` from `offset` and yields
 * it as it grows, then the exit code. After an hour it yields `end` with the
 * offset to resume from. Paid per request.
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
 * for await (const event of Actions.compute.logs(gateway, {
 *   logPath: job.logPath,
 *   sandboxId: sandbox.sandboxId,
 * })) {
 *   if (event.type === 'log') process.stdout.write(event.data)
 * }
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns Log, exit, and end events.
 */
export async function* logs(
  gateway: Gateway.Gateway,
  parameters: logs.Parameters,
): AsyncGenerator<logs.Event> {
  const { logPath, offset, sandboxId, signal } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ logPath, offset, sandboxId }),
    path: '/compute/logs',
    signal,
  })
  yield* Gateway.events<logs.Event>(response)
}

export declare namespace logs {
  type Parameters = {
    /** Log path returned by `spawn`. */
    logPath: string
    /**
     * Byte offset to start from.
     *
     * @default 0
     */
    offset?: number | undefined
    /** Sandbox ID. */
    sandboxId: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type Event =
    | {
        /** Log text. */
        data: string
        /** Byte offset after this chunk. */
        offset: number
        type: 'log'
      }
    | {
        /** Exit code of the command. */
        exitCode: number | null
        /** Byte offset at the end of the log. */
        offset: number
        type: 'exit'
      }
    | {
        /** Byte offset to resume from. */
        offset: number
        type: 'end'
      }

  type ErrorType = Gateway.request.ErrorType
}
