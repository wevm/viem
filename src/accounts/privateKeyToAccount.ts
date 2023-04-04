import { secp256k1 } from '@noble/curves/secp256k1'

import type { Hex } from '../types'
import { toHex } from '../utils'
import {
  publicKeyToAddress,
  signMessage,
  signTransaction,
  signTypedData,
} from './utils'
import { toAccount } from './toAccount'
import type { PrivateKeyAccount } from './types'

/**
 * @description Creates an Account from a private key.
 *
 * @returns A Private Key Account.
 */
export function privateKeyToAccount(privateKey: Hex): PrivateKeyAccount {
  const publicKey = toHex(secp256k1.getPublicKey(privateKey.slice(2), false))
  const address = publicKeyToAddress(publicKey)

  const account = toAccount({
    address,
    async signMessage({ message }) {
      return signMessage({ message, privateKey })
    },
    async signTransaction(transaction) {
      return signTransaction({ privateKey, transaction })
    },
    async signTypedData(typedData) {
      return signTypedData({ ...typedData, privateKey })
    },
  })

  return {
    ...account,
    publicKey,
    source: 'privateKey',
  }
}
