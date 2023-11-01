import { defineChain } from '../../utils/chain/defineChain.js'

export const manta = /*#__PURE__*/ defineChain({
  id: 169,
  name: 'Manta Pacific Mainnet',
  network: 'manta',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://pacific-rpc.manta.network/http'] },
    public: { http: ['https://pacific-rpc.manta.network/http'] },
  },
  blockExplorers: {
    etherscan: {
      name: 'Manta Explorer',
      url: 'https://pacific-explorer.manta.network',
    },
    default: {
      name: 'Manta Explorer',
      url: 'https://pacific-explorer.manta.network',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 332890,
    },
  },
})
