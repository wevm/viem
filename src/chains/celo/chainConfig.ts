import { fees } from './fees.js'
import { formatters } from './formatters.js'
import { serializers } from './serializers.js'

export const chainConfig = {
  formatters,
  serializers,
  fees,
} as const
