import type { Abi, AbiParameter, Address } from 'abitype'

import {
  AbiItemAmbiguityError,
  type AbiItemAmbiguityErrorType,
} from '../../errors/abi.js'
import type { ErrorType } from '../../errors/utils.js'
import type {
  AbiItem,
  AbiItemArgs,
  AbiItemName,
  ExtractAbiItemForArgs,
  Widen,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type { UnionEvaluate } from '../../types/utils.js'
import { type IsHexErrorType, isHex } from '../../utils/data/isHex.js'
import { type IsAddressErrorType, isAddress } from '../address/isAddress.js'
import { size } from '../data/size.js'
import { toEventSelector } from '../hash/toEventSelector.js'
import {
  type ToFunctionSelectorErrorType,
  toFunctionSelector,
} from '../hash/toFunctionSelector.js'
import { getArrayComponents } from './encodeAbiParameters.js'

export type GetAbiItemParameters<
  abi extends Abi | readonly unknown[] = Abi,
  name extends AbiItemName<abi> = AbiItemName<abi>,
  args extends AbiItemArgs<abi, name> | undefined = AbiItemArgs<abi, name>,
  ///
  allArgs = AbiItemArgs<abi, name>,
  allNames = AbiItemName<abi>,
> = {
  abi: abi
  name:
    | allNames // show all options
    | (name extends allNames ? name : never) // infer value
    | Hex // function selector
} & UnionEvaluate<
  readonly [] extends allArgs
    ? {
        args?:
          | allArgs // show all options
          // infer value, widen inferred value of `args` conditionally to match `allArgs`
          | (abi extends Abi
              ? args extends allArgs
                ? Widen<args>
                : never
              : never)
          | undefined
      }
    : {
        args?:
          | allArgs // show all options
          | (Widen<args> & (args extends allArgs ? unknown : never)) // infer value, widen inferred value of `args` match `allArgs` (e.g. avoid union `args: readonly [123n] | readonly [bigint]`)
          | undefined
      }
>

export type GetAbiItemErrorType =
  | IsArgOfTypeErrorType
  | IsHexErrorType
  | ToFunctionSelectorErrorType
  | AbiItemAmbiguityErrorType
  | ErrorType

export type GetAbiItemReturnType<
  abi extends Abi | readonly unknown[] = Abi,
  name extends AbiItemName<abi> = AbiItemName<abi>,
  args extends AbiItemArgs<abi, name> | undefined = AbiItemArgs<abi, name>,
> = abi extends Abi
  ? Abi extends abi
    ? AbiItem | undefined
    : ExtractAbiItemForArgs<
        abi,
        name,
        args extends AbiItemArgs<abi, name> ? args : AbiItemArgs<abi, name>
      >
  : AbiItem | undefined

export function getAbiItem<
  const abi extends Abi | readonly unknown[],
  name extends AbiItemName<abi>,
  const args extends AbiItemArgs<abi, name> | undefined = undefined,
>(
  parameters: GetAbiItemParameters<abi, name, args>,
): GetAbiItemReturnType<abi, name, args> {
  const { abi, args = [], name } = parameters as unknown as GetAbiItemParameters

  const isSelector = isHex(name, { strict: false })
  const abiItems = (abi as Abi).filter((abiItem) => {
    if (isSelector) {
      if (abiItem.type === 'function')
        return toFunctionSelector(abiItem) === name
      if (abiItem.type === 'event') return toEventSelector(abiItem) === name
      return false
    }
    return 'name' in abiItem && abiItem.name === name
  })

  if (abiItems.length === 0)
    return undefined as GetAbiItemReturnType<abi, name, args>
  if (abiItems.length === 1)
    return abiItems[0] as GetAbiItemReturnType<abi, name, args>

  let matchedAbiItem: AbiItem | undefined
  for (const abiItem of abiItems) {
    if (!('inputs' in abiItem)) continue
    if (!args || args.length === 0) {
      if (!abiItem.inputs || abiItem.inputs.length === 0)
        return abiItem as GetAbiItemReturnType<abi, name, args>
      continue
    }
    if (!abiItem.inputs) continue
    if (abiItem.inputs.length === 0) continue
    if (abiItem.inputs.length !== args.length) continue
    const matched = args.every((arg, index) => {
      const abiParameter = 'inputs' in abiItem && abiItem.inputs![index]
      if (!abiParameter) return false
      return isArgOfType(arg, abiParameter)
    })
    if (matched) {
      // Check for ambiguity against already matched parameters (e.g. `address` vs `bytes20`).
      if (
        matchedAbiItem &&
        'inputs' in matchedAbiItem &&
        matchedAbiItem.inputs
      ) {
        const ambiguousTypes = getAmbiguousTypes(
          abiItem.inputs,
          matchedAbiItem.inputs,
          args as readonly unknown[],
        )
        if (ambiguousTypes)
          throw new AbiItemAmbiguityError(
            {
              abiItem,
              type: ambiguousTypes[0],
            },
            {
              abiItem: matchedAbiItem,
              type: ambiguousTypes[1],
            },
          )
      }

      matchedAbiItem = abiItem
    }
  }

  if (matchedAbiItem)
    return matchedAbiItem as GetAbiItemReturnType<abi, name, args>
  return abiItems[0] as GetAbiItemReturnType<abi, name, args>
}

type IsArgOfTypeErrorType = IsAddressErrorType | ErrorType

/** @internal */
export function isArgOfType(arg: unknown, abiParameter: AbiParameter): boolean {
  const argType = typeof arg
  const abiParameterType = abiParameter.type
  switch (abiParameterType) {
    case 'address':
      return isAddress(arg as Address, { strict: false })
    case 'bool':
      return argType === 'boolean'
    case 'function':
      return argType === 'string'
    case 'string':
      return argType === 'string'
    default: {
      if (abiParameterType === 'tuple' && 'components' in abiParameter)
        return Object.values(abiParameter.components).every(
          (component, index) => {
            return (
              argType === 'object' &&
              isArgOfType(
                getComponentValue(arg, component, index),
                component as AbiParameter,
              )
            )
          },
        )

      // `(u)int<M>`: (un)signed integer type of `M` bits, `0 < M <= 256`, `M % 8 == 0`
      // https://regexr.com/6v8hp
      if (
        /^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(
          abiParameterType,
        )
      ) {
        if (typeof arg !== 'bigint' && typeof arg !== 'number') return false
        if (typeof arg === 'number' && !Number.isInteger(arg)) return false

        const signed = abiParameterType.startsWith('int')
        const bits = Number.parseInt(
          abiParameterType.replace(/^u?int/, '') || '256',
          10,
        )
        const max = 2n ** (BigInt(bits) - (signed ? 1n : 0n)) - 1n
        const min = signed ? -max - 1n : 0n
        return arg >= min && arg <= max
      }

      // `bytes<M>`: binary type of `M` bytes, `0 < M <= 32`
      // https://regexr.com/6va55
      if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(abiParameterType)) {
        if (typeof arg !== 'string' && !(arg instanceof Uint8Array))
          return false
        const bytes = abiParameterType.slice(5)
        if (!bytes) return true
        if (typeof arg === 'string' && !isHex(arg)) return false
        return size(arg) === Number.parseInt(bytes, 10)
      }

      // fixed-length (`<type>[M]`) and dynamic (`<type>[]`) arrays
      const arrayComponents = getArrayComponents(abiParameterType)
      if (arrayComponents) {
        const [length, type] = arrayComponents
        return (
          Array.isArray(arg) &&
          (length === null || arg.length === length) &&
          arg.every((x: unknown) =>
            isArgOfType(x, { ...abiParameter, type } as AbiParameter),
          )
        )
      }

      return false
    }
  }
}

