import { Abi } from 'abitype'

import { AbiFunctionSignatureNotFoundError } from '../../errors'
import { Hex } from '../../types'
import { slice } from '../data'
import { getFunctionSignature } from '../hash'
import { decodeAbi } from './decodeAbi'
import { formatAbiItemWithParams } from './formatAbiItemWithParams'

export function decodeFunctionData({ abi, data }: { abi: Abi; data: Hex }) {
  const signature = slice(data, 0, 4)
  const description = abi.find(
    (x) => signature === getFunctionSignature(formatAbiItemWithParams(x)),
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
