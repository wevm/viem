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
      address: '0xC78dA4A773fF9B94Fff3540ea16e4713C8AAa94a',
      blockCreated: 4_353_395,
    },
  },
  testnet: false,
})
