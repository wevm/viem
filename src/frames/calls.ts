import { BaseError } from '../errors/base.js'
import type { Call as Call_ } from '../types/calls.js'
import type { Frame } from '../types/frame.js'
import type { UnionOmit } from '../types/utils.js'
import { encodeFunctionData } from '../utils/abi/encodeFunctionData.js'
import { concat } from '../utils/data/concat.js'
import { from } from './Frame.js'
import * as internal from './internal/transaction.js'

/**
 * Creates one atomic batch of sender calls.
 *
 * - Docs: https://viem.sh/docs/frames/calls
 *
 * @example
 * ```ts
 * import { calls } from 'viem/frames'
 *
 * frames: [
 *   calls([{ to: token, abi: tokenAbi, functionName: 'approve', args: [exchange, amount] }, { to: exchange, data: swapData }]),
 *   calls([{ to: recipient, value: 1n }]),
 * ]
 * ```
 *
 * @param batch - A nonempty array of raw or ABI-inferred contract calls. A singleton is an independent call.
 * @returns A helper that expands into protocol frames during transaction preparation.
 */
export function calls<const batch extends readonly unknown[]>(
  batch: batch & { [index in keyof batch]: calls.Call<batch[index]> },
): Frame {
  if (!Array.isArray(batch) || !batch.length)
    throw new BaseError('Expected a nonempty array of calls.')

  return from(() => ({
    frames: batch.map((call: unknown, index): Frame => {
      if (
        !call ||
        typeof call !== 'object' ||
        Array.isArray(call) ||
        'mode' in call ||
        'flags' in call ||
        internal.signing in call
      )
        throw new BaseError(
          'Batches accept only plain calls without mode or flags.',
        )

      const { abi, args, functionName, dataSuffix, ...frame } =
        call as calls.Call
      const data = abi
        ? encodeFunctionData({ abi, args, functionName })
        : frame.data

      return {
        ...frame,
        ...(data !== undefined || dataSuffix !== undefined
          ? { data: dataSuffix ? concat([data ?? '0x', dataSuffix]) : data }
          : {}),
        ...(dataSuffix !== undefined ? { [internal.dataSuffix]: true } : {}),
        ...(index < batch.length - 1 ? { flags: 'atomicBatch' as const } : {}),
        mode: 'sender',
      }
    }),
  }))
}

export declare namespace calls {
  /** A sender call whose mode and atomic grouping are assigned by the helper. */
  type Call<call = unknown> = UnionOmit<Call_<call, Properties>, 'to'> &
    Pick<Frame, 'to'>

  type Properties = Pick<Frame, 'executionGas' | 'stateGas'> & {
    flags?: never
    mode?: never
  }
}
