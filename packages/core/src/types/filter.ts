import type { Hex } from './misc'

export type FilterType = 'transaction' | 'block' | 'event'

export type Filter<TFilterType extends FilterType = 'event'> = {
  id: Hex
  type: TFilterType
}
