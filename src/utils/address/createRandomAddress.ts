import type { Address } from 'abitype'
import { generatePrivateKey } from '../../accounts/generatePrivateKey.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'

export function createRandomAddress(): Address {
  return privateKeyToAccount(generatePrivateKey()).address
}
