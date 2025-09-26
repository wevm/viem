import { defineChain } from '../../utils/chain/defineChain.js'

export const plasmaTestnet = /*#__PURE__*/ defineChain({
  id: 9746,
  name: 'Plasma Testnet',
  nativeCurrency: {
    name: 'Testnet Plasma',
    symbol: 'XPL',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.plasma.to'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RouteScan',
      url: 'https://testnet.plasmascan.to',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  testnet: true,
})
