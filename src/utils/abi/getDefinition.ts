import { AbiError, AbiEvent, AbiFunction, AbiParameter } from 'abitype'
import { BaseError } from '../BaseError'

export function getDefinition(description: AbiFunction | AbiEvent | AbiError) {
  if (
    description.type !== 'function' &&
    description.type !== 'event' &&
    description.type !== 'error'
  )
    throw new InvalidDefinitionTypeError(description.type)

  return `${description.name}(${getParams(description.inputs)})`
}

function getParams(params: readonly AbiParameter[]): string {
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

class InvalidDefinitionTypeError extends BaseError {
  constructor(type: string) {
    super(
      [
        `"${type}" is not a valid definition type.`,
        'Valid types: "function", "event", "error"',
      ].join('\n'),
      {
        docsPath: '/docs/contract/getDefinition',
      },
    )
  }
}
