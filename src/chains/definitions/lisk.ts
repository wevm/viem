import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

export const lisk = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 1135,
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
    multicall3: {
      address: '0xA9d71E1dd7ca26F26e656E66d6AA81ed7f745bf0',
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x113cB99283AF242Da0A0C54347667edF531Aa7d6',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x26dB93F8b8b4f7016240af62F7730979d353f9A7',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x2658723Bf70c7667De6B25F99fcce13A16D25d08',
      },
    },
  },
  sourceId,
})
