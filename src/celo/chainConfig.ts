import { contracts } from '../op-stack/contracts.js'
import { fees } from './fees.js'
import { formatters } from './formatters.js'
import { serializers } from './serializers.js'

export const chainConfig = {
  blockTime: 1_000,
  contracts,
  formatters,
  serializers,
  fees,
} as const
