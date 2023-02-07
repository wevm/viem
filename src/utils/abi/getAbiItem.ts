import type { Abi, AbiParameter, Address } from 'abitype'
import type { ExtractArgsFromAbi, ExtractNameFromAbi } from '../../types'
import { isAddress } from '../address'

export type GetAbiItemArgs<
  TAbi extends Abi = Abi,
  TFunctionName extends string = any,
> = {
  abi: TAbi
  name: ExtractNameFromAbi<TAbi, TFunctionName>
} & Partial<ExtractArgsFromAbi<TAbi, TFunctionName>>

export function getAbiItem<
  TAbi extends Abi = Abi,
  TFunctionName extends string = any,
>({ abi, args = [], name }: GetAbiItemArgs<TAbi, TFunctionName>) {
  const abiItems = abi.filter((x) => 'name' in x && x.name === name)

  if (abiItems.length === 0) return undefined
  if (abiItems.length === 1) return abiItems[0]

  for (const abiItem of abiItems) {
    if (!('inputs' in abiItem)) continue
    if (!args || args.length === 0) {
      if (!abiItem.inputs || abiItem.inputs.length === 0) return abiItem
      continue
    }
    if (!abiItem.inputs) continue
    if (abiItem.inputs.length === 0) continue
    const matched = (args as readonly unknown[]).every((arg, index) => {
      const abiParameter = 'inputs' in abiItem && abiItem.inputs![index]
      if (!abiParameter) return false
      return isArgOfType(arg, abiParameter as AbiParameter)
    })
    if (matched) return abiItem
  }
  return abiItems[0]
}

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
