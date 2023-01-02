import type { Data } from './data'

export type FilterType = 'transaction' | 'block' | 'default'

export type Filter<TFilterType extends FilterType = 'default'> = {
  id: Data
  type: TFilterType
}
