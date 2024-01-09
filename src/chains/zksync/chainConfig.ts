import { eip712domainZkSync } from './eip712signers.js'
import { formatters } from './formatters.js'
import { serializers } from './serializers.js'

export const chainConfig = {
  formatters,
  serializers,
  custom: {
    eip712domain: eip712domainZkSync,
  },
} as const
