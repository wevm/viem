import type { Address } from 'abitype'

import type { Chain } from '../../types/chain.js'
import type { Prettify } from '../../types/utils.js'
import type { TargetChain } from './chain.js'

export type GetContractAddressParameter<
  chain extends Chain | undefined,
  contractName extends string,
> =
  | (chain extends Chain
      ? Prettify<
          {
            targetChain: Prettify<TargetChain<chain, contractName>>
          } & {
            [_ in `${contractName}Address`]?: undefined
          }
        >
      : never)
  | Prettify<
      {
        targetChain?: undefined
      } & {
        [_ in `${contractName}Address`]: Address
      }
    >
