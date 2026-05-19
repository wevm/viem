import { chainConfig } from '../../op-stack/chainConfig.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 97n // bsc testnet

export const opBNBTestnet = /*#__PURE__*/ Chain.define({
  id: 5611n,
  name: 'opBNB Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tBNB',
    symbol: 'tBNB',
  },
  rpcUrls: {
    default: { http: ['https://opbnb-testnet-rpc.bnbchain.org'] },
  },
  blockExplorers: {
    default: {
      name: 'opbnbscan',
      url: 'https://testnet.opbnbscan.com',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 3705108,
    },
    l2OutputOracle: {
      [sourceId.toString()]: {
        address: '0xFf2394Bb843012562f4349C6632a0EcB92fC8810',
      },
    },
    portal: {
      [sourceId.toString()]: {
        address: '0x4386C8ABf2009aC0c263462Da568DD9d46e52a31',
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0x677311Fd2cCc511Bbc0f581E8d9a07B033D5E840',
      },
    },
  },
  testnet: true,
  sourceId,
})
