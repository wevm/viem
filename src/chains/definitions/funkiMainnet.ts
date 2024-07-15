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
      url: 'https://funki.superscan.network/',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId]: {
        address: '0xAE8C70Ce804b8F503c75033DF9b8B7Dde2e9e27e',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x175036309990613eB44c69E9859c0AB6Bc586574',
        blockCreated: 20288753,
      },
    },
  },
  sourceId,
})
