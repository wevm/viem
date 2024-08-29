import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { signTransaction } from '../../accounts/utils/signTransaction.js'
import { type TransactionSerializableEIP1559, parseEther } from '../../index.js'
import { zksync } from '../../zksync/index.js'
import { serializeTransaction } from '../../zksync/serializers.js'
import type { ZksyncTransactionSerializableEIP712 } from '../types/transaction.js'
import { getEip712Domain } from './getEip712Domain.js'

const baseTransaction: TransactionSerializableEIP1559 = {
  to: '0x111C3E89Ce80e62EE88318C2804920D4c96f92bb',
  chainId: zksync.id,
  nonce: 7,
  maxFeePerGas: 250000000n,
  maxPriorityFeePerGas: 2n,
  value: parseEther('1'),
  data: '0xa4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000',
}

const baseEip712: ZksyncTransactionSerializableEIP712 = {
  ...baseTransaction,
  from: '0xf760bdd822fccf93c44be68d94c45133002b3037',
  gasPerPubdata: 50000n,
  factoryDeps: [],
  paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021',
  paymasterInput:
    '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
  type: 'eip712',
}

test('default', () => {
  const transaction = {
    ...baseEip712,
    gas: 158774n,
  }

  expect(getEip712Domain(transaction)).toMatchInlineSnapshot(`
    {
      "domain": {
        "chainId": 324,
        "name": "zkSync",
        "version": "2",
      },
      "message": {
        "data": "0xa4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000",
        "factoryDeps": [],
        "from": 1412278129702086080747614868627407617204419244087n,
        "gasLimit": 158774n,
        "gasPerPubdataByteLimit": 50000n,
        "maxFeePerGas": 250000000n,
        "maxPriorityFeePerGas": 2n,
        "nonce": 7n,
        "paymaster": 430269810442498150241781430127684901874131001377n,
        "paymasterInput": "0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000",
        "to": 97682711824466416464036482978912861037813273275n,
        "txType": 113n,
        "value": 1000000000000000000n,
      },
      "primaryType": "Transaction",
      "types": {
        "Transaction": [
          {
            "name": "txType",
            "type": "uint256",
          },
          {
            "name": "from",
            "type": "uint256",
          },
          {
            "name": "to",
            "type": "uint256",
          },
          {
            "name": "gasLimit",
            "type": "uint256",
          },
          {
            "name": "gasPerPubdataByteLimit",
            "type": "uint256",
          },
          {
            "name": "maxFeePerGas",
            "type": "uint256",
          },
          {
            "name": "maxPriorityFeePerGas",
            "type": "uint256",
          },
          {
            "name": "paymaster",
            "type": "uint256",
          },
          {
            "name": "nonce",
            "type": "uint256",
          },
          {
            "name": "value",
            "type": "uint256",
          },
          {
            "name": "data",
            "type": "bytes",
          },
          {
            "name": "factoryDeps",
            "type": "bytes32[]",
          },
          {
            "name": "paymasterInput",
            "type": "bytes",
          },
        ],
      },
    }
  `)
})

test('signed', async () => {
  const signed = await signTransaction({
    privateKey: accounts[0].privateKey,
    transaction: baseEip712,
    serializer: serializeTransaction,
  })

  expect(signed).toEqual(
    '0x71f9010b0702840ee6b2808094111c3e89ce80e62ee88318c2804920d4c96f92bb880de0b6b3a7640000b864a4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000820144808082014494f760bdd822fccf93c44be68d94c45133002b303782c350c080f85b944b5df730c2e6b28e17013a1485e5d9bc41efe021b8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
  )
})

test('non-eip712 should throw', async () => {
  expect(() => getEip712Domain(baseTransaction)).toThrowError()
})
