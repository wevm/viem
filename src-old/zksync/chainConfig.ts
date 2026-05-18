import { formatters } from './formatters.js'
import { serializers } from './serializers.js'
import { getEip712Domain } from './utils/getEip712Domain.js'

export const chainConfig = {
  blockTime: 1_000,
  formatters,
  serializers,
  custom: {
    getEip712Domain,
  },
} as const
