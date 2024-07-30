import { defineChain } from '../../utils/chain/defineChain.js'

export const xai = /*#__PURE__*/ defineChain({
  id: 660279,
  name: 'Xai Mainnet',
  nativeCurrency: { name: 'Xai', symbol: 'XAI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://xai-chain.net/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.xai-chain.net',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 222549,
    },
  },
  testnet: false,
})
