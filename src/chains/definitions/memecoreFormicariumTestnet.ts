import { defineChain } from '../../utils/chain/defineChain.js'

export const formicarium = /*#__PURE__*/ defineChain({
  id: 43521,
  name: 'Formicarium',
  nativeCurrency: {
    decimals: 18,
    name: 'M',
    symbol: 'M',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.formicarium.memecore.net'],
      webSocket: ['wss://ws.formicarium.memecore.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MemeCore Testnet Explorer',
      url: 'https://formicarium.memecorescan.io',
    },
    okx: {
      name: 'MemeCore Testnet Explorer',
      url: 'https://web3.okx.com/explorer/formicarium-testnet',
    },
    memecore: {
      name: 'MemeCore Testnet Explorer',
      url: 'https://formicarium.blockscout.memecore.com',
      apiUrl: 'https://formicarium.blockscout.memecore.com/api',
    },
  },
  testnet: true,
})
