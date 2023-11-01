import type { AbiParameter } from 'abitype'

import type { ErrorType } from '../../errors/utils.js'
import type { AbiItem } from '../../types/contract.js'
import { stringify } from '../stringify.js'

export type FormatAbiItemWithArgsErrorType = ErrorType

export function formatAbiItemWithArgs({
  abiItem,
  args,
  includeFunctionName = true,
  includeName = false,
}: {
  abiItem: AbiItem
  args: readonly unknown[]
  includeFunctionName?: boolean
  includeName?: boolean
}) {
  if (!('name' in abiItem)) return
  if (!('inputs' in abiItem)) return
  if (!abiItem.inputs) return
  return `${includeFunctionName ? abiItem.name : ''}(${abiItem.inputs
    .map(
      (input: AbiParameter, i: number) =>
        `${includeName && input.name ? `${input.name}: ` : ''}${
          typeof args[i] === 'object' ? stringify(args[i]) : args[i]
        }`,
    )
    .join(', ')})`
}
