import * as Gateway from '../../Gateway.js'
import * as Ndjson from '../../internal/ndjson.js'

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
 * const gateway = Gateway.from({ fetch: mppx.fetch })
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
 * @param options - Options.
 * @returns Log, exit, and end events.
 */
export async function* logs(
  gateway: Gateway.Gateway,
  options: logs.Options,
): AsyncGenerator<logs.Event> {
  const { logPath, offset, sandboxId, signal } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ logPath, offset, sandboxId }),
    path: '/compute/logs',
    signal,
  })
  yield* Ndjson.read<logs.Event>(response)
}

export declare namespace logs {
  type Options = {
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
