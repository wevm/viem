import { chainConfig } from '../../op-stack/chainConfig.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 1n // mainnet

export const funkiMainnet = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 33979n,
  name: 'Funki',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-mainnet.funkichain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Funki Mainnet Explorer',
      url: 'https://funkiscan.io',
    },
  },
  contracts: {
    ...chainConfig.contracts,
  },
  sourceId,
})
