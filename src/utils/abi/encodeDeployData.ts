import { Abi, AbiParameterToPrimitiveType } from 'abitype'

import {
  AbiConstructorNotFoundError,
  AbiConstructorParamsNotFoundError,
} from '../../errors'
import { ExtractConstructorArgsFromAbi, Hex } from '../../types'
import { concatHex } from '../data'
import { encodeAbi } from './encodeAbi'

export function encodeDeployData<TAbi extends Abi = Abi>({
  abi,
  args,
  bytecode,
}: { abi: TAbi; bytecode: Hex } & ExtractConstructorArgsFromAbi<TAbi>) {
  if (!args || args.length === 0) return bytecode

  const description = abi.find((x) => 'type' in x && x.type === 'constructor')
  if (!description) throw new AbiConstructorNotFoundError()
  if (!('inputs' in description)) throw new AbiConstructorParamsNotFoundError()
  if (!description.inputs || description.inputs.length === 0)
    throw new AbiConstructorParamsNotFoundError()

  const data = encodeAbi({
    params: description.inputs,
    values: args as any,
  })
  return concatHex([bytecode, data!])
}
