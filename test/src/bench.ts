import { providers } from 'ethers'
import { JsonRpcProvider } from 'ethers@6'

import { localHttpUrl } from './constants.js'

export const ethersProvider = new providers.JsonRpcProvider(localHttpUrl)
export const ethersV6Provider = new JsonRpcProvider(localHttpUrl)
