import { secp256k1 } from '@noble/curves/secp256k1'

import type { Hex } from '../types/misc.js'
import { toHex } from '../utils/encoding/toHex.js'

import { toAccount } from './toAccount.js'
import type { PrivateKeyAccount } from './types.js'
import { publicKeyToAddress } from './utils/publicKeyToAddress.js'
import { signMessage } from './utils/signMessage.js'
import { signTransaction } from './utils/signTransaction.js'
import { signTypedData } from './utils/signTypedData.js'

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
