import { AbiError, AbiEvent, AbiFunction, AbiParameter } from 'abitype'
import { InvalidDefinitionTypeError } from '../../errors'

export function getDefinition(description: AbiFunction | AbiEvent | AbiError) {
  if (
    description.type !== 'function' &&
    description.type !== 'event' &&
    description.type !== 'error'
  )
    throw new InvalidDefinitionTypeError(description.type, {
      docsPath: '/docs/contract/getDefinition',
    })

  return `${description.name}(${getParams(description.inputs)})`
}

function getParams(params?: readonly AbiParameter[]): string {
  if (!params) return ''
  return params.map(getParam).join(',')
}

function getParam(param: AbiParameter): string {
  if (param.type.startsWith('tuple')) {
    return `(${getParams(
      (param as unknown as { components: AbiParameter[] }).components,
    )})${param.type.slice('tuple'.length)}`
  }
  return param.type
}
