import { defineChain } from '../../utils/chain/defineChain.js'

export const story = /*#__PURE__*/ defineChain({
  id: 1514,
  name: 'Story',
  nativeCurrency: {
    decimals: 18,
    name: 'IP Token',
    symbol: 'IP',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 340998,
    },
    ensRegistry: {
      address: '0x5dc881dda4e4a8d312be3544ad13118d1a04cb17',
      blockCreated: 648924,
    },
    ensUniversalResolver: {
      address: '0xddfb18888a9466688235887dec2a10c4f5effee9',
      blockCreated: 649114,
    },
  },
  rpcUrls: {
    default: { http: ['https://mainnet.storyrpc.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Story explorer',
      url: 'https://storyscan.io',
      apiUrl: 'https://storyscan.io/api/v2',
    },
  },
  ensTlds: ['.ip'],
  testnet: false,
})
