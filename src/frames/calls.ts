import { BaseError } from '../errors/base.js'
import type { Call as Call_ } from '../types/calls.js'
import type { Frame as Frame_ } from '../types/frame.js'
import type { UnionOmit } from '../types/utils.js'
import { encodeFunctionData } from '../utils/abi/encodeFunctionData.js'
import { concat } from '../utils/data/concat.js'
import * as Frame from './Frame.js'

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
) {
  if (!Array.isArray(batch) || !batch.length)
    throw new BaseError(
      'Frame.calls: `batch` must be a nonempty array of call objects.',
    )

  return Frame.from(() => ({
    dataSuffix(context) {
      const { index, suffix } = context
      if ((batch[index] as calls.Call).dataSuffix !== undefined)
        return undefined
      return suffix
    },

    frames: batch.map((call: unknown, index): Frame_ => {
      if (
        !call ||
        typeof call !== 'object' ||
        Array.isArray(call) ||
        'mode' in call ||
        'flags' in call ||
        'prepare' in call
      )
        throw new BaseError(
          'Frame.calls: each batch entry must be a call object without `mode`, `flags`, or `prepare` properties.',
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
        ...(index < batch.length - 1 ? { flags: 'atomicBatch' as const } : {}),
        mode: 'sender',
      }
    }),
  }))
}

export declare namespace calls {
  /** A sender call whose mode and atomic grouping are assigned by the helper. */
  type Call<call = unknown> = UnionOmit<Call_<call, Properties>, 'to'> &
    Pick<Frame_, 'to'>

  type Properties = Pick<Frame_, 'executionGas' | 'stateGas'> & {
    flags?: never
    mode?: never
  }
}
