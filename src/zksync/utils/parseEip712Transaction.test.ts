import { expect, test } from 'vitest'
import { parseEip712Transaction } from './parseEip712Transaction.js'

test('default', () => {
  const serializedTransaction =
    '0x71f87f8080808094a61464658afeaf65cccaafd3a512b69a83b77618830f42408001a073a20167b8d23b610b058c05368174495adf7da3a4ed4a57eb6dbdeb1fafc24aa02f87530d663a0d061f69bb564d2c6fb46ae5ae776bbd4bd2a2a4478b9cd1b42a82010e9436615cf349d7f6344891b1e7ca7c72883f5dc04982c350c080c0'
  const transaction = parseEip712Transaction(serializedTransaction)
  expect(transaction).toEqual({
    type: 'eip712',
    nonce: 0,
    maxPriorityFeePerGas: 0n,
    maxFeePerGas: 0n,
    gas: 0n,
    to: '0xa61464658afeaf65cccaafd3a512b69a83b77618',
    value: 1000000n,
    data: '0x',
    chainId: 270,
    from: '0x36615cf349d7f6344891b1e7ca7c72883f5dc049',
    v: 1n,
    r: '0x73a20167b8d23b610b058c05368174495adf7da3a4ed4a57eb6dbdeb1fafc24a',
    s: '0x2f87530d663a0d061f69bb564d2c6fb46ae5ae776bbd4bd2a2a4478b9cd1b42a',
    gasPerPubdata: 50000n,
    factoryDeps: [],
    customSignature: '0x',
    paymaster: undefined,
    paymasterInput: undefined,
  })
})

test('with paymaster', async () => {
  const serializedTransaction =
    '0x71f8c880808080808000820144808082014494000000000000000000000000000000000000000082c350c0b841bb509f381d29a038bd2f700bd6a1f1138edfd7a3cf7234c13a03b01a023a30aa53e6bd5e6a50fdcdcf74587c9395b8a314690abbc85aadab5ebcb7678994eacf1bf85b94fd9ae5ebb0f6656f4b77a0e99dcbc5138d54b0bab8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000'

  const transaction = parseEip712Transaction(serializedTransaction)
  expect(transaction).toEqual({
    type: 'eip712',
    nonce: 0,
    maxPriorityFeePerGas: 0n,
    maxFeePerGas: 0n,
    gas: 0n,
    to: '0x',
    value: 0n,
    data: '0x00',
    chainId: 324,
    from: '0x0000000000000000000000000000000000000000',
    v: 324n,
    r: '0x',
    s: '0x',
    gasPerPubdata: 50000n,
    factoryDeps: [],
    customSignature:
      '0xbb509f381d29a038bd2f700bd6a1f1138edfd7a3cf7234c13a03b01a023a30aa53e6bd5e6a50fdcdcf74587c9395b8a314690abbc85aadab5ebcb7678994eacf1b',
    paymaster: '0xfd9ae5ebb0f6656f4b77a0e99dcbc5138d54b0ba',
    paymasterInput:
      '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
  })
})

test('not eip712 transaction', () => {
  const serializedTransaction =
    '0x73a20167b8d23b610b058c05368174495adf7da3a4ed4a57eb6dbdeb1fafc24aaf87530d663a0d061f69bb564d2c6fb46ae5ae776bbd4bd2a2a4478b9cd1b42a'

  try {
    parseEip712Transaction(serializedTransaction)
  } catch (e: any) {
    expect(e.shortMessage).toEqual('transaction type must be eip712')
  }
})
