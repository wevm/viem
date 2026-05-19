import { chainConfig } from '../../op-stack/chainConfig.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 1n // mainnet

export const lisk = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 1135n,
  name: 'Lisk',
  network: 'lisk',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.api.lisk.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout.lisk.com',
      apiUrl: 'https://blockscout.lisk.com/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId.toString()]: {
        address: '0x0CF7D3706a27CCE2017aEB11E8a9c8b5388c282C',
      },
    },
    multicall3: {
      address: '0xA9d71E1dd7ca26F26e656E66d6AA81ed7f745bf0',
    },
    l2OutputOracle: {
      [sourceId.toString()]: {
        address: '0x113cB99283AF242Da0A0C54347667edF531Aa7d6',
      },
    },
    portal: {
      [sourceId.toString()]: {
        address: '0x26dB93F8b8b4f7016240af62F7730979d353f9A7',
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0x2658723Bf70c7667De6B25F99fcce13A16D25d08',
      },
    },
  },
  sourceId,
})
