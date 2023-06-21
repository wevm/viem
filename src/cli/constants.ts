import { mainnet } from '../chains/index.js'
import type { Chain } from '../types/chain.js'

export const ChainMaps: { [key: string]: Chain } = {
  ethereum: mainnet,
  mainnet: mainnet,
}
