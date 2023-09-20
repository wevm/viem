import type { AbiEvent } from 'abitype'

import { toBytes } from '../encoding/toBytes.js'
import { getEventSignature } from './getEventSignature.js'
import { keccak256 } from './keccak256.js'

const hash = (value: string) => keccak256(toBytes(value))

export const getEventSelector = (fn: string | AbiEvent) =>
  hash(getEventSignature(fn))
