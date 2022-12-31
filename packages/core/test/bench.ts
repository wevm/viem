import { providers } from 'ethers'
import Web3 from 'web3'

import { localhost } from '../src/chains'

export const ethersProvider = new providers.StaticJsonRpcProvider(
  localhost.rpcUrls.default.http[0],
)

export const web3Provider = new Web3(localhost.rpcUrls.default.http[0])
