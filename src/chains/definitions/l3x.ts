import { defineChain } from '../../utils/chain/defineChain.js'

export const l3x = /*#__PURE__*/ defineChain({
  id: 12324,
  name: 'L3X Protocol',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-mainnet.l3x.com'],
      webSocket: ['wss://rpc-mainnet.l3x.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'L3X Mainnet Explorer',
      url: 'https://explorer.l3x.com',
      apiUrl: 'https://explorer.l3x.com/api/v2',
    },
  },
  contracts: {
    multicall3: {
      address: '0xA9cfB51510b18300cf056d7e0b96925a1D11f424',
      blockCreated: 0,
    },
  },
  testnet: false,
})
