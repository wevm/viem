import type { Abi, Narrow } from 'abitype'

import {
  AbiConstructorNotFoundError,
  AbiConstructorParamsNotFoundError,
} from '../../errors/abi.js'
import type { GetConstructorArgs } from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'

import { decodeAbiParameters } from './decodeAbiParameters.js'

const docsPath = '/docs/contract/decodeDeployData'

export type DecodeDeployDataParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
> = {
  abi: Narrow<TAbi>
  bytecode: Hex
  data: Hex
}
export type DecodeDeployDataReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
> = {
  bytecode: Hex
} & GetConstructorArgs<TAbi>

export function decodeDeployData<TAbi extends Abi | readonly unknown[]>({
  abi,
  bytecode,
  data,
}: DecodeDeployDataParameters<TAbi>): DecodeDeployDataReturnType<TAbi> {
  if (data === bytecode) return { bytecode } as DecodeDeployDataReturnType<TAbi>

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
  return { args, bytecode } as unknown as DecodeDeployDataReturnType<TAbi>
}
