import { expect, test } from 'vitest'

import { getBlock } from '../../actions/public/getBlock.js'
import { getTransaction } from '../../actions/public/getTransaction.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import { optimism } from '../index.js'

test('block', async () => {
  const client = createPublicClient({
    chain: optimism,
    transport: http(),
  })
  const block = await getBlock(client, {
    blockNumber: 105849734n,
    includeTransactions: true,
  })

  const { extraData: _extraData, transactions, ...rest } = block
  expect(transactions[0]).toMatchInlineSnapshot(`
    {
      "blockHash": "0x40b65fabd4bdda5bb716b1a39e761d76a968d5cc54d887d05b47ac6c2c298846",
      "blockNumber": 105849734n,
      "chainId": undefined,
      "from": "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0001",
      "gas": 1000000n,
      "gasPrice": 0n,
      "hash": "0xf169b1021e555a1088b69e693938efd32a98231417eda1fb024de83aad98663a",
      "input": "0x015d8eb900000000000000000000000000000000000000000000000000000000010b6402000000000000000000000000000000000000000000000000000000006492207b000000000000000000000000000000000000000000000000000000033601dfdd1eca1cc72d59c84864665457586b5e8910fb78a19fbffd1a23190862dc7f9dd900000000000000000000000000000000000000000000000000000000000000000000000000000000000000006887246668a3b87f54deb3b94ba47a6f63f3298500000000000000000000000000000000000000000000000000000000000000bc00000000000000000000000000000000000000000000000000000000000a6fe0",
      "isSystemTx": undefined,
      "maxFeePerGas": undefined,
      "maxPriorityFeePerGas": undefined,
      "mint": 0n,
      "nonce": 614670,
      "r": "0x0",
      "s": "0x0",
      "sourceHash": "0x0456be3615ad9f8bb63410c832db98c02d4fdeda0139f4f98186970aef5111df",
      "to": "0x4200000000000000000000000000000000000015",
      "transactionIndex": 0,
      "type": "deposit",
      "typeHex": "0x7e",
      "v": 0n,
      "value": 0n,
    }
  `)
  expect(rest).toMatchInlineSnapshot(`
    {
      "baseFeePerGas": 83n,
      "difficulty": 0n,
      "gasLimit": 30000000n,
      "gasUsed": 1414689n,
      "hash": "0x40b65fabd4bdda5bb716b1a39e761d76a968d5cc54d887d05b47ac6c2c298846",
      "logsBloom": "0x0000008002000011000c200080000012000010000400000010040000001000a010001010400002810016001000100001080000090000008020804000002022408010c800290400202090000c000020000081000080440000200000000460800100000000024000400040480002132800000010800000040802000198020000000012000000804001401000000000000001840000002000000000004000000000268080000008c1a024000804000800020000200000080000004000a0000000008404000208000000000800015030000001800250000800001001000a100030001010811020000008000000000040100804001000409000000000480008010010",
      "miner": "0x4200000000000000000000000000000000000011",
      "mixHash": "0x324be0a5ff604a0e2c11541ebfd5850046d6d9044fb2e3c93716080cb02f4887",
      "nonce": "0x0000000000000000",
      "number": 105849734n,
      "parentHash": "0x15274362f5bf7aa966ec2eb95c972fd85f2917da803ab178bced6a53479752b6",
      "receiptsRoot": "0x4cfa86d92cf2d52d2bca8b901592a5a0444be409793f0a4c2af006c0c7aafbde",
      "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
      "size": 4072n,
      "stateRoot": "0x95676f3a28d2c8a0bf64db60e910dc47275d37f5a3c3d7353b6f571c25fcd746",
      "timestamp": 1687298245n,
      "totalDifficulty": 0n,
      "transactionsRoot": "0xe41f41da49507646478023c060078f8afa962973ac38da1f7efd0355363b31d5",
      "uncles": [],
    }
  `)
})

test('transaction', async () => {
  const client = createPublicClient({
    chain: optimism,
    transport: http(),
  })

  const transaction = await getTransaction(client, {
    hash: '0x64241d12d64bb6106a9e818d83d4c9f5d49ebef3c6180e58979bf5894461f822',
  })

  expect(transaction).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "blockHash": "0xd981071322be9757dc3b5479a84d61b4f1f5dd2d44ecb66463be6cfc8246f574",
        "blockNumber": 105848892n,
        "chainId": 10,
        "from": "0xacd03d601e5bb1b275bb94076ff46ed9d753435a",
        "gas": 21000n,
        "gasPrice": 267n,
        "hash": "0x64241d12d64bb6106a9e818d83d4c9f5d49ebef3c6180e58979bf5894461f822",
        "input": "0x",
        "maxFeePerGas": 191000n,
        "maxPriorityFeePerGas": 191n,
        "nonce": 775017,
        "r": "0xf5272819865bb23110822bedd12b4f14a9b89ca113e280d40ec06c83d126090e",
        "s": "0xaaa4249c6b174d714cd6d1eaf1a15a9549769addfcc6d846524f1f8ce38178a",
        "to": "0xeb610a69341aace81ed810ed42428249512378cd",
        "transactionIndex": 7,
        "type": "eip1559",
        "typeHex": "0x2",
        "v": 1n,
        "value": 650000000000000n,
      }
    `)
})

test('transaction (deposit)', async () => {
  const client = createPublicClient({
    chain: optimism,
    transport: http(),
  })

  const transaction = await getTransaction(client, {
    hash: '0x97f8e79b683df44ae2cc2e9f6eeebd2febdd6f0aeda71f184e6b297cbe7f620b',
  })

  expect(transaction).toMatchInlineSnapshot(`
    {
      "blockHash": "0x7c04fe001ea0efd91d5eea232e6936a2b94af8d238e56f0e025d264a55e65a58",
      "blockNumber": 105847831n,
      "chainId": undefined,
      "from": "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0001",
      "gas": 1000000n,
      "gasPrice": 0n,
      "hash": "0x97f8e79b683df44ae2cc2e9f6eeebd2febdd6f0aeda71f184e6b297cbe7f620b",
      "input": "0x015d8eb900000000000000000000000000000000000000000000000000000000010b62c6000000000000000000000000000000000000000000000000000000006492119f000000000000000000000000000000000000000000000000000000078e016aff6b099ac98f4d1e69a45ad7bccba81386deddee0569412aafb388d8c1510f9e0800000000000000000000000000000000000000000000000000000000000000020000000000000000000000006887246668a3b87f54deb3b94ba47a6f63f3298500000000000000000000000000000000000000000000000000000000000000bc00000000000000000000000000000000000000000000000000000000000a6fe0",
      "isSystemTx": undefined,
      "maxFeePerGas": undefined,
      "maxPriorityFeePerGas": undefined,
      "mint": 0n,
      "nonce": 612767,
      "r": "0x0",
      "s": "0x0",
      "sourceHash": "0x3fd7eb0bfa68ab126d745d17de615819430e1a6e922f65e5c06418569eb8dee1",
      "to": "0x4200000000000000000000000000000000000015",
      "transactionIndex": 0,
      "type": "deposit",
      "typeHex": "0x7e",
      "v": 0n,
      "value": 0n,
    }
  `)
})
