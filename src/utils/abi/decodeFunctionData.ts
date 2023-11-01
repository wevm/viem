import type { Abi, ExtractAbiFunctionNames } from 'abitype'

import { AbiFunctionSignatureNotFoundError } from '../../errors/abi.js'
import type { GetFunctionArgs } from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import { type SliceErrorType, slice } from '../data/slice.js'
import {
  type GetFunctionSelectorErrorType,
  getFunctionSelector,
} from '../hash/getFunctionSelector.js'

import type { ErrorType } from '../../errors/utils.js'
import {
  type DecodeAbiParametersErrorType,
  decodeAbiParameters,
} from './decodeAbiParameters.js'
import { type FormatAbiItemErrorType, formatAbiItem } from './formatAbiItem.js'

export type DecodeFunctionDataParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
> = {
  abi: TAbi
  data: Hex
}

export type DecodeFunctionDataReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  _FunctionNames extends string = TAbi extends Abi
    ? Abi extends TAbi
      ? string
      : ExtractAbiFunctionNames<TAbi>
    : string,
> = {
  [TName in _FunctionNames]: {
    args: GetFunctionArgs<TAbi, TName>['args']
    functionName: TName
  }
}[_FunctionNames]

export type DecodeFunctionDataErrorType =
  | AbiFunctionSignatureNotFoundError
  | DecodeAbiParametersErrorType
  | FormatAbiItemErrorType
  | GetFunctionSelectorErrorType
  | SliceErrorType
  | ErrorType

export function decodeFunctionData<TAbi extends Abi | readonly unknown[]>({
  abi,
  data,
}: DecodeFunctionDataParameters<TAbi>) {
  const signature = slice(data, 0, 4)
  const description = (abi as Abi).find(
    (x) =>
      x.type === 'function' &&
      signature === getFunctionSelector(formatAbiItem(x)),
  )
  if (!description)
    throw new AbiFunctionSignatureNotFoundError(signature, {
      docsPath: '/docs/contract/decodeFunctionData',
    })
  return {
    functionName: (description as { name: string }).name,
    args: ('inputs' in description &&
    description.inputs &&
    description.inputs.length > 0
      ? decodeAbiParameters(description.inputs, slice(data, 4))
      : undefined) as readonly unknown[] | undefined,
  } as DecodeFunctionDataReturnType<TAbi>
}
