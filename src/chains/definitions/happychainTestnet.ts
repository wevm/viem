import { defineChain } from '../../utils/chain/defineChain.js'

export const happychainTestnet = /*#__PURE__*/ defineChain({
  id: 216,
  name: 'Happychain Testnet',
  nativeCurrency: {
    symbol: 'HAPPY',
    name: 'HAPPY',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://happy-testnet-sepolia.rpc.caldera.xyz/http'],
      webSocket: ['wss://happy-testnet-sepolia.rpc.caldera.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Happy Chain Testnet Explorer',
      url: 'https://happy-testnet-sepolia.explorer.caldera.xyz/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1,
    },
  },
  testnet: true,
})
