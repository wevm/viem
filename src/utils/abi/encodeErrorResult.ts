import type { Abi, ExtractAbiErrors } from 'abitype'

import {
  AbiErrorInputsNotFoundError,
  AbiErrorNotFoundError,
} from '../../errors/abi.js'
import type {
  ContractErrorArgs,
  ContractErrorName,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import { type ConcatHexErrorType, concatHex } from '../data/concat.js'
import {
  type ToFunctionSelectorErrorType,
  toFunctionSelector,
} from '../hash/toFunctionSelector.js'

import type { ErrorType } from '../../errors/utils.js'
import type { IsNarrowable, UnionEvaluate } from '../../types/utils.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from './encodeAbiParameters.js'
import { type FormatAbiItemErrorType, formatAbiItem } from './formatAbiItem.js'
import { type GetAbiItemErrorType, getAbiItem } from './getAbiItem.js'

const docsPath = '/docs/contract/encodeErrorResult'

export type EncodeErrorResultParameters<
  abi extends Abi | readonly unknown[] = Abi,
  errorName extends ContractErrorName<abi> | undefined = ContractErrorName<abi>,
  ///
  hasErrors = abi extends Abi
    ? Abi extends abi
      ? true
      : [ExtractAbiErrors<abi>] extends [never]
        ? false
        : true
    : true,
  allArgs = ContractErrorArgs<
    abi,
    errorName extends ContractErrorName<abi>
      ? errorName
      : ContractErrorName<abi>
  >,
  allErrorNames = ContractErrorName<abi>,
> = {
  abi: abi
  args?: allArgs | undefined
} & UnionEvaluate<
  IsNarrowable<abi, Abi> extends true
    ? abi['length'] extends 1
      ? { errorName?: errorName | allErrorNames | undefined }
      : { errorName: errorName | allErrorNames }
    : { errorName?: errorName | allErrorNames | undefined }
> &
  (hasErrors extends true ? unknown : never)

export type EncodeErrorResultReturnType = Hex

export type EncodeErrorResultErrorType =
  | GetAbiItemErrorType
  | FormatAbiItemErrorType
  | ToFunctionSelectorErrorType
  | EncodeAbiParametersErrorType
  | ConcatHexErrorType
  | ErrorType

export function encodeErrorResult<
  const abi extends Abi | readonly unknown[],
  errorName extends ContractErrorName<abi> | undefined = undefined,
>(
  parameters: EncodeErrorResultParameters<abi, errorName>,
): EncodeErrorResultReturnType {
  const { abi, errorName, args } = parameters as EncodeErrorResultParameters

  let abiItem = abi[0]
  if (errorName) {
    const item = getAbiItem({ abi, args, name: errorName })
    if (!item) throw new AbiErrorNotFoundError(errorName, { docsPath })
    abiItem = item
  }

  if (abiItem.type !== 'error')
    throw new AbiErrorNotFoundError(undefined, { docsPath })

  const definition = formatAbiItem(abiItem)
  const signature = toFunctionSelector(definition)

  let data: Hex = '0x'
  if (args && args.length > 0) {
    if (!abiItem.inputs)
      throw new AbiErrorInputsNotFoundError(abiItem.name, { docsPath })
    data = encodeAbiParameters(abiItem.inputs, args)
  }
  return concatHex([signature, data])
}
