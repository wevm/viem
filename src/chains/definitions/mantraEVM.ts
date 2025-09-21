import { defineChain } from '../../utils/chain/defineChain.js'

export const mantraEVM = /*#__PURE__*/ defineChain({
  id: 5888,
  name: 'MANTRA EVM',
  nativeCurrency: {
    decimals: 18,
    name: 'OM',
    symbol: 'OM',
  },
  rpcUrls: {
    default: {
      http: ['https://evm.mantrachain.io'],
      webSocket: ['https://evm.mantrachain.io/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MANTRA Scan',
      url: 'https://mantrascan.io/mainnet',
    },
  },
  contracts: {
    create2: {
      address: '0x4e59b44847b379578588920cA78FbF26c0B4956C',
      blockCreated: 8618895,
    },
    createx: {
      address: '0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed',
      blockCreated: 8618896,
    },
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 8618897,
    },
    // https://eips.ethereum.org/EIPS/eip-2935
    historyStorage: {
      address: '0x0000f90827f1c53a10cb7a02335b175320002935',
      blockCreated: 8618894,
    },
  },
})
