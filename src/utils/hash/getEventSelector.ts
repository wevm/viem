import type { EventDefinition } from '../../types/contract.js'
import { AbiEvent } from 'abitype'

import { hashAbiEvent, hashFunction } from './hashFunction.js'

export const getEventSelector = (event: EventDefinition | AbiEvent) => {
  if (typeof event === 'string') return hashFunction(event)
  return hashAbiEvent(event)
}
