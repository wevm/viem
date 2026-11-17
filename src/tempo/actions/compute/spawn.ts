import * as Gateway from '../../Gateway.js'

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
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * const job = await Actions.compute.spawn(gateway, {
 *   command: ['python', 'train.py'],
 *   sandboxId: sandbox.sandboxId,
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The process ID and the paths of its log and exit code.
 */
export async function spawn(
  gateway: Gateway.Gateway,
  options: spawn.Options,
): Promise<spawn.ReturnType> {
  const { command, env, sandboxId, signal, workdir } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ command, env, sandboxId, workdir }),
    path: '/compute/spawn',
    signal,
  })
  return (await response.json()) as spawn.ReturnType
}

export declare namespace spawn {
  type Options = {
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

  type ReturnType = {
    /** File that holds the exit code once the command finishes. */
    exitPath: string
    /** File with the command's standard output and error. */
    logPath: string
    /** Process ID. */
    pid: number
  }

  type ErrorType = Gateway.request.ErrorType
}
