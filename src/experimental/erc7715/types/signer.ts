import type { Address } from 'abitype'
import type { OneOf } from '../../../types/utils.js'

/** @internal */
export type AccountSigner = {
  type: 'account'
  data: {
    id: Address
  }
}

/** @internal */
export type KeySigner = {
  type: 'key'
  data: {
    id: string
  }
}

/** @internal */
export type MultiKeySigner = {
  type: 'keys'
  data: {
    ids: string[]
  }
}

export type Signer = OneOf<AccountSigner | KeySigner | MultiKeySigner>
