import { AbiParameter } from 'abitype'

import { InvalidDefinitionTypeError } from '../../errors'
import { AbiItem } from '../../types'

export function formatAbiItemWithParams(
  abiItem: AbiItem,
  { includeName = false }: { includeName?: boolean } = {},
) {
  if (
    abiItem.type !== 'function' &&
    abiItem.type !== 'event' &&
    abiItem.type !== 'error'
  )
    throw new InvalidDefinitionTypeError(abiItem.type)

  return `${abiItem.name}(${getParams(abiItem.inputs, { includeName })})`
}

function getParams(
  params: readonly AbiParameter[] | undefined,
  { includeName }: { includeName: boolean },
): string {
  if (!params) return ''
  return params
    .map((param) => getParam(param, { includeName }))
    .join(includeName ? ', ' : ',')
}

function getParam(
  param: AbiParameter,
  { includeName }: { includeName: boolean },
): string {
  if (param.type.startsWith('tuple')) {
    return `(${getParams(
      (param as unknown as { components: AbiParameter[] }).components,
      { includeName },
    )})${param.type.slice('tuple'.length)}`
  }
  return param.type + (includeName && param.name ? ` ${param.name}` : '')
}
