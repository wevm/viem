import { defineChain } from '../../utils/chain/defineChain.js'

export const injectiveTestnet = /*#__PURE__*/ defineChain({
  id: 1439,
  name: 'Injective Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Injective',
    symbol: 'INJ',
  },
  rpcUrls: {
    default: {
      http: ['https://k8s.testnet.json-rpc.injective.network'],
      webSocket: ['wss://k8s.testnet.ws.injective.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Injective Explorer',
      url: 'https://testnet.blockscout.injective.network',
      apiUrl: 'https://testnet.blockscout.injective.network/api',
    },
  },
  testnet: true,
})
