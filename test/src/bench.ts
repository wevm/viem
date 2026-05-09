import { JsonRpcProvider } from 'ethers'
import { anvilMainnet } from './anvil.js'

export const ethersProvider = new JsonRpcProvider(anvilMainnet.rpcUrl.http)
