import type { Address } from 'abitype'

import type { FormattedBlock } from '../utils/formatters/block.js'
import type { PrepareRequestParameters } from '../utils/transaction/prepareRequest.js'
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
  fees?: ChainFees<formatters> | undefined
}

export type ChainContract = {
  address: Address
  blockCreated?: number
}

export type ChainFees<
  formatters extends Formatters | undefined = Formatters | undefined,
> = {
  getDefaultPriorityFee(args: {
    block: FormattedBlock<{ formatters: formatters }>
    request: PrepareRequestParameters<
      Omit<Chain, 'formatters'> & { formatters: formatters }
    >
  }): Promise<bigint> | bigint
}

export type GetChain<
  TChain extends Chain | undefined,
  TChainOverride extends Chain | undefined = undefined,
> = IsUndefined<TChain> extends true
  ? { chain: TChainOverride | null }
  : { chain?: TChainOverride | null }
