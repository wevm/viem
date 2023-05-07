import type { Abi, Narrow } from 'abitype'

import {
  AbiConstructorNotFoundError,
  AbiConstructorParamsNotFoundError,
} from '../../errors/abi.js'
import type { GetConstructorArgs } from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import { concatHex } from '../data/concat.js'

import { encodeAbiParameters } from './encodeAbiParameters.js'

const docsPath = '/docs/contract/encodeDeployData'

export type EncodeDeployDataParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
> = {
  abi: Narrow<TAbi>
  bytecode: Hex
} & GetConstructorArgs<TAbi>

export function encodeDeployData<TAbi extends Abi | readonly unknown[]>({
  abi,
  args,
  bytecode,
}: EncodeDeployDataParameters<TAbi>) {
  if (!args || args.length === 0) return bytecode

  const description = (abi as Abi).find(
    (x) => 'type' in x && x.type === 'constructor',
  )
  if (!description) throw new AbiConstructorNotFoundError({ docsPath })
  if (!('inputs' in description))
    throw new AbiConstructorParamsNotFoundError({ docsPath })
  if (!description.inputs || description.inputs.length === 0)
    throw new AbiConstructorParamsNotFoundError({ docsPath })

  const data = encodeAbiParameters(
    description.inputs,
    args as readonly unknown[],
  )
  return concatHex([bytecode, data!])
}
