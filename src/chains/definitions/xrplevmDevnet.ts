import * as Chain from '../../core/Chain.js'

export const xrplevmDevnet = /*#__PURE__*/ Chain.from({
  id: 1440002,
  name: 'XRPL EVM Devnet',
  nativeCurrency: {
    name: 'XRP',
    symbol: 'XRP',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.xrplevm.org/',
  },
  blockExplorers: {
    name: 'XRPLEVM Devnet Explorer',
    url: 'https://explorer.xrplevm.org/',
  },
  contracts: {
    multicall3: {
      address: '0x82Cc144D7d0AD4B1c27cb41420e82b82Ad6e9B31',
      blockCreated: 15237286,
    },
  },
  testnet: true,
})
