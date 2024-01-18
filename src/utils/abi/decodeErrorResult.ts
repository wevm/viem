import type { Abi, ExtractAbiError } from 'abitype'

import { solidityError, solidityPanic } from '../../constants/solidity.js'
import {
  AbiDecodingZeroDataError,
  type AbiDecodingZeroDataErrorType,
  AbiErrorSignatureNotFoundError,
  type AbiErrorSignatureNotFoundErrorType,
} from '../../errors/abi.js'
import type { ErrorType } from '../../errors/utils.js'
import type {
  AbiItem,
  ContractErrorArgs,
  ContractErrorName,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type { IsNarrowable, UnionEvaluate } from '../../types/utils.js'
import { slice } from '../data/slice.js'
import {
  type ToFunctionSelectorErrorType,
  toFunctionSelector,
} from '../hash/toFunctionSelector.js'
import {
  type DecodeAbiParametersErrorType,
  decodeAbiParameters,
} from './decodeAbiParameters.js'
import { type FormatAbiItemErrorType, formatAbiItem } from './formatAbiItem.js'

export type DecodeErrorResultParameters<
  abi extends Abi | readonly unknown[] = Abi,
> = { abi?: abi | undefined; data: Hex }

export type DecodeErrorResultReturnType<
  abi extends Abi | readonly unknown[] = Abi,
  ///
  allErrorNames extends ContractErrorName<abi> = ContractErrorName<abi>,
> = IsNarrowable<abi, Abi> extends true
  ? UnionEvaluate<
      {
        [errorName in allErrorNames]: {
          abiItem: abi extends Abi
            ? Abi extends abi
              ? AbiItem
              : ExtractAbiError<abi, errorName>
            : AbiItem
          args: ContractErrorArgs<abi, errorName>
          errorName: errorName
        }
      }[allErrorNames]
    >
  : {
      abiItem: AbiItem
      args: readonly unknown[] | undefined
      errorName: string
    }

export type DecodeErrorResultErrorType =
  | AbiDecodingZeroDataErrorType
  | AbiErrorSignatureNotFoundErrorType
  | DecodeAbiParametersErrorType
  | FormatAbiItemErrorType
  | ToFunctionSelectorErrorType
  | ErrorType

export function decodeErrorResult<const TAbi extends Abi | readonly unknown[]>(
  parameters: DecodeErrorResultParameters<TAbi>,
): DecodeErrorResultReturnType<TAbi> {
  const { abi, data } = parameters as DecodeErrorResultParameters

  const signature = slice(data, 0, 4)
  if (signature === '0x') throw new AbiDecodingZeroDataError()

  const abi_ = [...(abi || []), solidityError, solidityPanic]
  const abiItem = abi_.find(
    (x) =>
      x.type === 'error' && signature === toFunctionSelector(formatAbiItem(x)),
  )
  if (!abiItem)
    throw new AbiErrorSignatureNotFoundError(signature, {
      docsPath: '/docs/contract/decodeErrorResult',
    })
  return {
    abiItem,
    args:
      'inputs' in abiItem && abiItem.inputs && abiItem.inputs.length > 0
        ? decodeAbiParameters(abiItem.inputs, slice(data, 4))
        : undefined,
    errorName: (abiItem as { name: string }).name,
  } as DecodeErrorResultReturnType<TAbi>
}
