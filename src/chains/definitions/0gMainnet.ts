import * as Chain from '../../core/Chain.js'

export const zeroGMainnet = /*#__PURE__*/ Chain.define({
  id: 16_661n,
  name: '0G Mainnet',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evmrpc.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G BlockChain Explorer',
      url: 'https://chainscan.0g.ai',
    },
  },
  testnet: false,
})
