import { providers } from 'ethers'
import Web3 from 'web3'
import { JsonRpcProvider } from 'essential-eth'

import { localhost } from '../chains'

export const ethersProvider = new providers.JsonRpcProvider(
  localhost.rpcUrls.default.http[0],
)

export const web3Provider = new Web3(localhost.rpcUrls.default.http[0])

export const essentialProvider = new JsonRpcProvider(
  localhost.rpcUrls.default.http[0],
)
