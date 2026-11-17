import * as Gateway from '../../Gateway.js'

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
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * await Actions.compute.write(gateway, {
 *   path: '/root/train.py',
 *   sandboxId: sandbox.sandboxId,
 *   value: 'print("training")',
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The path and size written.
 */
export async function write(
  gateway: Gateway.Gateway,
  options: write.Options,
): Promise<write.ReturnType> {
  const { path, sandboxId, signal, value } = options
  const body =
    typeof value === 'string' ? new TextEncoder().encode(value) : value
  const size = isBlob(body) ? body.size : body.byteLength
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
  return (await response.json()) as write.ReturnType
}

export declare namespace write {
  type Options = {
    /** Absolute file path. */
    path: string
    /** Sandbox ID. */
    sandboxId: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
    /** File contents. */
    value: Blob | Uint8Array | ArrayBuffer | string
  }

  type ReturnType = {
    /** Absolute file path. */
    path: string
    /** Bytes written. */
    size: number
  }

  type ErrorType = Gateway.request.ErrorType
}

/** Detects a `Blob` without `instanceof`, so ones from another realm count. */
function isBlob(value: unknown): value is Blob {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Blob).arrayBuffer === 'function' &&
    typeof (value as Blob).size === 'number'
  )
}
