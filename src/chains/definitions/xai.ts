import * as Chain from '../../core/Chain.js'

export const xai = /*#__PURE__*/ Chain.from({
  id: 660279,
  name: 'Xai Mainnet',
  nativeCurrency: { name: 'Xai', symbol: 'XAI', decimals: 18 },
  rpcUrls: {
    http: 'https://xai-chain.net/rpc',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://explorer.xai-chain.net',
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 222549,
    },
  },
  testnet: false,
})
