import { providers } from 'ethers'
import { JsonRpcProvider } from 'ethers@6'

import { localhost } from '../chains.js'

export const ethersProvider = new providers.JsonRpcProvider(
  localhost.rpcUrls.default.http[0],
)

export const ethersV6Provider = new JsonRpcProvider(
  localhost.rpcUrls.default.http[0],
)
