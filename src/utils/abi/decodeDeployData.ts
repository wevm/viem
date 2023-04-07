import type { Abi } from 'abitype'

import {
  AbiConstructorNotFoundError,
  AbiConstructorParamsNotFoundError,
} from '../../errors/index.js'
import type { Hex } from '../../types/index.js'
import { decodeAbiParameters } from './decodeAbiParameters.js'

const docsPath = '/docs/contract/decodeDeployData'

export type DecodeDeployDataParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
> = {
  abi: TAbi
  bytecode: Hex
  data: Hex
}
export type DecodeDeployDataReturnType = {
  args?: readonly unknown[] | undefined
  bytecode: Hex
}

export function decodeDeployData<TAbi extends Abi | readonly unknown[]>({
  abi,
  bytecode,
  data,
}: DecodeDeployDataParameters<TAbi>): DecodeDeployDataReturnType {
  if (data === bytecode) return { bytecode }

  const description = (abi as Abi).find(
    (x) => 'type' in x && x.type === 'constructor',
  )
  if (!description) throw new AbiConstructorNotFoundError({ docsPath })
  if (!('inputs' in description))
    throw new AbiConstructorParamsNotFoundError({ docsPath })
  if (!description.inputs || description.inputs.length === 0)
    throw new AbiConstructorParamsNotFoundError({ docsPath })

  const args = decodeAbiParameters(
    description.inputs,
    `0x${data.replace(bytecode, '')}`,
  )
  return { args, bytecode }
}
