import type { Address } from 'abitype'

import type { Chain } from '../../../types/chain.js'
import type { TargetChain } from './chain.js'

export type GetContractAddressParameter<
  chain extends Chain | undefined,
  contractName extends string,
> =
  | (chain extends Chain
      ? {
          [key in `${contractName}Address`]?: undefined
        } & { targetChain: TargetChain<chain, contractName> }
      : never)
  | ({
      [key in `${contractName}Address`]: Address
    } & { targetChain?: undefined })
