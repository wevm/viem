import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 1n // mainnet

export const soneium = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 1868n,
  name: 'Soneium Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.soneium.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://soneium.blockscout.com',
      apiUrl: 'https://soneium.blockscout.com/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId.toString()]: {
        address: '0x512a3d2c7a43bd9261d2b8e8c9c70d4bd4d503c0',
      },
    },
    l2OutputOracle: {
      [sourceId.toString()]: {
        address: '0x0000000000000000000000000000000000000000',
      },
    },
    portal: {
      [sourceId.toString()]: {
        address: '0x88e529a6ccd302c948689cd5156c83d4614fae92',
        blockCreated: 7061266,
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0xeb9bf100225c214efc3e7c651ebbadcf85177607',
        blockCreated: 7061266,
      },
    },
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1,
    },
  },
  sourceId,
})
