import { defineChain } from '../../utils/chain/defineChain.js'

export const ultron = /*#__PURE__*/ defineChain({
  id: 1231,
  name: 'Ultron Mainnet',
  nativeCurrency: { name: 'ULX', symbol: 'ULX', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://ultron-rpc.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ultron Scan',
      url: 'https://ulxscan.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xd4293a20D46211657F13C186Da6cb3125516141f',
      blockCreated: 10892598,
    },
  },
  testnet: false,
})
