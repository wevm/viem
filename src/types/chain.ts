import type { Chain as Chain_ } from '@wagmi/chains'
import type { Address } from 'abitype'

import type { Formatters } from './formatter.js'
import type { Serializers } from './serializer.js'
import type { IsUndefined } from './utils.js'

export type Chain<
  TFormatters extends Formatters | undefined = Formatters | undefined,
  TSerializers extends Serializers<TFormatters> | undefined =
    | Serializers<TFormatters>
    | undefined,
> = Chain_ & {
  formatters?: TFormatters
  serializers?: TSerializers
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
