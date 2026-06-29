import { chainConfig } from '../../tempo/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

export const tempo = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 4217,
  blockExplorers: {
    default: {
      name: 'Tempo Explorer',
      url: 'https://explore.tempo.xyz',
    },
  },
  name: 'Tempo Mainnet',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.tempo.xyz'],
      webSocket: ['wss://rpc.tempo.xyz'],
    },
  },
  tokens: {
    pathusd: {
      address: '0x20c0000000000000000000000000000000000000',
      decimals: 6,
      name: 'PathUSD',
      symbol: 'pathUSD',
    },
    usdce: {
      address: '0x20c000000000000000000000b9537d11c60e8b50',
      decimals: 6,
      name: 'Bridged USDC (Stargate)',
      symbol: 'USDC.e',
    },
    eurce: {
      address: '0x20c0000000000000000000001621e21f71cf12fb',
      decimals: 6,
      name: 'Bridged EURC (Stargate)',
      symbol: 'EURC.e',
    },
    usdt0: {
      address: '0x20c00000000000000000000014f22ca97301eb73',
      decimals: 6,
      name: 'USDT0',
      symbol: 'USDT0',
    },
    frxusd: {
      address: '0x20c0000000000000000000003554d28269e0f3c2',
      decimals: 6,
      name: 'Frax USD',
      symbol: 'frxUSD',
    },
    cusd: {
      address: '0x20c0000000000000000000000520792dcccccccc',
      decimals: 6,
      name: 'Cap USD',
      symbol: 'cUSD',
    },
    stcusd: {
      address: '0x20c0000000000000000000008ee4fcff88888888',
      decimals: 6,
      name: 'Staked Cap USD',
      symbol: 'stcUSD',
    },
    gusd: {
      address: '0x20c0000000000000000000005c0bac7cef389a11',
      decimals: 6,
      name: 'Generic USD',
      symbol: 'GUSD',
    },
    rusd: {
      address: '0x20c0000000000000000000007f7ba549dd0251b9',
      decimals: 6,
      name: 'Reservoir Stablecoin',
      symbol: 'rUSD',
    },
    wsrusd: {
      address: '0x20c000000000000000000000aeed2ec36a54d0e5',
      decimals: 6,
      name: 'Wrapped Savings rUSD',
      symbol: 'wsrUSD',
    },
    eurau: {
      address: '0x20c0000000000000000000009a4a4b17e0dc6651',
      decimals: 6,
      name: 'AllUnity EUR',
      symbol: 'EURAU',
    },
    reusd: {
      address: '0x20c000000000000000000000383a23bacb546ab9',
      decimals: 6,
      name: 'Re Protocol reUSD',
      symbol: 'reUSD',
    },
    iusd: {
      address: '0x20c000000000000000000000ab02d39df30bd17e',
      decimals: 6,
      name: 'InfiniFi USD',
      symbol: 'iUSD',
    },
    siusd: {
      address: '0x20c000000000000000000000048c8f36df1c9a4a',
      decimals: 6,
      name: 'InfiniFi Staked USD',
      symbol: 'siUSD',
    },
    usde: {
      address: '0x20c0000000000000000000002f52d5cc21a3207b',
      decimals: 6,
      name: 'USDe',
      symbol: 'USDe',
    },
    susde: {
      address: '0x20c000000000000000000000bd95bfb69fbe6ce3',
      decimals: 6,
      name: 'Staked USDe',
      symbol: 'sUSDe',
    },
    sbc: {
      address: '0x20c000000000000000000000ae247a1130450f09',
      decimals: 6,
      name: 'Stable Coin',
      symbol: 'SBC',
    },
    syrupusdc: {
      address: '0x20c0000000000000000000008191667423f70e67',
      decimals: 6,
      name: 'Syrup USDC',
      symbol: 'syrupUSDC',
    },
    cbbtc: {
      address: '0x20c000000000000000000000c412ec89d0c08be5',
      decimals: 6,
      name: 'Coinbase Wrapped BTC',
      symbol: 'cbBTC',
    },
    usdb: {
      address: '0x20c0000000000000000000003158081efd85bfc2',
      decimals: 6,
      name: 'USDBridge',
      symbol: 'USDB',
    },
    usd1: {
      address: '0x20c000000000000000000000111111111e910f0f',
      decimals: 6,
      name: 'USD1',
      symbol: 'USD1',
    },
    dlusd: {
      address: '0x20c0000000000000000000006fd9a167923ba194',
      decimals: 6,
      name: 'Deel USD',
      symbol: 'DLUSD',
    },
    chfau: {
      address: '0x20c00000000000000000000042109aef2f8b28e1',
      decimals: 6,
      name: 'AllUnity CHF',
      symbol: 'CHFAU',
    },
    brla: {
      address: '0x20c000000000000000000000f047dd7018e50367',
      decimals: 6,
      name: 'BRLA Token',
      symbol: 'BRLA',
    },
    gbpa: {
      address: '0x20c0000000000000000000000a6da882d075a4c3',
      decimals: 6,
      name: 'Agant GBP',
      symbol: 'GBPA',
    },
  },
})
