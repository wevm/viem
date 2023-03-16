import type { EventDefinition } from '../../types'
import { hashFunction } from './hashFunction'

export const getEventSelector = (event: EventDefinition) => hashFunction(event)
