import { defineChain } from '../../utils/chain/defineChain.js'

export const mantleTestnet = /*#__PURE__*/ defineChain({
  id: 5001,
  name: 'Mantle Testnet',
  network: 'mantle',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.mantle.xyz'] },
    public: { http: ['https://rpc.testnet.mantle.xyz'] },
  },
  blockExplorers: {
    etherscan: {
      name: 'Mantle Testnet Explorer',
      url: 'https://explorer.testnet.mantle.xyz',
    },
    default: {
      name: 'Mantle Testnet Explorer',
      url: 'https://explorer.testnet.mantle.xyz',
    },
  },
  testnet: true,
})
