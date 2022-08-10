import { NonNegativeNumber } from '../number/types'
import { weiPerGwei } from './constants'

export function gweiToWei<TNumber extends number | bigint>(
  gwei: NonNegativeNumber<TNumber>,
) {
  // TODO: validations for JS consumers?

  if (typeof gwei === 'number' && gwei < 1)
    return BigInt(Math.floor(gwei * weiPerGwei))
  return BigInt(gwei) * BigInt(weiPerGwei)
}
