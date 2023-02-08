import { Abi } from 'abitype'

import {
  AbiConstructorNotFoundError,
  AbiConstructorParamsNotFoundError,
} from '../../errors'
import { Hex } from '../../types'
import { decodeAbi } from './decodeAbi'

const docsPath = '/docs/contract/decodeDeployData'

export type DecodeDeployDataArgs<TAbi extends Abi | readonly unknown[] = Abi> =
  {
    abi: TAbi
    bytecode: Hex
    data: Hex
  }
export type DecodeDeployDataResponse = {
  args?: readonly unknown[] | undefined
  bytecode: Hex
}

export function decodeDeployData<TAbi extends Abi | readonly unknown[]>({
  abi,
  bytecode,
  data,
}: DecodeDeployDataArgs<TAbi>): DecodeDeployDataResponse {
  if (data === bytecode) return { bytecode }

  const description = (abi as Abi).find(
    (x) => 'type' in x && x.type === 'constructor',
  )
  if (!description) throw new AbiConstructorNotFoundError({ docsPath })
  if (!('inputs' in description))
    throw new AbiConstructorParamsNotFoundError({ docsPath })
  if (!description.inputs || description.inputs.length === 0)
    throw new AbiConstructorParamsNotFoundError({ docsPath })

  const args = decodeAbi({
    data: `0x${data.replace(bytecode, '')}`,
    params: description.inputs,
  })
  return { args, bytecode }
}
