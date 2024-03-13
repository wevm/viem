import { formatters } from './formatters.js'
import { serializers } from './serializers.js'
import { getEip712Domain } from './utils/getEip712Domain.js'

export const chainConfig = {
  formatters,
  serializers,
  custom: {
    getEip712Domain,
  },
} as const
