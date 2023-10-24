import { describe, expect, test } from 'vitest'
import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { signTransaction } from '../../accounts/utils/signTransaction.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { http } from '../../clients/transports/http.js'
import { InvalidAddressError } from '../../index.js'
import { zkSyncTestnet } from '../index.js'
import { serializeTransactionZkSync } from './serializers.js'
import type { ZkSyncTransactionSerializableEIP712 } from './types.js'

const baseEip712: ZkSyncTransactionSerializableEIP712 = {
  to: '0x111C3E89Ce80e62EE88318C2804920D4c96f92bb',
  from: '0xf760bdd822fccf93c44be68d94c45133002b3037',
  chainId: zkSyncTestnet.id,
  nonce: 7,
  gas: 158774n,
  maxFeePerGas: 250000000n,
  maxPriorityFeePerGas: 0n,
  value: 0n,
  gasPerPubdata: 50000n,
  factoryDeps: [],
  data: '0xa4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000',
  paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021',
  paymasterInput:
    '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
  type: 'eip712',
  customSignature:
    '0x594113d654e8b04f4e6c7754c1100c2baaf579cab402768e236a19d040dd94f87dee6bf48cd6fd5017b7334dabeb9c890e8067a618edbe86141ab393256428e41c',
}

describe('ZkSync - EIP712', () => {
  test('should be able to serializer a ZkSync EIP712 transaction', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseEip712,
    }

    expect(serializeTransactionZkSync(transaction)).toEqual(
      '0x71f901480780840ee6b28083026c3694111c3e89ce80e62ee88318c2804920d4c96f92bb80b864a4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000820118808082011894f760bdd822fccf93c44be68d94c45133002b303782c350c0b841594113d654e8b04f4e6c7754c1100c2baaf579cab402768e236a19d040dd94f87dee6bf48cd6fd5017b7334dabeb9c890e8067a618edbe86141ab393256428e41cf85b944b5df730c2e6b28e17013a1485e5d9bc41efe021b8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
    )
  })
})

test('signed with proper customSignature', async () => {
  // This shouldn't need the private key, to be done in the EIP712 Meta sign PR.
  const walletClient = createWalletClient({
    account: privateKeyToAccount(accounts[0].privateKey),
    chain: zkSyncTestnet,
    transport: http(),
  })

  const transactionToSign = {
    txType: 113n,
    from: BigInt(baseEip712.from),
    to: baseEip712.to ? BigInt(baseEip712.to) : 0n,
    gasLimit: baseEip712.gas ?? 0n,
    gasPerPubdataByteLimit: baseEip712.gasPerPubdata ?? 0n,
    maxFeePerGas: baseEip712.maxFeePerGas,
    maxPriorityFeePerGas: baseEip712.maxPriorityFeePerGas,
    paymaster: baseEip712.paymaster ? BigInt(baseEip712.paymaster) : 0n,
    nonce: baseEip712.nonce ? BigInt(baseEip712.nonce) : 0n,
    value: 0n,
    data: baseEip712.data ? baseEip712.data : '0x0',
    factoryDeps: [],
    paymasterInput: baseEip712.paymasterInput
      ? baseEip712.paymasterInput
      : '0x0',
  }

  // This should be added as structure similar to formatters and serializers.
  const customSignature = await walletClient.signTypedData({
    domain: {
      name: 'zkSync',
      version: '2',
      chainId: 270,
    },
    types: {
      Transaction: [
        { name: 'txType', type: 'uint256' },
        { name: 'from', type: 'uint256' },
        { name: 'to', type: 'uint256' },
        { name: 'gasLimit', type: 'uint256' },
        { name: 'gasPerPubdataByteLimit', type: 'uint256' },
        { name: 'maxFeePerGas', type: 'uint256' },
        { name: 'maxPriorityFeePerGas', type: 'uint256' },
        { name: 'paymaster', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'value', type: 'uint256' },
        { name: 'data', type: 'bytes' },
        { name: 'factoryDeps', type: 'bytes32[]' },
        { name: 'paymasterInput', type: 'bytes' },
      ],
    },
    primaryType: 'Transaction',
    message: transactionToSign,
  })

  const signed = await signTransaction({
    privateKey: accounts[0].privateKey,
    transaction: { ...baseEip712, customSignature },
    serializer: serializeTransactionZkSync,
  })

  expect(signed).toEqual(
    '0x71f901480780840ee6b28083026c3694111c3e89ce80e62ee88318c2804920d4c96f92bb80b864a4136862000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000017900000000000000000000000000000000000000000000000000000000000000820118808082011894f760bdd822fccf93c44be68d94c45133002b303782c350c0b841d2312deb1e84f7733a83ae1fc55f9cc1f2334fe472e0a494781933b194e173a45d927e67b9222b92467660849efb055422f133cf67588cbcb1874901d3244ddd1cf85b944b5df730c2e6b28e17013a1485e5d9bc41efe021b8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
  )
})

describe('invalid params', () => {
  test('invalid paymaster', () => {
    const transaction: ZkSyncTransactionSerializableEIP712 = {
      ...baseEip712,
      paymaster: '0xdeadbeef',
    }
    expect(() => serializeTransactionZkSync(transaction)).toThrowError(
      InvalidAddressError,
    )
  })
})
