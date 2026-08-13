import { tempoModerato } from '../../chains/definitions/tempoModerato.js'

export const messenger = {
  [tempoModerato.id]: {
    1: '0x254356112cCf6f32fAd84F16CC5E0A0cCA17Beb7',
  },
} as const satisfies Record<number, Record<number, `0x${string}`>>

export const portal = {
  [tempoModerato.id]: {
    1: '0x59831A17340EE14FE136d751EfbeA8b630470fD2',
    6: '0x7069DeC4E64Fd07334A0933eDe836C17259c9B23',
    7: '0x3F5296303400B56271b476F5A0B9cBF74350D6Ac',
  },
} as const satisfies Record<number, Record<number, `0x${string}`>>
