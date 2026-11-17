import * as Gateway from '../../Gateway.js'
import * as Ndjson from '../../internal/ndjson.js'
import type { exec } from './exec.js'

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
 * const gateway = Gateway.from({ fetch: mppx.fetch })
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
 * @param options - Options.
 * @returns Output and exit events.
 */
export async function* stream(
  gateway: Gateway.Gateway,
  options: stream.Options,
): AsyncGenerator<stream.Event> {
  const { command, env, sandboxId, signal, timeout, workdir } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ command, env, sandboxId, timeout, workdir }),
    path: '/compute/stream',
    signal,
  })
  yield* Ndjson.read<stream.Event>(response)
}

export declare namespace stream {
  type Options = Omit<exec.Options, 'timeout'> & {
    /**
     * Command timeout in seconds, at most `limits.streamSeconds` (3600).
     *
     * @default 600
     */
    timeout?: number | undefined
  }

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
