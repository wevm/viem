import { type Abi, type AbiParameter, type Address } from 'abitype'

import { AbiItemAmbiguityError } from '../../errors/abi.js'
import type { ErrorType } from '../../errors/utils.js'
import type {
  AbiItem,
  GetFunctionArgs,
  InferItemName,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import { type IsHexErrorType, isHex } from '../../utils/data/isHex.js'
import { getEventSelector } from '../../utils/hash/getEventSelector.js'
import {
  type GetFunctionSelectorErrorType,
  getFunctionSelector,
} from '../../utils/hash/getFunctionSelector.js'
import { type IsAddressErrorType, isAddress } from '../address/isAddress.js'

export type GetAbiItemParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TItemName extends string = string,
> = {
  abi: TAbi
  name: InferItemName<TAbi, TItemName> | Hex
} & Partial<GetFunctionArgs<TAbi, TItemName>>

export type GetAbiItemReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TItemName extends string = string,
> = Extract<
  TAbi[number],
  {
    name: TItemName
  }
>

export type GetAbiItemErrorType =
  | IsArgOfTypeErrorType
  | IsHexErrorType
  | GetFunctionSelectorErrorType
  | ErrorType

export function getAbiItem<
  const TAbi extends Abi | readonly unknown[],
  TItemName extends string,
>({
  abi,
  args = [],
  name,
}: GetAbiItemParameters<TAbi, TItemName>): GetAbiItemReturnType<
  TAbi,
  TItemName
> {
  const isSelector = isHex(name, { strict: false })

  const abiItems = (abi as Abi).filter((abiItem) => {
    if (isSelector) {
      if (abiItem.type === 'function')
        return getFunctionSelector(abiItem) === name
      if (abiItem.type === 'event') return getEventSelector(abiItem) === name
      return false
    }
    return 'name' in abiItem && abiItem.name === name
  })

  if (abiItems.length === 0) return undefined as any
  if (abiItems.length === 1) return abiItems[0] as any

  let matchedAbiItem: AbiItem | undefined = undefined
  for (const abiItem of abiItems) {
    if (!('inputs' in abiItem)) continue
    if (!args || args.length === 0) {
      if (!abiItem.inputs || abiItem.inputs.length === 0) return abiItem as any
      continue
    }
    if (!abiItem.inputs) continue
    if (abiItem.inputs.length === 0) continue
    if (abiItem.inputs.length !== args.length) continue
    const matched = (args as readonly unknown[]).every((arg, index) => {
      const abiParameter = 'inputs' in abiItem && abiItem.inputs![index]
      if (!abiParameter) return false
      return isArgOfType(arg, abiParameter as AbiParameter)
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
    return matchedAbiItem as GetAbiItemReturnType<TAbi, TItemName>
  return abiItems[0] as GetAbiItemReturnType<TAbi, TItemName>
}

export type IsArgOfTypeErrorType = IsAddressErrorType | ErrorType

export function isArgOfType(arg: unknown, abiParameter: AbiParameter): boolean {
  const argType = typeof arg
  const abiParameterType = abiParameter.type
  switch (abiParameterType) {
    case 'address':
      return isAddress(arg as Address)
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
  args: readonly unknown[],
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
        return isAddress(args[parameterIndex] as Address)
      if (types.includes('address') && types.includes('bytes'))
        return isAddress(args[parameterIndex] as Address)
      return false
    })()

    if (ambiguous) return types
  }

  return
}
