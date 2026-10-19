import { defineChain } from '../../utils/chain/defineChain.js'

export const jasmyChainTestnet = /*#__PURE__*/ defineChain({
  id: 681,
  name: 'Jasmy Chain Testnet',
  network: 'jasmyChainTestnet',
  nativeCurrency: { name: 'JasmyCoin', symbol: 'JASMY', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://jasmy-chain-testnet.alt.technology'],
      webSocket: ['wss://jasmy-chain-testnet.alt.technology/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Jasmy Chain Testnet Explorer',
      url: 'https://jasmy-chain-testnet-explorer.alt.technology',
      apiUrl: 'https://jasmy-chain-testnet-explorer.alt.technology/api',
    },
  },
  testnet: true,
})
