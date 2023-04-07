import { secp256k1 } from '@noble/curves/secp256k1'

import type { Hex } from '../types/index.js'
import { toHex } from '../utils/index.js'
import {
  publicKeyToAddress,
  signMessage,
  signTransaction,
  signTypedData,
} from './utils/index.js'
import { toAccount } from './toAccount.js'
import type { PrivateKeyAccount } from './types.js'

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
