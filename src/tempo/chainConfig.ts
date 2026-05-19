import * as Chain from '../core/Chain.js'

export const hardforks = [
  'genesis',
  't0',
  't1',
  't1a',
  't1b',
  't1c',
  't2',
  't3',
] as const

export type Hardfork = (typeof hardforks)[number]

export const chainConfig = {
  blockTime: 1_000,
  extendSchema: Chain.extendSchema<{
    feeToken?: unknown | undefined
    hardfork?: Hardfork | undefined
  }>(),
} as const
