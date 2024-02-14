import { type Abi, type AbiParameter, type Address } from 'abitype'

import { AbiItemAmbiguityError } from '../../errors/abi.js'
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
import { toEventSelector } from '../hash/toEventSelector.js'
import {
  type ToFunctionSelectorErrorType,
  toFunctionSelector,
} from '../hash/toFunctionSelector.js'

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
  args extends AbiItemArgs<abi, name> | undefined = undefined,
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

  let matchedAbiItem: AbiItem | undefined = undefined
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

export type IsArgOfTypeErrorType = IsAddressErrorType | ErrorType

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
            return isArgOfType(
              Object.values(arg as unknown[] | Record<string, unknown>)[index],
              component as AbiParameter,
            )
          },
        )

      // `(u)int<M>`: (un)signed integer type of `M` bits, `0 < M <= 256`, `M % 8 == 0`
      // https://regexr.com/6v8hp
      if (
        /^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(
          abiParameterType,
        )
      )
        return argType === 'number' || argType === 'bigint'

      // `bytes<M>`: binary type of `M` bytes, `0 < M <= 32`
      // https://regexr.com/6va55
      if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(abiParameterType))
        return argType === 'string' || arg instanceof Uint8Array

      // fixed-length (`<type>[M]`) and dynamic (`<type>[]`) arrays
      // https://regexr.com/6va6i
      if (/[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(abiParameterType)) {
        return (
          Array.isArray(arg) &&
          arg.every((x: unknown) =>
            isArgOfType(x, {
              ...abiParameter,
              // Pop off `[]` or `[M]` from end of type
              type: abiParameterType.replace(/(\[[0-9]{0,}\])$/, ''),
            } as AbiParameter),
          )
        )
      }

      return false
    }
  }
}

export function getAmbiguousTypes(
  sourceParameters: readonly AbiParameter[],
  targetParameters: readonly AbiParameter[],
  args: AbiItemArgs,
): AbiParameter['type'][] | undefined {
  for (const parameterIndex in sourceParameters) {
    const sourceParameter = sourceParameters[parameterIndex]
    const targetParameter = targetParameters[parameterIndex]

    if (
      sourceParameter.type === 'tuple' &&
      targetParameter.type === 'tuple' &&
      'components' in sourceParameter &&
      'components' in targetParameter
    )
      return getAmbiguousTypes(
        sourceParameter.components,
        targetParameter.components,
        (args as any)[parameterIndex],
      )

    const types = [sourceParameter.type, targetParameter.type]

    const ambiguous = (() => {
      if (types.includes('address') && types.includes('bytes20')) return true
      if (types.includes('address') && types.includes('string'))
        return isAddress(args[parameterIndex] as Address, { strict: false })
      if (types.includes('address') && types.includes('bytes'))
        return isAddress(args[parameterIndex] as Address, { strict: false })
      return false
    })()

    if (ambiguous) return types
  }

  return
}
