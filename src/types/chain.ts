import type { Chain as Chain_ } from '@wagmi/chains'
import type { Address } from 'abitype'
import type { Formatters } from './formatter.js'

export type Chain<TFormatters extends Formatters = Formatters> = Chain_ & {
  formatters?: TFormatters
}

export type ChainContract = {
  address: Address
  blockCreated?: number
}
