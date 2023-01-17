import { hashFunction } from './hashFunction'

export const getEventSignature = (event: `${string}(${string})`) =>
  hashFunction(event)
