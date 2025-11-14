import { defineChain } from '../../utils/chain/defineChain.js'

export const hemi = /*#__PURE__*/ defineChain({
  id: 43111,
  name: 'Hemi',
  network: 'Hemi',
  blockTime: 12_000,
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hemi.network/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://explorer.hemi.xyz',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
  testnet: false,
})
