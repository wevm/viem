import type { Abi } from 'abitype'
import { AbiNotFoundOnBytecodeError } from '../../errors/abi.js'
import type { Hex } from '../../types/misc.js'
import { getEventSelector } from '../hash/getEventSelector.js'
import { getEventSignature } from '../hash/getEventSignature.js'
import { getFunctionSelector } from './../hash/getFunctionSelector.js'
import { getFunctionSignature } from './../hash/getFunctionSignature.js'

export type VerifyAbiParameters<TAbi extends Abi = Abi> = {
  abi: TAbi
  bytecode: Hex
}

type VerifyEntity = {
  type: 'function' | 'event'
  selector: Hex
  signature: string
}

export function verifyAbi<const TAbi extends Abi>({
  abi,
  bytecode,
}: VerifyAbiParameters<TAbi>) {
  const entities: VerifyEntity[] = []

  abi.forEach((abiItem) => {
    switch (abiItem.type) {
      case 'function':
        entities.push({
          type: 'function',
          selector: getFunctionSelector(abiItem),
          signature: `function ${getFunctionSignature(abiItem)}`,
        })
        break
      case 'event':
        entities.push({
          type: 'event',
          selector: getEventSelector(abiItem),
          signature: `type ${getEventSignature(abiItem)}`,
        })
        break
    }
  })

  const sig: string[] = []

  entities.forEach((entity) => {
    const { selector, signature } = entity
    const matches = bytecode.includes(selector.slice(2))
    if (!matches) {
      sig.push(signature)
    }
  })

  if (sig.length > 0) {
    throw new AbiNotFoundOnBytecodeError(sig)
  }
  return
}
