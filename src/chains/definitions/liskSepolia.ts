import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'
import { chainConfig } from '../../op-stack/chainConfig.js'

const sourceId = 11_155_111 // sepolia

export const liskSepolia = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 4202,
  name: 'Lisk Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.sepolia-api.lisk.com',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://sepolia-blockscout.lisk.com',
    apiUrl: 'https://sepolia-blockscout.lisk.com/api',
  },
  contracts: {
    ...chainConfig.contracts,
    create2: Contracts.create2,
    l2OutputOracle: {
      [sourceId]: {
        address: '0xA0E35F56C318DE1bD5D9ca6A94Fe7e37C5663348',
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
    portal: {
      [sourceId]: {
        address: '0xe3d90F21490686Ec7eF37BE788E02dfC12787264',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x1Fb30e446eA791cd1f011675E5F3f5311b70faF5',
      },
    },
  },
  testnet: true,
  sourceId,
})
