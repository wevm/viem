import { defineChain } from '../../utils/chain/defineChain.js'

export const zetachain = /*#__PURE__*/ defineChain({
  id: 7000,
  name: 'ZetaChain',
  nativeCurrency: {
    decimals: 18,
    name: 'Zeta',
    symbol: 'ZETA',
  },
  rpcUrls: {
    default: {
      http: ['https://zetachain-evm.blockpi.network/v1/rpc/public'],
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1632781,
    },
  },
  blockExplorers: {
    default: {
      name: 'ZetaScan',
      url: 'https://zetascan.com',
    },
  },
  testnet: false,
})
