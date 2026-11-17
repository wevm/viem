import * as Gateway from '../../Gateway.js'

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
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * const { exitCode, stdout } = await Actions.compute.exec(gateway, {
 *   command: ['python', '-c', 'print(1 + 1)'],
 *   sandboxId: sandbox.sandboxId,
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The command's output and exit code.
 */
export async function exec(
  gateway: Gateway.Gateway,
  options: exec.Options,
): Promise<exec.ReturnType> {
  const { command, env, sandboxId, signal, timeout, workdir } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ command, env, sandboxId, timeout, workdir }),
    path: '/compute/exec',
    signal,
  })
  return (await response.json()) as exec.ReturnType
}

export declare namespace exec {
  type Options = {
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

  type ReturnType = {
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
