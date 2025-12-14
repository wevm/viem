import type { Abi, AbiStateMutability, Address } from 'abitype'
import type {
  ContractFunctionName,
  ContractFunctionParameters,
  ExtractAbiItem,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import { encodeFunctionData } from '../../utils/index.js'

export function defineCall<
  const abi extends Abi,
  const functionName extends ContractFunctionName<abi, AbiStateMutability>,
  call extends ContractFunctionParameters<
    abi,
    AbiStateMutability,
    functionName
  >,
>(
  call:
    | call
    | ContractFunctionParameters<abi, AbiStateMutability, functionName>,
): ContractFunctionParameters<
  [ExtractAbiItem<abi, functionName>],
  AbiStateMutability,
  functionName
> & {
  data: Hex
  to: Address
} {
  return {
    ...(call as any),
    data: encodeFunctionData(call as never),
    to: call.address,
  } as const
}

/**
 * Normalizes a value into a structured-clone compatible format.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone
 * @internal
 */
export function normalizeValue<type>(value: type): type {
  if (Array.isArray(value)) return value.map(normalizeValue) as never
  if (typeof value === 'function') return undefined as never
  if (typeof value !== 'object' || value === null) return value
  if (Object.getPrototypeOf(value) !== Object.prototype)
    try {
      return structuredClone(value)
    } catch {
      return undefined as never
    }

  const normalized: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value)) normalized[k] = normalizeValue(v)
  return normalized as never
}
