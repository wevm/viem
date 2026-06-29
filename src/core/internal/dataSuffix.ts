import * as Hex from 'ox/Hex'

export type DataSuffix =
  | Hex.Hex
  | {
      required?: boolean | undefined
      value: Hex.Hex
    }

export function append(
  data: Hex.Hex | undefined,
  suffix: DataSuffix | undefined,
) {
  const value = typeof suffix === 'string' ? suffix : suffix?.value
  return value ? Hex.concat(data ?? '0x', value) : data
}
