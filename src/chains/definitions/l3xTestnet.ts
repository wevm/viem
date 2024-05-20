import { defineChain } from '../../utils/chain/defineChain.js'

export const l3xTestnet = /*#__PURE__*/ defineChain({
  id: 12325,
  name: 'L3X Protocol Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.l3x.com'],
      webSocket: ['wss://rpc-testnet.l3x.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'L3X Testnet Explorer',
      url: 'https://explorer-testnet.l3x.com',
      apiUrl: 'https://explorer-testnet.l3x.com/api/v2',
    },
  },
  contracts: {
    multicall3: {
      address: '0xa8D4b59f0FB23CB785d360E73C7364dDB3e34A62',
      blockCreated: 0,
    },
  },
  testnet: true,
})
