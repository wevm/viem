import { providers } from 'ethers'
import { JsonRpcProvider } from 'ethers@6'
import Web3 from 'web3'

import { localhost } from '../chains'

export const ethersProvider = new providers.JsonRpcProvider(
  localhost.rpcUrls.default.http[0],
)

export const ethersV6Provider = new JsonRpcProvider(
  localhost.rpcUrls.default.http[0],
)

export const web3Provider = new Web3(localhost.rpcUrls.default.http[0])
