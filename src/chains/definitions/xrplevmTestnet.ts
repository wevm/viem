import * as Chain from '../../core/Chain.js'

export const xrplevmTestnet = /*#__PURE__*/ Chain.from({
  id: 1449000,
  name: 'XRPL EVM Testnet',
  nativeCurrency: {
    name: 'XRP',
    symbol: 'XRP',
    decimals: 18,
  },
  rpcUrls: { http: 'https://rpc.testnet.xrplevm.org' },
  blockExplorers: {
    name: 'blockscout',
    url: 'https://explorer.testnet.xrplevm.org',
    apiUrl: 'https://explorer.testnet.xrplevm.org/api/v2',
  },
  contracts: {
    multicall3: {
      address: '0x82Cc144D7d0AD4B1c27cb41420e82b82Ad6e9B31',
      blockCreated: 492302,
    },
  },
  testnet: true,
})
