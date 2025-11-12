import { defineChain } from '../../utils/chain/defineChain.js'

export const jasmyChainTestnet = /*#__PURE__*/ defineChain({
  id: 681,
  name: 'Jasmy Chain Testnet',
  network: 'jasmyChainTestnet',
  nativeCurrency: { name: 'JasmyCoin', symbol: 'JASMY', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc_testnet.jasmychain.io'],
      webSocket: ['wss://rpc_testnet.jasmychain.io'],
    },
  },
  testnet: true,
})
