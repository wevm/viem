import { defineChain } from '../../utils/chain/defineChain.js'

export const creditCoin3Mainnet = /*#__PURE__*/ defineChain({
  id: 102030,
  name: 'Creditcoin',
  nativeCurrency: { name: 'Creditcoin', symbol: 'CTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet3.creditcoin.network'],
      webSocket: ['wss://mainnet3.creditcoin.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://creditcoin.blockscout.com',
      apiUrl: 'https://creditcoin.blockscout.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0x47b51dC7b7Bbb3d9eB12080e3DA6E26125e8D75e',
      blockCreated: 4_373_631,
    },
  },
  testnet: false,
})
