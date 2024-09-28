import { defineChain } from '../../utils/chain/defineChain.js'

export const milkomedaTestnet = /*#__PURE__*/ defineChain({
  id: 200101,
  name: 'Milkomeda Cardano Testnet',
  nativeCurrency: { name: 'Cardano', symbol: 'mTADA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-devnet-cardano-evm.c1.milkomeda.com'],
      webSocket: ['wss://rpc-devnet-cardano-evm.c1.milkomeda.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'C1 Milkomeda Explorer',
      url: 'https://explorer-devnet-cardano-evm.c1.milkomeda.com',
    },
  },
  testnet: true,
})
