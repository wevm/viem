import * as Hex from 'ox/Hex'

export type Quantity = Hex.Hex | bigint | number

export function toQuantity(value: Quantity) {
  if (typeof value === 'string') return value
  return Hex.fromNumber(value)
}

export declare namespace toQuantity {
  type ErrorType = Hex.fromNumber.ErrorType
}
