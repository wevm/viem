import { getPublicKey } from '@noble/secp256k1'
import type { Hex } from '../types'
import { toHex } from '../utils'
import { publicKeyToAddress, signMessage, signTypedData } from './utils'
import { toAccount } from './toAccount'
import type { LocalAccount } from './types'

export type PrivateKeyAccount = LocalAccount<'privateKey'>

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
    async signTypedData(typedData) {
      return signTypedData({ ...typedData, privateKey })
    },
  })

  return {
    ...account,
    getPrivateKey: () => privateKey,
    publicKey,
    source: 'privateKey',
  }
}
