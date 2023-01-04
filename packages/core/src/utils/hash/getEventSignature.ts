import { hashDefinition } from './hashDefinition'

export const getEventSignature = (event: `${string}(${string})`) =>
  hashDefinition(event)
