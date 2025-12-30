import type { DefaultCapabilitiesSchema } from '../types/capabilities.js'
import type { ExactPartial } from '../types/utils.js'
import type { TransactionRequestTempo } from './Transaction.js'

export type Schema = Omit<DefaultCapabilitiesSchema, 'sendCalls'> & {
  sendCalls: {
    Request: ExactPartial<TransactionRequestTempo>
  }
}
