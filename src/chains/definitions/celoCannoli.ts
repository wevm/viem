import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../celo/chainConfig.js'

export const celoCannoli = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 17_323,
  name: 'Cannoli',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'C-CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://forno.cannoli.celo-testnet.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Celo Explorer',
      url: 'https://explorer.celo.org/cannoli',
    },
  },
  contracts: {
    multicall3: {
      address: '0x5Acb0aa8BF4E8Ff0d882Ee187140713C12BF9718',
      blockCreated: 87429,
    },
  },
  testnet: true,
})
