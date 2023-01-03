import type { Hex } from './misc'

export type FilterType = 'transaction' | 'block' | 'default'

export type Filter<TFilterType extends FilterType = 'default'> = {
  id: Hex
  type: TFilterType
}