/** @internal */
export function getAmbiguousTypes(
  sourceParameters: readonly AbiParameter[],
  targetParameters: readonly AbiParameter[],
  args: AbiItemArgs,
): AbiParameter['type'][] | undefined {
  for (const parameterIndex in sourceParameters) {
    const sourceParameter = sourceParameters[parameterIndex]
    const targetParameter = targetParameters[parameterIndex]
    if (!targetParameter) continue

    if (
      sourceParameter.type === 'tuple' &&
      targetParameter.type === 'tuple' &&
      'components' in sourceParameter &&
      'components' in targetParameter
    ) {
      const value = args[parameterIndex]
      const types = getAmbiguousTypes(
        sourceParameter.components,
        targetParameter.components,
        sourceParameter.components.map((component, index) =>
          getComponentValue(value, component, index),
        ),
      )
      if (types) return types
      continue
    }

    const sourceArray = getArrayComponents(sourceParameter.type)
    const targetArray = getArrayComponents(targetParameter.type)
    if (sourceArray && targetArray) {
      // Every item matches both element types, so the first item (or `undefined` for an empty array) decides.
      const types = getAmbiguousTypes(
        [{ ...sourceParameter, type: sourceArray[1] } as AbiParameter],
        [{ ...targetParameter, type: targetArray[1] } as AbiParameter],
        [(args[parameterIndex] as readonly unknown[] | undefined)?.[0]],
      )
      if (types) return types
      // Same element type, different array shape: `uint256[]` and `uint256[2]`
      // both accept `[1n, 1n]`, but one is dynamic and the other is static.
      // Skip this when the element types differ. `string[]` vs `address[]`
      // stays unambiguous for a non-address string.
      if (
        sourceArray[1] === targetArray[1] &&
        sourceParameter.type !== targetParameter.type
      )
        return [sourceParameter.type, targetParameter.type]
      continue
    }

    const types = [sourceParameter.type, targetParameter.type]
    const value = args[parameterIndex]

    const ambiguous = (() => {
      // An `undefined` value comes from an empty array, which matches both types.
      // This stays above the catch-all: a non-address string is not ambiguous.
      if (
        types.includes('address') &&
        (types.includes('string') || types.includes('bytes'))
      )
        return (
          value === undefined || isAddress(value as Address, { strict: false })
        )
      // Distinct types that both matched cannot be distinguished at runtime
      // (e.g. `bytes` vs `bytes32`, `uint256` vs `int256`, `address` vs `bytes20`).
      if (sourceParameter.type !== targetParameter.type) return true
      return false
    })()

    if (ambiguous) return types
  }

  return
}

/** Reads a tuple component's value by index from arrays and by name from objects, like `encodeAbiParameters`. */
function getComponentValue(
  arg: unknown,
  component: AbiParameter,
  index: number,
): unknown {
  if (Array.isArray(arg)) return arg[index]
  return (arg as Record<string, unknown> | undefined)?.[component.name!]
}
