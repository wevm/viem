import { defineChain } from '../../utils/chain/defineChain.js'

export const xrplevmDevnet = /*#__PURE__*/ defineChain({
  id: 1440002,
  name: 'XRPL EVM Devnet',
  nativeCurrency: {
    name: 'XRP',
    symbol: 'XRP',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.xrplevm.org/'],
    },
    public: {
      http: ['https://rpc.xrplevm.org/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'XRPLEVM Devnet Explorer',
      url: 'https://explorer.xrplevm.org/',
    },
  },
  contracts: {
    multicall3: {
      address: '0x82Cc144D7d0AD4B1c27cb41420e82b82Ad6e9B31',
      blockCreated: 15237286,
    },
  },
  testnet: true,
})
