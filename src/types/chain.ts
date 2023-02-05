import { Chain as Chain_ } from '@wagmi/chains'
import { Formatters } from './formatter'

export type Chain<TFormatters extends Formatters = Formatters> = Chain_ & {
  formatters?: TFormatters
}
