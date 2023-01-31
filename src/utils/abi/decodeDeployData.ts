import { Abi } from 'abitype'

import {
  AbiConstructorNotFoundError,
  AbiConstructorParamsNotFoundError,
} from '../../errors'
import { Hex } from '../../types'
import { decodeAbi } from './decodeAbi'

const docsPath = '/docs/contract/decodeDeployData'

export function decodeDeployData<TAbi extends Abi = Abi>({
  abi,
  bytecode,
  data,
}: { abi: TAbi; bytecode: Hex; data: Hex }): {
  args?: readonly unknown[] | undefined
  bytecode: Hex
} {
  if (data === bytecode) return { bytecode }

  const description = abi.find((x) => 'type' in x && x.type === 'constructor')
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
