import type { Abi } from 'abitype'

import {
  AbiConstructorNotFoundError,
  type AbiConstructorNotFoundErrorType,
  AbiConstructorParamsNotFoundError,
} from '../../errors/abi.js'
import type { ErrorType } from '../../errors/utils.js'
import type { ContractConstructorArgs } from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type { UnionEvaluate } from '../../types/utils.js'
import { type ConcatHexErrorType, concatHex } from '../data/concat.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from './encodeAbiParameters.js'

const docsPath = '/docs/contract/encodeDeployData'

export type EncodeDeployDataParameters<
  abi extends Abi | readonly unknown[] = Abi,
  ///
  hasConstructor = abi extends Abi
    ? Abi extends abi
      ? true
      : [Extract<abi[number], { type: 'constructor' }>] extends [never]
        ? false
        : true
    : true,
  allArgs = ContractConstructorArgs<abi>,
> = {
  abi: abi
  bytecode: Hex
} & UnionEvaluate<
  readonly [] extends allArgs
    ? { args?: allArgs | undefined }
    : { args: allArgs }
> &
  (hasConstructor extends true ? unknown : never)

export type EncodeDeployDataReturnType = Hex

export type EncodeDeployDataErrorType =
  | AbiConstructorNotFoundErrorType
  | ConcatHexErrorType
  | EncodeAbiParametersErrorType
  | ErrorType

export function encodeDeployData<const abi extends Abi | readonly unknown[]>(
  parameters: EncodeDeployDataParameters<abi>,
): EncodeDeployDataReturnType {
  const { abi, args, bytecode } = parameters as EncodeDeployDataParameters
  if (!args || args.length === 0) return bytecode

  const description = abi.find((x) => 'type' in x && x.type === 'constructor')
  if (!description) throw new AbiConstructorNotFoundError({ docsPath })
  if (!('inputs' in description))
    throw new AbiConstructorParamsNotFoundError({ docsPath })
  if (!description.inputs || description.inputs.length === 0)
    throw new AbiConstructorParamsNotFoundError({ docsPath })

  const data = encodeAbiParameters(description.inputs, args)
  return concatHex([bytecode, data!])
}
