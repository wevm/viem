import { describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { baseZkSyncTestClient } from '~test/src/zksync.js'
import type { TransactionRequestBase } from '~viem/index.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { parseGwei } from '../../../utils/unit/parseGwei.js'
import { signTransaction } from './signTransaction.js'

const sourceAccount = accounts[0]

const base: TransactionRequestBase = {
  from: '0x0000000000000000000000000000000000000000',
  gas: 21000n,
  nonce: 785,
}

describe('custom (eip712)', () => {
  const walletClient = baseZkSyncTestClient

  test('default', async () => {
    expect(
      await signTransaction(walletClient, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: walletClient.chain,
        ...base,
        maxFeePerGas: parseGwei('20'),
        maxPriorityFeePerGas: parseGwei('2'),
        paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
        paymasterInput:
          '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
        type: 'eip712',
      }),
    ).toMatchInlineSnapshot(
      '"0x71f8d382031184773594008504a817c80082520880800182012c808082012c94000000000000000000000000000000000000000080c0b8416d8ea3cb44cd5ec697b1236d826cb8c34660577037da544866f54faf7b76ed5d65ee662df4f4be6b2eaaef0b2224eb508bec21dcb34eea93871af2efbb856b6f1cf85b94fd9ae5ebb0f6656f4b77a0e99dcbc5138d54b0bab8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"',
    )
  })
})
