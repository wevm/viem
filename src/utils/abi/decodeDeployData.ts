import type { Abi } from 'abitype'

import {
  AbiConstructorNotFoundError,
  AbiConstructorParamsNotFoundError,
} from '../../errors/abi.js'
import type { ContractConstructorArgs } from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'

import { decodeAbiParameters } from './decodeAbiParameters.js'

const docsPath = '/docs/contract/decodeDeployData'

export type DecodeDeployDataParameters<
  abi extends Abi | readonly unknown[] = Abi,
> = {
  abi: abi
  bytecode: Hex
  data: Hex
}

export type DecodeDeployDataReturnType<
  abi extends Abi | readonly unknown[] = Abi,
  ///
  allArgs = ContractConstructorArgs<abi>,
> = {
  bytecode: Hex
  args: allArgs
}

export function decodeDeployData<const abi extends Abi | readonly unknown[]>(
  parameters: DecodeDeployDataParameters<abi>,
): DecodeDeployDataReturnType<abi> {
  const { abi, bytecode, data } = parameters as DecodeDeployDataParameters
  if (data === bytecode) return { bytecode } as DecodeDeployDataReturnType<abi>

  const description = abi.find((x) => 'type' in x && x.type === 'constructor')
  if (!description) throw new AbiConstructorNotFoundError({ docsPath })
  if (!('inputs' in description))
    throw new AbiConstructorParamsNotFoundError({ docsPath })
  if (!description.inputs || description.inputs.length === 0)
    throw new AbiConstructorParamsNotFoundError({ docsPath })

  const args = decodeAbiParameters(
    description.inputs,
    `0x${data.replace(bytecode, '')}`,
  )
  return { args, bytecode } as unknown as DecodeDeployDataReturnType<abi>
}
