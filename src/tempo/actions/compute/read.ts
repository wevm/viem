import * as Gateway from '../../Gateway.js'

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
 * const gateway = Gateway.from({ fetch: mppx.fetch })
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
 * @param options - Options.
 * @returns The bytes read and the whole file size, or `null`.
 */
export async function read(
  gateway: Gateway.Gateway,
  options: read.Options,
): Promise<read.ReturnType> {
  const { length, offset, path, sandboxId, signal } = options
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
  type Options = {
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

  type ReturnType = {
    /** Bytes read. */
    body: ReadableStream<Uint8Array>
    /** Offset the bytes start at. */
    offset: number
    /** Size of the whole file in bytes. */
    size: number
  } | null

  type ErrorType = Gateway.request.ErrorType
}
