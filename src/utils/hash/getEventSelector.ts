import { EventDefinition } from '../../types'
import { hashAbiItem } from './hashAbiItem'

export const getEventSelector = (event: EventDefinition) =>
  hashAbiItem(event, 'event')
