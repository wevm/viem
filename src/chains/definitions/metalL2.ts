import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

export const metalL2 = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 1750,
  name: 'Metal L2',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.metall2.com'],
      webSocket: ['wss://rpc.metall2.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://explorer.metall2.com',
      apiUrl: 'https://explorer.metall2.com/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId]: {
        address: '0x3B1F7aDa0Fcc26B13515af752Dd07fB1CAc11426',
      },
    },
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
    portal: {
      [sourceId]: {
        address: '0x3F37aBdE2C6b5B2ed6F8045787Df1ED1E3753956',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x6d0f65D59b55B0FEC5d2d15365154DcADC140BF3',
      },
    },
  },
  sourceId,
})
