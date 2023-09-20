import type { AbiFunction } from 'abitype'
import { slice } from '../data/slice.js'

import { toBytes } from '../encoding/toBytes.js'
import { getFunctionSignature } from './getFunctionSignature.js'
import { keccak256 } from './keccak256.js'

const hash = (value: string) => keccak256(toBytes(value))

export const getFunctionSelector = (fn: string | AbiFunction) =>
  slice(hash(getFunctionSignature(fn)), 0, 4)
