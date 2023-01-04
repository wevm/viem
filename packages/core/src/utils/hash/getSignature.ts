import { hashDefinition } from './hashDefinition'

export const getSignature = (fn: string) => hashDefinition(fn).slice(0, 10)
