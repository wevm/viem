import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../tempo/chainConfig.js'

export const tempoLocalnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 1337,
  name: 'Tempo',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
  },
})
