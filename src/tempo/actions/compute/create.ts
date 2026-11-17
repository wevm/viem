import * as Gateway from '../../Gateway.js'
import type { Gpu, Sandbox } from './types.js'

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
 * const gateway = Gateway.from({ fetch: mppx.fetch })
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
 * @param options - Options.
 * @returns The sandbox and its tunnels.
 */
export async function create<
  const ports extends readonly number[] = readonly [],
>(
  gateway: Gateway.Gateway,
  options: create.Options<ports> = {} as create.Options<ports>,
): Promise<create.ReturnType<ports>> {
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
  } = options
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
  return (await response.json()) as create.ReturnType<ports>
}

export declare namespace create {
  type Options<ports extends readonly number[] = readonly number[]> = {
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

  type ReturnType<ports extends readonly number[] = readonly number[]> =
    Sandbox & {
      /** Public HTTPS URL of each requested port. */
      tunnels: { [port in ports[number] as `${port}`]: string }
    }

  type ErrorType = Gateway.request.ErrorType
}
