import { Abi, Narrow } from 'abitype'

import {
  AbiConstructorNotFoundError,
  AbiConstructorParamsNotFoundError,
} from '../../errors'
import { ExtractConstructorArgsFromAbi, Hex } from '../../types'
import { concatHex } from '../data'
import { encodeAbi } from './encodeAbi'

const docsPath = '/docs/contract/encodeDeployData'

export type EncodeDeployDataArgs<TAbi extends Abi | readonly unknown[] = Abi> =
  {
    abi: Narrow<TAbi>
    bytecode: Hex
  } & ExtractConstructorArgsFromAbi<TAbi>

export function encodeDeployData<TAbi extends Abi | readonly unknown[]>({
  abi,
  args,
  bytecode,
}: EncodeDeployDataArgs<TAbi>) {
  if (!args || args.length === 0) return bytecode

  const description = (abi as Abi).find(
    (x) => 'type' in x && x.type === 'constructor',
  )
  if (!description) throw new AbiConstructorNotFoundError({ docsPath })
  if (!('inputs' in description))
    throw new AbiConstructorParamsNotFoundError({ docsPath })
  if (!description.inputs || description.inputs.length === 0)
    throw new AbiConstructorParamsNotFoundError({ docsPath })

  const data = encodeAbi({
    params: description.inputs,
    values: args as any,
  })
  return concatHex([bytecode, data!])
}
