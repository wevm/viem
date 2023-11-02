import type { Abi } from 'abitype'

import {
  AbiConstructorNotFoundError,
  type AbiConstructorNotFoundErrorType,
  AbiConstructorParamsNotFoundError,
  type AbiConstructorParamsNotFoundErrorType,
} from '../../errors/abi.js'
import type { GetConstructorArgs } from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'

import type { ErrorType } from '../../errors/utils.js'
import {
  type DecodeAbiParametersErrorType,
  decodeAbiParameters,
} from './decodeAbiParameters.js'

const docsPath = '/docs/contract/decodeDeployData'

export type DecodeDeployDataParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
> = {
  abi: TAbi
  bytecode: Hex
  data: Hex
}

export type DecodeDeployDataReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
> = {
  bytecode: Hex
} & GetConstructorArgs<TAbi>

export type DecodeDeployDataErrorType =
  | AbiConstructorNotFoundErrorType
  | AbiConstructorParamsNotFoundErrorType
  | DecodeAbiParametersErrorType
  | ErrorType

export function decodeDeployData<const TAbi extends Abi | readonly unknown[]>({
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
