import { defineChain } from '../../utils/chain/defineChain.js'

export const jocMainnet = /*#__PURE__*/ defineChain({
  id: 81,
  name: 'Japan Open Chain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Japan Open Chain Token',
    symbol: 'JOC',
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc-1.japanopenchain.org:8545',
        'https://rpc-2.japanopenchain.org:8545',
        'https://rpc-3.japanopenchain.org',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Block Explorer',
      url: 'https://explorer.japanopenchain.org',
    },
  },
  testnet: false,
})
