import { defineChain } from '../../utils/chain/defineChain.js'

export const katana = /*#__PURE__*/ defineChain({
  id: 747474,
  name: 'Katana',
  network: 'katana',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.katana.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'katana explorer',
      url: 'https://explorer.katanarpc.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1898013,
    },
  },
  testnet: false,
})
