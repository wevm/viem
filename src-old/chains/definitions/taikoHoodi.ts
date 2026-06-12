import { defineChain } from '../../utils/chain/defineChain.js'

export const taikoHoodi = /*#__PURE__*/ defineChain({
  id: 167_013,
  name: 'Taiko Hoodi',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.hoodi.taiko.xyz'],
      webSocket: ['wss://ws.hoodi.taiko.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://hoodi.taikoscan.io/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 581116,
    },
  },
  testnet: true,
})
