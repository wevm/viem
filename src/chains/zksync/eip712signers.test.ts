import { describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { signTransaction } from '../../accounts/utils/signTransaction.js'
import { type TransactionSerializableEIP1559, parseEther } from '../../index.js'
import { zkSyncTestnet } from '../index.js'
import { getZkSyncEIP712Domain } from './eip712signers.js'
import { serializeTransactionZkSync } from './serializers.js'
import type { ZkSyncTransactionSerializableEIP712 } from './types.js'

const baseTransaction: TransactionSerializableEIP1559 = {
  to: '0x111C3E89Ce80e62EE88318C2804920D4c96f92bb',
  chainId: zkSyncTestnet.id,
  nonce: 7,
  maxFeePerGas: 250000000n,
  maxPriorityFeePerGas: 2n,
  value: parseEther('1'),
  data: '0xa4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000',
}

const baseEip712 = {
  ...baseTransaction,
  from: '0xf760bdd822fccf93c44be68d94c45133002b3037',
  gasPerPubdata: 50000n,
  factoryDeps: [],
  paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021',
  paymasterInput:
    '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
  type: 'eip712',
}

describe('ZkSync - EIP712 Signer', () => {
  test('should be able to generate customSigner', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseEip712,
      gas: 158774n,
    }

    expect(getZkSyncEIP712Domain(transaction)).toMatchInlineSnapshot('')
  })
})

// TODO: Want to make sure it call signedType if it is an EIP712
test('signed', async () => {
  const signed = await signTransaction({
    privateKey: accounts[0].privateKey,
    transaction: baseEip712,
    serializer: serializeTransactionZkSync,
  })

  expect(signed).toEqual('')
})
