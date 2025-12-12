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
      address: '0x6B5eFbC0C82eBb26CA13a4F11836f36Fc6fdBC5D',
      blockCreated: 912208,
    },
  },
  testnet: false,
})
