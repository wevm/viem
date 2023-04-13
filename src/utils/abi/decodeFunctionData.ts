import type { Abi, AbiFunction, ExtractAbiFunctionNames } from 'abitype'

import { AbiFunctionSignatureNotFoundError } from '../../errors/index.js'
import type { GetFunctionArgs, Hex } from '../../types/index.js'
import { slice } from '../data/index.js'
import { getFunctionSelector } from '../hash/index.js'
import { decodeAbiParameters } from './decodeAbiParameters.js'
import { formatAbiItem } from './formatAbiItem.js'

export type DecodeFunctionDataParameters<
  TAbi extends Abi | AbiFunction | readonly unknown[] = Abi,
> = {
  abi: TAbi
  data: Hex
}

export type DecodeFunctionDataReturnType<
  TAbi extends Abi | AbiFunction | readonly unknown[] = Abi,
  _FunctionNames extends string = TAbi extends Abi
    ? Abi extends TAbi
      ? string
      : ExtractAbiFunctionNames<TAbi>
    : string,
> = {
  [TName in _FunctionNames]: {
    args: GetFunctionArgs<
      TAbi extends AbiFunction ? [TAbi] : TAbi,
      TName
    >['args']
    functionName: TName
  }
}[_FunctionNames]

export function decodeFunctionData<
  TAbi extends Abi | AbiFunction | readonly unknown[],
>({ abi, data }: DecodeFunctionDataParameters<TAbi>) {
  const signature = slice(data, 0, 4)
  const abis: Abi = Array.isArray(abi) ? abi : [abi]
  const description = abis.find<AbiFunction>(
    ((x) =>
      x.type === 'function' &&
      signature === getFunctionSelector(formatAbiItem(x))) as (
      x: Abi[number],
    ) => x is AbiFunction,
  )

  if (description === undefined)
    throw new AbiFunctionSignatureNotFoundError(signature, {
      docsPath: '/docs/contract/decodeFunctionData',
    })

  return {
    functionName: (description as { name: string }).name,
    args: ('inputs' in description &&
    description.inputs &&
    description.inputs.length > 0
      ? decodeAbiParameters(description.inputs, slice(data, 4))
      : undefined) as readonly unknown[] | undefined,
  } as DecodeFunctionDataReturnType<TAbi>
}
