import { fillTransaction } from '../../actions/public/fillTransaction.js'
import type { Client } from '../../clients/createClient.js'
import { BaseError } from '../../errors/base.js'
import type { Frame } from '../../types/frame.js'
import * as FrameTransaction from './transaction.js'

/** Applies post-fill hooks before any canonical transaction signature is requested. */
export async function afterFill(
  client: Client,
  transaction: FrameTransaction.Transaction,
  initial: readonly Frame[],
): Promise<FrameTransaction.Transaction> {
  let request = FrameTransaction.resolve(transaction)
  if (!request.frameContext?.entries.some((entry) => entry.afterFill))
    return request

  const hash = FrameTransaction.getHash(request)
  if (request.frameContext.afterFillHash === hash) return request
  if (
    request.signatures?.some(
      (entry) => entry.signature && entry.signature !== '0x',
    )
  )
    throw new BaseError(
      'Frame.from: `afterFill` cannot update a transaction containing completed signatures.',
    )

  for (let attempt = 0; attempt < 3; attempt++) {
    const results = []
    for (const entry of request.frameContext!.entries) {
      if (!entry.afterFill) continue
      const result = await entry.afterFill({
        client,
        transaction: request,
        entries: request.frameContext!.entries,
        frameIndex: entry.frameIndex,
      })
      if (result) results.push(result)
    }
    const frames = [...request.frames]
    const updated = new Set<number>()
    for (const result of results)
      for (const { index, ...update } of result.frames) {
        if (!Number.isInteger(index) || index < 0 || index >= frames.length)
          throw new BaseError(
            'Frame.from: each `afterFill` patch index must be an integer within the transaction frame array.',
          )
        if (updated.has(index))
          throw new BaseError(
            'Frame.from: multiple `afterFill` patches target the same frame index.',
          )
        if ('prepare' in update || 'frame' in update)
          throw new BaseError(
            'Frame.from: `afterFill` patches must contain protocol frame fields, without `prepare` or signed frame envelopes.',
          )
        updated.add(index)
        frames[index] = { ...frames[index]!, ...update }
      }

    if (updated.size) {
      const filled = await fillTransaction(client, {
        ...request,
        chain: null,
        account: request.sender,
        frames: frames.map((frame, index) => ({
          ...frame,
          executionGas: initial[index]?.executionGas,
          stateGas: initial[index]?.stateGas,
        })),
      })
      if (filled.transaction.frames?.length !== frames.length)
        throw new BaseError(
          'Frame.from: the `eth_fillTransaction` response frame count differs from the prepared request.',
        )
      request = FrameTransaction.resolve({
        ...request,
        frames: frames.map((frame, index) => ({
          ...frame,
          executionGas:
            initial[index]?.executionGas ??
            filled.transaction.frames![index]!.executionGas,
          stateGas:
            initial[index]?.stateGas ??
            filled.transaction.frames![index]!.stateGas,
        })),
      })
    }

    if (results.every((result) => !result.validate || result.validate(request)))
      return {
        ...request,
        frameContext: {
          ...request.frameContext!,
          afterFillHash: FrameTransaction.getHash(request),
        },
      }
  }
  throw new BaseError(
    'Frame.from: `afterFill` gas validation failed after three fill attempts.',
  )
}
