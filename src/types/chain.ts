import type { Address } from 'abitype'

import type { Formatters } from './formatter.js'
import type { Serializers } from './serializer.js'
import type { IsUndefined } from './utils.js'

export type Chain<
  formatters extends Formatters | undefined = Formatters | undefined,
  serializers extends Serializers<formatters> | undefined =
    | Serializers<formatters>
    | undefined,
> = import('@wagmi/chains').Chain & {
  formatters?: formatters | undefined
  serializers?: serializers | undefined
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
