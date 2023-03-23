import type { Chain as Chain_ } from '@wagmi/chains'
import type { Address } from 'abitype'
import type { Formatters } from './formatter'
import type { IsUndefined } from './utils'

export type Chain<TFormatters extends Formatters = Formatters> = Chain_ & {
  formatters?: TFormatters
}

export type ChainContract = {
  address: Address
  blockCreated?: number
}

export type GetChain<
  TChain extends Chain | undefined,
  TChainOverride extends Chain | undefined = undefined,
> = IsUndefined<TChain> extends true
  ? { chain: TChainOverride | null }
  : { chain?: TChainOverride | null }
