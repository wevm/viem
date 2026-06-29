import { chainConfig } from '../../tempo/chainConfig.js'
import { brla } from '../../tokens/definitions/brla.js'
import { cbbtc } from '../../tokens/definitions/cbbtc.js'
import { chfau } from '../../tokens/definitions/chfau.js'
import { cusd } from '../../tokens/definitions/cusd.js'
import { dlusd } from '../../tokens/definitions/dlusd.js'
import { eurau } from '../../tokens/definitions/eurau.js'
import { eurce } from '../../tokens/definitions/eurce.js'
import { frxusd } from '../../tokens/definitions/frxusd.js'
import { gbpa } from '../../tokens/definitions/gbpa.js'
import { gusd } from '../../tokens/definitions/gusd.js'
import { iusd } from '../../tokens/definitions/iusd.js'
import { pathusd } from '../../tokens/definitions/pathusd.js'
import { reusd } from '../../tokens/definitions/reusd.js'
import { rusd } from '../../tokens/definitions/rusd.js'
import { sbc } from '../../tokens/definitions/sbc.js'
import { siusd } from '../../tokens/definitions/siusd.js'
import { stcusd } from '../../tokens/definitions/stcusd.js'
import { susde } from '../../tokens/definitions/susde.js'
import { syrupusdc } from '../../tokens/definitions/syrupusdc.js'
import { usd1 } from '../../tokens/definitions/usd1.js'
import { usdb } from '../../tokens/definitions/usdb.js'
import { usdce } from '../../tokens/definitions/usdce.js'
import { usde } from '../../tokens/definitions/usde.js'
import { usdt0 } from '../../tokens/definitions/usdt0.js'
import { wsrusd } from '../../tokens/definitions/wsrusd.js'
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
    pathusd: pathusd(4217),
    usdce: usdce(4217),
    eurce: eurce(4217),
    usdt0: usdt0(4217),
    frxusd: frxusd(4217),
    cusd: cusd(4217),
    stcusd: stcusd(4217),
    gusd: gusd(4217),
    rusd: rusd(4217),
    wsrusd: wsrusd(4217),
    eurau: eurau(4217),
    reusd: reusd(4217),
    iusd: iusd(4217),
    siusd: siusd(4217),
    usde: usde(4217),
    susde: susde(4217),
    sbc: sbc(4217),
    syrupusdc: syrupusdc(4217),
    cbbtc: cbbtc(4217),
    usdb: usdb(4217),
    usd1: usd1(4217),
    dlusd: dlusd(4217),
    chfau: chfau(4217),
    brla: brla(4217),
    gbpa: gbpa(4217),
  },
})
