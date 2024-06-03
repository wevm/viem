import { defineChain } from '../../utils/chain/defineChain.js'

export const bitkub = /*#__PURE__*/ defineChain({
  id: 96,
  name: 'Bitkub',
  network: 'Bitkub',
  nativeCurrency: { name: 'Bitkub', symbol: 'KUB', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.bitkubchain.io'],
    },
    public: {
      http: ['https://rpc.bitkubchain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Bitkub Chain Mainnet Explorer',
      url: 'https://www.bkcscan.com',
      apiUrl: 'https://www.bkcscan.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0x45Ed3FFA3903cf3c7D740aE2A9b7C7f0fFCe61Fe',
      blockCreated: 15967658,
    },
  },
  testnet: false,
})
