import type { EventDefinition } from '../../types/index.js'
import { hashFunction } from './hashFunction.js'

export const getEventSelector = (event: EventDefinition) => hashFunction(event)
