// Generated with `pnpm gen:tokenlist`. Do not modify manually.

import type { Tokens } from './defineToken.js'
import { alphausd } from './definitions/alphausd.js'
import { betausd } from './definitions/betausd.js'
import { brla } from './definitions/brla.js'
import { cbbtc } from './definitions/cbbtc.js'
import { chfau } from './definitions/chfau.js'
import { cirbtc } from './definitions/cirbtc.js'
import { cusd } from './definitions/cusd.js'
import { dlusd } from './definitions/dlusd.js'
import { eurau } from './definitions/eurau.js'
import { eurc } from './definitions/eurc.js'
import { eurce } from './definitions/eurce.js'
import { frxusd } from './definitions/frxusd.js'
import { gbpa } from './definitions/gbpa.js'
import { gusd } from './definitions/gusd.js'
import { iusd } from './definitions/iusd.js'
import { pathusd } from './definitions/pathusd.js'
import { reusd } from './definitions/reusd.js'
import { rusd } from './definitions/rusd.js'
import { sbc } from './definitions/sbc.js'
import { siusd } from './definitions/siusd.js'
import { stcusd } from './definitions/stcusd.js'
import { susde } from './definitions/susde.js'
import { syrupusdc } from './definitions/syrupusdc.js'
import { thetausd } from './definitions/thetausd.js'
import { usd1 } from './definitions/usd1.js'
import { usdb } from './definitions/usdb.js'
import { usdc } from './definitions/usdc.js'
import { usdce } from './definitions/usdce.js'
import { usde } from './definitions/usde.js'
import { usdt } from './definitions/usdt.js'
import { usdt0 } from './definitions/usdt0.js'
import { usyc } from './definitions/usyc.js'
import { wsrusd } from './definitions/wsrusd.js'

/** Every token definition. */
const all = [
  alphausd,
  betausd,
  brla,
  cbbtc,
  chfau,
  cirbtc,
  cusd,
  dlusd,
  eurau,
  eurc,
  eurce,
  frxusd,
  gbpa,
  gusd,
  iusd,
  pathusd,
  reusd,
  rusd,
  sbc,
  siusd,
  stcusd,
  susde,
  syrupusdc,
  thetausd,
  usd1,
  usdb,
  usdc,
  usdce,
  usde,
  usdt,
  usdt0,
  usyc,
  wsrusd,
] as const satisfies Tokens

/** Tokens flagged as popular. */
const popular = [usdc] as const satisfies Tokens

/** All tokens available on Tempo chains. */
const tempo = [
  alphausd,
  betausd,
  brla,
  cbbtc,
  chfau,
  cusd,
  dlusd,
  eurau,
  eurce,
  frxusd,
  gbpa,
  gusd,
  iusd,
  pathusd,
  reusd,
  rusd,
  sbc,
  siusd,
  stcusd,
  susde,
  syrupusdc,
  thetausd,
  usd1,
  usdb,
  usdce,
  usde,
  usdt0,
  wsrusd,
] as const satisfies Tokens

/** Curated token sets that can be passed to a Client's `tokens` property. */
export const tokens = { all, popular, tempo }
