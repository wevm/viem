import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../../op-stack/chainConfig.js'

const sourceId = 1 // mainnet

export const funkiMainnet = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 33979,
  name: 'Funki',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc-mainnet.funkichain.com',
  },
  blockExplorers: {
    name: 'Funki Mainnet Explorer',
    url: 'https://funkiscan.io',
  },
  contracts: chainConfig.contracts,
  sourceId,
})
