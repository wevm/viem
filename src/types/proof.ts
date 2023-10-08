import type { Address, Hash } from '../_types/index.js'

export type AccountProof = Hash

export type StorageProof<TQuantity = bigint> = {
  key: Hash
  proof: Hash[]
  value: TQuantity
}

export type Proof<TQuantity = bigint, TIndex = number> = {
  address: Address
  balance: TQuantity
  codeHash: Hash
  nonce: TIndex
  storageHash: Hash
  accountProof: AccountProof[]
  storageProof: StorageProof<TQuantity>[]
}
