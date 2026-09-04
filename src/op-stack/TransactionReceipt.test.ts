import { expect, test } from 'vitest'

import { TransactionReceipt } from 'viem/op-stack'

const receipt = {
  blockHash:
    '0x7f9f15ca4806d8f8deb2c73e82a2a153a2de668118e14e27a96cd672936449f0',
  blockNumber: '0x1',
  contractAddress: null,
  cumulativeGasUsed: '0x2',
  daFootprintGasScalar: '0xb',
  depositNonce: '0xc',
  depositReceiptVersion: '0x1',
  effectiveGasPrice: '0x3',
  from: '0x24476ac81915c512b0e13207aa917923fba4a16a',
  gasUsed: '0x4',
  l1BaseFeeScalar: '0x5',
  l1BlobBaseFee: '0x6',
  l1BlobBaseFeeScalar: '0x7',
  l1Fee: '0x8',
  l1FeeScalar: '1.5',
  l1GasPrice: '0x9',
  l1GasUsed: '0xa',
  logs: [],
  logsBloom: '0x',
  operatorFeeConstant: '0xd',
  operatorFeeScalar: '0xe',
  status: '0x1',
  to: '0xdd69db25f6d620a7bad3023c5d32761d353d3de9',
  transactionHash:
    '0x4d8f0ebd260ea5ac2e11886cdd0af8cba982b21d9f9c1efad808212c6d6a65d3',
  transactionIndex: '0x1',
  type: '0x2',
} as const satisfies TransactionReceipt.Rpc

test('fromRpc: converts deposit, L1, operator, and Jovian fields', () => {
  expect(TransactionReceipt.fromRpc(receipt)).toMatchInlineSnapshot(`
    {
      "blobGasPrice": undefined,
      "blobGasUsed": undefined,
      "blockHash": "0x7f9f15ca4806d8f8deb2c73e82a2a153a2de668118e14e27a96cd672936449f0",
      "blockNumber": 1n,
      "contractAddress": null,
      "cumulativeGasUsed": 2n,
      "daFootprintGasScalar": 11n,
      "depositNonce": 12n,
      "depositReceiptVersion": 1,
      "effectiveGasPrice": 3n,
      "from": "0x24476ac81915c512b0e13207aa917923fba4a16a",
      "gasUsed": 4n,
      "l1BaseFeeScalar": 5n,
      "l1BlobBaseFee": 6n,
      "l1BlobBaseFeeScalar": 7n,
      "l1Fee": 8n,
      "l1FeeScalar": 1.5,
      "l1GasPrice": 9n,
      "l1GasUsed": 10n,
      "logs": [],
      "logsBloom": "0x",
      "operatorFeeConstant": 13n,
      "operatorFeeScalar": 14n,
      "status": "success",
      "to": "0xdd69db25f6d620a7bad3023c5d32761d353d3de9",
      "transactionHash": "0x4d8f0ebd260ea5ac2e11886cdd0af8cba982b21d9f9c1efad808212c6d6a65d3",
      "transactionIndex": 1,
      "type": "eip1559",
    }
  `)
})

test('fromRpc: normalizes unavailable fee fields to null', () => {
  const base = {
    ...receipt,
    daFootprintGasScalar: null,
    depositNonce: null,
    depositReceiptVersion: null,
    l1BaseFeeScalar: null,
    l1BlobBaseFee: null,
    l1BlobBaseFeeScalar: null,
    l1Fee: null,
    l1FeeScalar: null,
    l1GasPrice: null,
    l1GasUsed: null,
    operatorFeeConstant: null,
    operatorFeeScalar: null,
  } as const satisfies TransactionReceipt.Rpc

  expect(TransactionReceipt.fromRpc(base)).toMatchInlineSnapshot(`
    {
      "blobGasPrice": undefined,
      "blobGasUsed": undefined,
      "blockHash": "0x7f9f15ca4806d8f8deb2c73e82a2a153a2de668118e14e27a96cd672936449f0",
      "blockNumber": 1n,
      "contractAddress": null,
      "cumulativeGasUsed": 2n,
      "daFootprintGasScalar": null,
      "effectiveGasPrice": 3n,
      "from": "0x24476ac81915c512b0e13207aa917923fba4a16a",
      "gasUsed": 4n,
      "l1BaseFeeScalar": null,
      "l1BlobBaseFee": null,
      "l1BlobBaseFeeScalar": null,
      "l1Fee": null,
      "l1FeeScalar": null,
      "l1GasPrice": null,
      "l1GasUsed": null,
      "logs": [],
      "logsBloom": "0x",
      "operatorFeeConstant": null,
      "operatorFeeScalar": null,
      "status": "success",
      "to": "0xdd69db25f6d620a7bad3023c5d32761d353d3de9",
      "transactionHash": "0x4d8f0ebd260ea5ac2e11886cdd0af8cba982b21d9f9c1efad808212c6d6a65d3",
      "transactionIndex": 1,
      "type": "eip1559",
    }
  `)
})

test('fromRpc: null', () => {
  expect(TransactionReceipt.fromRpc(null)).toBeNull()
})
