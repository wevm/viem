import { getPublicKey } from '@noble/secp256k1'
import type { Hex } from '../types'
import { toHex } from '../utils'
import { publicKeyToAddress, signMessage } from './utils'
import { LocalAccount, toAccount } from './toAccount'

export type PrivateKeyAccount = LocalAccount<'privateKey'> & {
  publicKey: Hex
  getPrivateKey(): Hex
}

export function privateKeyToAccount(privateKey: Hex): PrivateKeyAccount {
  const publicKey = toHex(getPublicKey(privateKey.slice(2)))
  const address = publicKeyToAddress(publicKey)

  const account = toAccount({
    address,
    async signMessage({ message }) {
      return signMessage({ message, privateKey })
    },
    async signTransaction(_transaction) {
      // TODO
      return '0x'
    },
    async signTypedData(_data) {
      // TODO
      return '0x'
    },
  })
  return {
    ...account,
    getPrivateKey: () => privateKey,
    publicKey,
    source: 'privateKey',
  }
}
