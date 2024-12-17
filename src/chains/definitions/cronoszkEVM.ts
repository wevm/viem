import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../zksync/chainConfig.js'

export const cronoszkEVM = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 388,
  name: 'Cronos zkEVM Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Cronos zkEVM CRO',
    symbol: 'zkCRO',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.zkevm.cronos.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Cronos zkEVM (Mainnet) Chain Explorer',
      url: 'https://explorer.zkevm.cronos.org',
    },
  },
})
