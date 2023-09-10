import { JsonRpcProvider } from 'ethers'

import { localHttpUrl } from './constants.js'

export const ethersProvider = new JsonRpcProvider(localHttpUrl)
