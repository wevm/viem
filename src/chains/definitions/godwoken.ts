import { defineChain } from '../../utils/chain/defineChain.js'

export const godwoken = /*#__PURE__*/ defineChain({
  id: 71402,
  name: 'Godwoken Mainnet',
  nativeCurrency: { decimals: 18, name: 'pCKB', symbol: 'pCKB' },
  rpcUrls: {
    default: {
      http: ['https://v1.mainnet.godwoken.io/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'GW Scan',
      url: 'https://v1.gwscan.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 15034,
    },
  },
  testnet: false,
})
