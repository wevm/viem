import type { Address } from 'abitype'
import type { Hash } from './misc.js'

type AccountProof = Hash

type StorageProof<quantity = bigint> = {
  key: Hash
  proof: Hash[]
  value: quantity
}

export type Proof<quantity = bigint, index = number> = {
  address: Address
  balance: quantity
  codeHash: Hash
  nonce: index
  storageHash: Hash
  accountProof: AccountProof[]
  storageProof: StorageProof<quantity>[]
}
