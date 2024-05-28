import type { Address } from 'abitype'
import type { OneOf } from '../../../types/utils.js'

export type AccountSigner = {
  type: 'account'
  data: {
    id: Address
  }
}

export type KeySigner = {
  type: 'key'
  data: {
    id: string
  }
}

export type MultiKeySigner = {
  type: 'keys'
  data: {
    ids: string[]
  }
}

export type Signer = OneOf<AccountSigner | KeySigner | MultiKeySigner>
