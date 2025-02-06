import type { Narrow } from 'abitype'
import * as AbiParameters from 'ox/AbiParameters'
import type { ErrorType } from '../../../errors/utils.js'

import type { Batches } from '../../../types/calls.js'
import type { Hex } from '../../../types/misc.js'
import {
  type EncodeFunctionDataErrorType,
  encodeFunctionData,
} from '../../../utils/abi/encodeFunctionData.js'
import { abi, executionMode } from '../constants.js'
import { type EncodeCallsErrorType, encodeCalls } from './encodeCalls.js'

/** @internal */
export type Batch = { calls: readonly unknown[]; opData?: Hex | undefined }

export type EncodeExecuteBatchesDataParameters<
  batches extends readonly Batch[] = readonly Batch[],
> = {
  /** Batches to execute. */
  batches: Batches<Narrow<batches>, { opData?: Hex | undefined }>
}

export type EncodeExecuteBatchesDataReturnType = Hex

export type EncodeExecuteBatchesDataErrorType =
  | EncodeCallsErrorType
  | EncodeFunctionDataErrorType
  | ErrorType

export function encodeExecuteBatchesData<batches extends readonly Batch[]>(
  parameters: EncodeExecuteBatchesDataParameters<batches>,
): EncodeExecuteBatchesDataReturnType {
  const { batches } = parameters

  const encodedBatches = AbiParameters.encode(AbiParameters.from('bytes[]'), [
    batches.map((b) => {
      const batch = b as Batch
      return encodeCalls(batch.calls, batch.opData)
    }),
  ])

  return encodeFunctionData({
    abi,
    functionName: 'execute',
    args: [executionMode.batchOfBatches, encodedBatches],
  })
}
