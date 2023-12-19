import type { Abi } from 'abitype'

import {
  AbiErrorInputsNotFoundError,
  AbiErrorNotFoundError,
} from '../../errors/abi.js'
import type {
  AbiItem,
  GetErrorArgs,
  InferErrorName,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import { type ConcatHexErrorType, concatHex } from '../data/concat.js'
import {
  type GetFunctionSelectorErrorType,
  getFunctionSelector,
} from '../hash/getFunctionSelector.js'

import type { ErrorType } from '../../errors/utils.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from './encodeAbiParameters.js'
import { type FormatAbiItemErrorType, formatAbiItem } from './formatAbiItem.js'
import {
  type GetAbiItemErrorType,
  type GetAbiItemParameters,
  getAbiItem,
} from './getAbiItem.js'

const docsPath = '/docs/contract/encodeErrorResult'

export type EncodeErrorResultParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TErrorName extends string | undefined = string,
  _ErrorName = InferErrorName<TAbi, TErrorName>,
> = {
  errorName?: _ErrorName
} & (TErrorName extends string
  ? { abi: TAbi } & GetErrorArgs<TAbi, TErrorName>
  : _ErrorName extends string
    ? { abi: [TAbi[number]] } & GetErrorArgs<TAbi, _ErrorName>
    : never)

export type EncodeErrorResultErrorType =
  | GetAbiItemErrorType
  | FormatAbiItemErrorType
  | GetFunctionSelectorErrorType
  | EncodeAbiParametersErrorType
  | ConcatHexErrorType
  | ErrorType

export function encodeErrorResult<
  const TAbi extends Abi | readonly unknown[],
  TErrorName extends string | undefined = undefined,
>({ abi, errorName, args }: EncodeErrorResultParameters<TAbi, TErrorName>) {
  let abiItem = abi[0] as AbiItem
  if (errorName) {
    abiItem = getAbiItem({
      abi,
      args,
      name: errorName,
    } as GetAbiItemParameters)
    if (!abiItem) throw new AbiErrorNotFoundError(errorName, { docsPath })
  }

  if (abiItem.type !== 'error')
    throw new AbiErrorNotFoundError(undefined, { docsPath })

  const definition = formatAbiItem(abiItem)
  const signature = getFunctionSelector(definition)

  let data: Hex = '0x'
  if (args && (args as readonly unknown[]).length > 0) {
    if (!abiItem.inputs)
      throw new AbiErrorInputsNotFoundError(abiItem.name, { docsPath })
    data = encodeAbiParameters(abiItem.inputs, args as readonly unknown[])
  }
  return concatHex([signature, data])
}
