import { defineChain } from '../../utils/chain/defineChain.js'

export const milkomeda = /*#__PURE__*/ defineChain({
  id: 2001,
  name: 'Milkomeda Cardano',
  nativeCurrency: { name: 'Cardano', symbol: 'mADA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['wss://rpc-mainnet-cardano-evm.c1.milkomeda.com'],
      webSocket: ['wss://rpc-mainnet-cardano-evm.c1.milkomeda.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'C1 Milkomeda Explorer',
      url: 'https://explorer-mainnet-cardano-evm.c1.milkomeda.com',
    },
  },
  testnet: false,
})
