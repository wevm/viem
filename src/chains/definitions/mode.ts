import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

export const mode = /*#__PURE__*/ defineChain({
  id: 34443,
  name: 'Mode Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.mode.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Modescan',
      url: 'https://modescan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 2465882,
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x4317ba146D4933D889518a3e5E11Fe7a53199b04',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x8B34b14c7c7123459Cf3076b8Cb929BE097d0C07',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x735aDBbE72226BD52e818E7181953f42E3b0FF21',
      },
    },
  },
  sourceId,
})
