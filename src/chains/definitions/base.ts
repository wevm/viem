import { chainConfig } from '../../op-stack/chainConfig.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 1n // mainnet

const baseDefinition = {
  ...chainConfig,
  id: 8453n,
  name: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Basescan',
      url: 'https://basescan.org',
      apiUrl: 'https://api.basescan.org/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId.toString()]: {
        address: '0x43edB88C4B80fDD2AdFF2412A7BebF9dF42cB40e',
      },
    },
    l2OutputOracle: {
      [sourceId.toString()]: {
        address: '0x56315b90c40730925ec5485cf004d835058518A0',
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 5022,
    },
    portal: {
      [sourceId.toString()]: {
        address: '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e',
        blockCreated: 17482143,
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0x3154Cf16ccdb4C6d922629664174b904d80F2C35',
        blockCreated: 17482143,
      },
    },
  },
  sourceId,
} as const

export const base = /*#__PURE__*/ Chain.define(baseDefinition)

export const basePreconf = /*#__PURE__*/ Chain.define({
  ...baseDefinition,
  preconfirmationTime: 200,
  rpcUrls: {
    default: {
      http: ['https://mainnet-preconf.base.org'],
    },
  },
})
