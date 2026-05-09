import { defineChain } from '../../utils/chain/defineChain.js'

export const rise = /*#__PURE__*/ defineChain({
  id: 4153,
  name: 'RISE',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.risechain.com'],
      webSocket: ['wss://rpc.risechain.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.risechain.com',
      apiUrl: 'https://explorer.risechain.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
})
