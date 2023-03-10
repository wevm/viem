import { Chain as Chain_ } from '@wagmi/chains'
import { Address } from './abitype'
import { Formatters } from './formatter'

export type Chain<TFormatters extends Formatters = Formatters> = Chain_ & {
  formatters?: TFormatters
}

export type ChainContract = {
  address: Address
  blockCreated?: number
}
