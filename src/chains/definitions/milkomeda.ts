import { defineChain } from '../../utils/chain/defineChain.js'

export const milkomeda = /*#__PURE__*/ defineChain({
  id: 2001,
  name: 'Milkomeda Cardano',
  nativeCurrency: { name: 'Cardano', symbol: 'mADA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-mainnet-cardano-evm.c1.milkomeda.com'],
      webSocket: ['wss://rpc-mainnet-cardano-evm.c1.milkomeda.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'C1 Milkomeda Explorer',
      url: 'https://explorer-mainnet-cardano-evm.c1.milkomeda.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 4377424,
    },
  },
  testnet: false,
})
