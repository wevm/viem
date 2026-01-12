import { defineChain } from '../../utils/chain/defineChain.js'

export const dogeosTestnet = /*#__PURE__*/ defineChain({
  id: 6_281_971,
  name: 'DogeOS Chikyu Testnet',
  nativeCurrency: {
    name: 'DOGE',
    symbol: 'DOGE',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.dogeos.com'] },
  },
  blockExplorers: {
    default: {
      name: 'DogeOS Chikyu Testnet',
      url: 'https://blockscout.testnet.dogeos.com',
    },
  },
  contracts: {},
  testnet: true,
})
