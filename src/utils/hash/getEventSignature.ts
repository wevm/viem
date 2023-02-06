import { EventDefinition } from '../../types'
import { hashFunction } from './hashFunction'

export const getEventSignature = (event: EventDefinition) => hashFunction(event)
