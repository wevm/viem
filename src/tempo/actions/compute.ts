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
  /** Container image. */
  image: string
  /** Sandbox ID. */
  sandboxId: string
}

/**
 * Starts a sandbox from a container image, on CPU or a GPU, for `timeout`
 * seconds. Paid up front by GPU and timeout; see `Gateway.getCapabilities`.
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
 *   gpu: 'H100',
 *   image: 'python:3.12-slim',
 *   timeout: 600,
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The sandbox.
 */
export async function create(
  gateway: Gateway.Gateway,
  parameters: create.Parameters = {},
): Promise<create.ReturnValue> {
  const { gpu, gpuCount, image, signal, timeout } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ gpu, gpuCount, image, timeout }),
    path: '/compute/create',
    signal,
  })
  return (await response.json()) as create.ReturnValue
}

export declare namespace create {
  type Parameters = {
    /**
     * Container image.
     *
     * @default 'python:3.12-slim'
     */
    image?: string | undefined
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
    /**
     * Lifetime in seconds, paid up front.
     *
     * @default 300
     */
    timeout?: number | undefined
  } & (
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

  type ReturnValue = Sandbox

  type ErrorType = Gateway.request.ErrorType
}

/**
 * Runs a command in a sandbox and waits for it to finish. Paid per request.
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
  const { command, sandboxId, signal, timeout } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ command, sandboxId, timeout }),
    path: '/compute/exec',
    signal,
  })
  return (await response.json()) as exec.ReturnValue
}

export declare namespace exec {
  type Parameters = {
    /** Program and arguments, run without a shell. */
    command: readonly [string, ...string[]]
    /** Sandbox ID. */
    sandboxId: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
    /**
     * Command timeout in seconds.
     *
     * @default 30
     */
    timeout?: number | undefined
  }

  type ReturnValue = {
    /** Exit code, or `null` if the command did not exit. */
    exitCode: number | null
    /** Standard error. */
    stderr: string
    /** Standard output. */
    stdout: string
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
