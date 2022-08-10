import { NonNegativeNumber } from '../number/types'
import { weiPerEther } from './constants'

export function etherToWei<TNumber extends number | bigint>(
  ether: NonNegativeNumber<TNumber>,
) {
  // TODO: validations for JS consumers?

  if (typeof ether === 'number' && ether < 1)
    return BigInt(Math.floor(ether * weiPerEther))
  return BigInt(ether) * BigInt(weiPerEther)
}
