import type { Hash } from '../../types/misc.js'

export type MessageProof = {
  id: number
  proof: Hash[]
  root: Hash
}
