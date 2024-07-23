import { defineChain } from '../../utils/chain/defineChain.js'

export const root = /*#__PURE__*/ defineChain({
  id: 7668,
  name: 'The Root Network',
  nativeCurrency: {
    decimals: 18,
    name: 'XRP',
    symbol: 'XRP',
  },
  rpcUrls: {
    default: {
      http: ['https://root.rootnet.live/archive'],
      webSocket: ['wss://root.rootnet.live/archive/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Rootscan',
      url: 'https://rootscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xc9C2E2429AeC354916c476B30d729deDdC94988d',
      blockCreated: 9218338,
    },
    ensRegistry: { address: '0xEC58C26B8E0A4bc0fe1ad21D216e4ecAd9e037A8' },
    ensUniversalResolver: {
      address: '0x7808dF0A1F1d58c6Ad0F3bA07E749D730F02f13A',
      blockCreated: 12_519_044,
    },
  },
})
