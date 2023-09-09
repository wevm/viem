import { defineChain } from '../../utils/chain.js'

export const gnosis = /*#__PURE__*/ defineChain({
  id: 100,
  name: 'Gnosis',
  network: 'gnosis',
  nativeCurrency: {
    decimals: 18,
    name: 'Gnosis',
    symbol: 'xDAI',
  },
  rpcUrls: {
    default: { http: ['https://rpc.gnosischain.com'] },
    public: { http: ['https://rpc.gnosischain.com'] },
  },
  blockExplorers: {
    etherscan: {
      name: 'Gnosisscan',
      url: 'https://gnosisscan.io',
    },
    default: {
      name: 'Gnosis Chain Explorer',
      url: 'https://blockscout.com/xdai/mainnet',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 21022491,
    },
  },
})
