import type { AbiEvent, AbiParameter } from 'abitype'

import type { ErrorType } from '../../errors/utils.js'

export type FormatEventSignatureErrorType = ErrorType

/**
 * Formats an ABI event into a signature string with "indexed" keywords.
 *
 * This format is helpful for blockchain indexers (like The Graph) that require
 * users to define event signatures.
 *
 * @param abiEvent - The ABI event definition
 * @returns Event signature string with "indexed" keywords prepended to indexed parameters
 *
 * @example
 * formatEventSignature({
 *   type: 'event',
 *   name: 'Transfer',
 *   inputs: [
 *     { name: 'from', type: 'address', indexed: true },
 *     { name: 'to', type: 'address', indexed: true },
 *     { name: 'value', type: 'uint256', indexed: false }
 *   ]
 * })
 * // => "Transfer(indexed address,indexed address,uint256)"
 *
 * @example
 * formatEventSignature({
 *   type: 'event',
 *   name: 'CreateStream',
 *   inputs: [
 *     { name: 'streamId', type: 'uint256', indexed: true },
 *     { name: 'amounts', type: 'tuple', components: [
 *       { name: 'deposit', type: 'uint128' },
 *       { name: 'withdrawn', type: 'uint128' }
 *     ]},
 *     { name: 'cancelable', type: 'bool', indexed: false }
 *   ]
 * })
 * // => "CreateStream(indexed uint256,(uint128,uint128),bool)"
 */
export function formatEventSignature(abiEvent: AbiEvent): string {
  if (!abiEvent.inputs || abiEvent.inputs.length === 0) {
    return `${abiEvent.name}()`
  }

  const inputs = abiEvent.inputs
    .map((input) => {
      const typeStr = formatEventParam(input)
      return input.indexed ? `indexed ${typeStr}` : typeStr
    })
    .join(',')

  return `${abiEvent.name}(${inputs})`
}

/**
 * Formats an event parameter, handling tuples recursively.
 */
function formatEventParam(
  param: AbiParameter & { indexed?: boolean | undefined },
): string {
  if (param.type.startsWith('tuple')) {
    const components = (param as unknown as { components: AbiParameter[] })
      .components
    const tupleStr = `(${components.map((comp) => formatEventParam(comp)).join(',')})`
    const arrayNotation = param.type.slice('tuple'.length)
    return `${tupleStr}${arrayNotation}`
  }
  return param.type
}
