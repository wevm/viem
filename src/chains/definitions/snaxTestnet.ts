import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const snaxTestnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 13001,
  network: 'snaxchain-testnet',
  name: 'SnaxChain Testnet',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.snaxchain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Snax Explorer',
      url: 'https://testnet-explorer.snaxchain.io',
      apiUrl: 'https://testnet-explorer.snaxchain.io/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId]: {
        address: '0x206a75d89d45F146C54020F132FF93bEDD09f55E',
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x60e3A368a4cdCEf85ffB964e372726F56A46221e',
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
    portal: {
      [sourceId]: {
        address: '0xb5afdd0E8dDF081Ef90e8A3e0c7b5798e66E954E',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0xbd37E1a59D4C00C9A46F75018dffd84061bC5f74',
      },
    },
  },
  testnet: true,
  sourceId,
})
