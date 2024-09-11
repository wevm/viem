import { fees } from './fees.js'
import { formatters } from './formatters.js'
import { serializers } from './serializers.js'
import { contracts } from '../op-stack/contracts.js'

export const chainConfig = {
  contracts,
  formatters,
  serializers,
  fees,
} as const
