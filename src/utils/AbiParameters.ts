import type * as ox_AbiParameters from 'ox/AbiParameters'
import type * as Bytes from 'ox/Bytes'
import type * as Hex from 'ox/Hex'
import { decode as ox_decode } from 'ox/AbiParameters'

export * from 'ox/AbiParameters'

/**
 * Decodes ABI-encoded data into its respective primitive values based on ABI Parameters.
 *
 * Viem defaults decoded addresses to checksummed output.
 *
 * @example
 * ```ts twoslash
 * import { AbiParameters } from 'viem/utils'
 *
 * const data = AbiParameters.decode(
 *   AbiParameters.from(['string', 'uint', 'bool']),
 *   '0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000',
 * )
 * // @log: ['wagmi', 420n, true]
 * ```
 *
 * @example
 * ### JSON Parameters
 *
 * You can pass **JSON ABI** Parameters:
 *
 * ```ts twoslash
 * import { AbiParameters } from 'viem/utils'
 *
 * const data = AbiParameters.decode(
 *   [
 *     { name: 'x', type: 'string' },
 *     { name: 'y', type: 'uint' },
 *     { name: 'z', type: 'bool' },
 *   ],
 *   '0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001a4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000',
 * )
 * // @log: ['wagmi', 420n, true]
 * ```
 *
 * @param parameters - The set of ABI parameters to decode, in the shape of the `inputs` or `outputs` attribute of an ABI Item. These parameters must include valid [ABI types](https://docs.soliditylang.org/en/latest/types.html).
 * @param data - ABI encoded data.
 * @param options - Decoding options.
 * @returns Array or object of decoded values.
 */
export function decode<
  const parameters extends ox_AbiParameters.AbiParameters,
  as extends 'Object' | 'Array' = 'Array',
>(
  parameters: parameters,
  data: Bytes.Bytes | Hex.Hex,
  options?: decode.Options<as>,
): decode.ReturnType<parameters, as>

// eslint-disable-next-line jsdoc/require-jsdoc
export function decode(
  parameters: ox_AbiParameters.AbiParameters,
  data: Bytes.Bytes | Hex.Hex,
  options: decode.Options<'Object' | 'Array'> = {},
) {
  return ox_decode(parameters, data, {
    checksumAddress: true,
    ...options,
  })
}

export declare namespace decode {
  type Options<as extends 'Object' | 'Array'> =
    ox_AbiParameters.decode.Options<as>

  type ReturnType<
    parameters extends ox_AbiParameters.AbiParameters =
      ox_AbiParameters.AbiParameters,
    as extends 'Object' | 'Array' = 'Array',
  > = ox_AbiParameters.decode.ReturnType<parameters, as>

  type ErrorType = ox_AbiParameters.decode.ErrorType
}
