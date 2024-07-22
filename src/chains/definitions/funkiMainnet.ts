import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

export const funkiMainnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 33979,
  network: 'funkiMainnet',
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
    l2OutputOracleProxy: {
      [sourceId]: {
        address: '0x1A9aE6486caEc0504657351ac473B3dF8A1367cb',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x64F1e21412f61e9Ceda3b65FcFC5A4739c7eBBeE',
        blockCreated: 20325722,
      },
    },
  },
  sourceId,
})