import { Abi } from 'abitype'

import { AbiFunctionSignatureNotFoundError } from '../../errors'
import { Hex } from '../../types'
import { slice } from '../data'
import { getFunctionSignature } from '../hash'
import { decodeAbi } from './decodeAbi'
import { formatAbiItem } from './formatAbiItem'

export type DecodeFunctionDataArgs = { abi: Abi; data: Hex }

export function decodeFunctionData({ abi, data }: DecodeFunctionDataArgs) {
  const signature = slice(data, 0, 4)
  const description = abi.find(
    (x) => signature === getFunctionSignature(formatAbiItem(x)),
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
      ? decodeAbi({ data: slice(data, 4), params: description.inputs })
      : undefined) as readonly unknown[] | undefined,
  }
}
