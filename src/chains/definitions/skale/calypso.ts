import * as Chain from '../../../core/Chain.js'

export const skaleCalypso = /*#__PURE__*/ Chain.define({
  id: 1_564_830_818n,
  name: 'SKALE Calypso Hub',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague'],
      webSocket: [
        'wss://mainnet.skalenodes.com/v1/ws/honorable-steel-rasalhague',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'SKALE Explorer',
      url: 'https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 3_107_626,
    },
  },
})
