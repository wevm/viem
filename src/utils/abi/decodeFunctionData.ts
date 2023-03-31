import type { Abi } from 'abitype'

import { AbiFunctionSignatureNotFoundError } from '../../errors/index.js'
import type { Hex } from '../../types/index.js'
import { slice } from '../data/index.js'
import { getFunctionSelector } from '../hash/index.js'
import { decodeAbiParameters } from './decodeAbiParameters.js'
import { formatAbiItem } from './formatAbiItem.js'

export type DecodeFunctionDataParameters = {
  abi: Abi | readonly unknown[]
  data: Hex
}

export function decodeFunctionData({
  abi,
  data,
}: DecodeFunctionDataParameters) {
  const signature = slice(data, 0, 4)
  const description = (abi as Abi).find(
    (x) => signature === getFunctionSelector(formatAbiItem(x)),
  )
  if (!description)
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
  }
}
