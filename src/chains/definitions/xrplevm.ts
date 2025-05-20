import { defineChain } from '../../utils/chain/defineChain.js'

export const xrplevm = /*#__PURE__*/ defineChain({
  id: 1440000,
  name: 'XRPL EVM',
  nativeCurrency: {
    name: 'XRP',
    symbol: 'XRP',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.xrplevm.org'] },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://explorer.xrplevm.org',
      apiUrl: 'https://explorer.xrplevm.org/api/v2',
    },
  },
  contracts: {
    multicall3: {
      address: '0x82Cc144D7d0AD4B1c27cb41420e82b82Ad6e9B31', // missing deployment
      blockCreated: 492302,
    },
  },
  testnet: false,
})
