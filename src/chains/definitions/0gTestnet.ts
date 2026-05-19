import * as Chain from '../../core/Chain.js'

export const zeroGTestnet = /*#__PURE__*/ Chain.define({
  id: 16_602n,
  name: '0G Galileo Testnet',
  nativeCurrency: { name: 'A0GI', symbol: 'A0GI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G BlockChain Explorer',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
})
