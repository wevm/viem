import { chainConfig } from '../internal/celo.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 11_155_111n // sepolia
// source https://storage.googleapis.com/cel2-rollup-files/celo-sepolia/deployment-l1.json
export const celoSepolia = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 11_142_220n,
  name: 'Celo Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'S-CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://forno.celo-sepolia.celo-testnet.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Celo Sepolia Explorer',
      url: 'https://celo-sepolia.blockscout.com/',
      apiUrl: 'https://celo-sepolia.blockscout.com/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1,
    },
    portal: {
      [sourceId.toString()]: {
        address: '0x44ae3d41a335a7d05eb533029917aad35662dcc2',
        blockCreated: 8825790,
      },
    },
    disputeGameFactory: {
      [sourceId.toString()]: {
        address: '0x57c45d82d1a995f1e135b8d7edc0a6bb5211cfaa',
        blockCreated: 8825790,
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0xec18a3c30131a0db4246e785355fbc16e2eaf408',
        blockCreated: 8825790,
      },
    },
  },
  testnet: true,
})
