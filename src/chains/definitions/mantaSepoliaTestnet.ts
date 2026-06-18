import * as Chain from '../../core/Chain.js'

export const mantaSepoliaTestnet = /*#__PURE__*/ Chain.from({
  id: 3_441_006,
  name: 'Manta Pacific Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://pacific-rpc.sepolia-testnet.manta.network/http'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Manta Sepolia Testnet Explorer',
      url: 'https://pacific-explorer.sepolia-testnet.manta.network',
      apiUrl: 'https://pacific-explorer.sepolia-testnet.manta.network/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca54918f7B525C8df894668846506767412b53E3',
      blockCreated: 479584,
    },
  },
  testnet: true,
})
