import { providers } from 'ethers'

import { localhost } from '../src/chains'

export const ethersProvider = new providers.StaticJsonRpcProvider(
  localhost.rpcUrls.default.http[0],
)
