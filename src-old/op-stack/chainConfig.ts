import { contracts } from './contracts.js'
import { formatters } from './formatters.js'
import { serializers } from './serializers.js'

export const chainConfig = {
  blockTime: 2_000,
  contracts,
  formatters,
  serializers,
} as const
