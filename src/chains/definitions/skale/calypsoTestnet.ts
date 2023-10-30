import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleCalypsoTestnet = /*#__PURE__*/ defineChain({
  id: 344_106_930,
  name: 'SKALE | Calypso NFT Hub Testnet',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://staging-v3.skalenodes.com/v1/staging-utter-unripe-menkar',
      ],
      webSocket: [
        'wss://staging-v3.skalenodes.com/v1/ws/staging-utter-unripe-menkar',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'SKALE Explorer',
      url: 'https://staging-utter-unripe-menkar.explorer.staging-v3.skalenodes.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 2131424,
    },
  },
  testnet: true,
})
