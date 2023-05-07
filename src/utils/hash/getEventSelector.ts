import type { EventDefinition } from '../../types/contract.js'

import { hashFunction } from './hashFunction.js'

export const getEventSelector = (event: EventDefinition) => hashFunction(event)
