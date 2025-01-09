import { defineChain } from '../../utils/chain/defineChain.js'

export const bharatBlockchainNetworkTestnet = /*#__PURE__*/ defineChain({
  id: 7099,
  name: 'Bharat Blockchain Network',
  nativeCurrency: { name: 'BBNT', symbol: 'BBN', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://bbnrpc.testnet.bharatblockchain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: '',
      url: '',
    },
  },
  testnet: true,
})
