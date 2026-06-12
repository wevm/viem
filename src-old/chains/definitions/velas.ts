import { defineChain } from '../../utils/chain/defineChain.js'

export const velas = /*#__PURE__*/ defineChain({
  id: 106,
  name: 'Velas EVM Mainnet',
  nativeCurrency: { name: 'VLX', symbol: 'VLX', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evmexplorer.velas.com/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Velas Explorer',
      url: 'https://evmexplorer.velas.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 55883577,
    },
  },
  testnet: false,
})
