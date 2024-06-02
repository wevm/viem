import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'


export const dchainTestnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 2713017997578000,
  name: 'Dchain Tesnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://dchaintestnet-2713017997578000-1.jsonrpc.testnet.sagarpc.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Basescan',
      url: 'https://dchaintestnet-2713017997578000-1.testnet.sagaexplorer.io',
      apiUrl: 'https://api-dchaintestnet-2713017997578000-1.testnet.sagaexplorer.io/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
  },
})
