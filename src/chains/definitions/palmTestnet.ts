import * as Chain from '../../core/Chain.js'

export const palmTestnet = /*#__PURE__*/ Chain.from({
  id: 11_297_108_099,
  name: 'Palm Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'PALM',
    symbol: 'PALM',
  },
  rpcUrls: {
    default: {
      http: ['https://palm-mainnet.public.blastapi.io'],
      webSocket: ['wss://palm-mainnet.public.blastapi.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chainlens',
      url: 'https://palm.chainlens.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 15429248,
    },
  },
  testnet: true,
})
