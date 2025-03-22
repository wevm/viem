import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const zircuitGarfieldTestnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 48898,
  name: 'Zircuit Garfield Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://garfield-testnet.zircuit.com/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Zircuit Garfield Testnet Explorer',
      url: 'https://explorer.garfield-testnet.zircuit.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0xd69D3AC5CA686cCF94b258291772bc520FEAf211',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x4E21A71Ac3F7607Da5c06153A17B1DD20E702c21',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x87a7E2bCA9E35BA49282E832a28A6023904460D8',
      },
    },
  },
  testnet: true,
})
