import { describe, expect, test } from 'vitest'

import { anvilOptimism } from '../../test/src/anvil.js'
import { getBlock } from '../actions/public/getBlock.js'
import { getTransaction } from '../actions/public/getTransaction.js'
import { getTransactionReceipt } from '../actions/public/getTransactionReceipt.js'
import { optimism } from '../chains/index.js'
import { createClient } from '../clients/createClient.js'
import { http } from '../clients/transports/http.js'

const optimismClient = anvilOptimism.getClient()

describe('block', () => {
  test('formatter', async () => {
    const { block } = optimism.formatters!

    expect(
      block.format({
        baseFeePerGas: '0x1',
        blobGasUsed: '0x0',
        excessBlobGas: '0x0',
        sealFields: ['0x0'],
        difficulty: '0x0',
        extraData: '0x',
        gasLimit: '0x420',
        gasUsed: '0x69',
        hash: '0x40b65fabd4bdda5bb716b1a39e761d76a968d5cc54d887d05b47ac6c2c298846',
        logsBloom:
          '0x0000008002000011000c200080000012000010000400000010040000001000a010001010400002810016001000100001080000090000008020804000002022408010c800290400202090000c000020000081000080440000200000000460800100000000024000400040480002132800000010800000040802000198020000000012000000804001401000000000000001840000002000000000004000000000268080000008c1a024000804000800020000200000080000004000a0000000008404000208000000000800015030000001800250000800001001000a100030001010811020000008000000000040100804001000409000000000480008010010',
        miner: '0x4200000000000000000000000000000000000011',
        mixHash:
          '0x324be0a5ff604a0e2c11541ebfd5850046d6d9044fb2e3c93716080cb02f4887',
        nonce: '0x0000000000000000',
        number: '0x69420',
        parentHash:
          '0x15274362f5bf7aa966ec2eb95c972fd85f2917da803ab178bced6a53479752b6',
        receiptsRoot:
          '0x4cfa86d92cf2d52d2bca8b901592a5a0444be409793f0a4c2af006c0c7aafbde',
        sha3Uncles:
          '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        size: '0x69420',
        stateRoot:
          '0x95676f3a28d2c8a0bf64db60e910dc47275d37f5a3c3d7353b6f571c25fcd746',
        timestamp: '0xa42069',
        totalDifficulty: '0x0',
        transactionsRoot:
          '0xe41f41da49507646478023c060078f8afa962973ac38da1f7efd0355363b31d5',
        transactions: [
          {
            blockHash:
              '0x40b65fabd4bdda5bb716b1a39e761d76a968d5cc54d887d05b47ac6c2c298846',
            blockNumber: '0x1',
            from: '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0001',
            gas: '0x420',
            hash: '0xf169b1021e555a1088b69e693938efd32a98231417eda1fb024de83aad98663a',
            maxFeePerGas: '0x0',
            maxPriorityFeePerGas: '0x0',
            input:
              '0x015d8eb900000000000000000000000000000000000000000000000000000000010b6402000000000000000000000000000000000000000000000000000000006492207b000000000000000000000000000000000000000000000000000000033601dfdd1eca1cc72d59c84864665457586b5e8910fb78a19fbffd1a23190862dc7f9dd900000000000000000000000000000000000000000000000000000000000000000000000000000000000000006887246668a3b87f54deb3b94ba47a6f63f3298500000000000000000000000000000000000000000000000000000000000000bc00000000000000000000000000000000000000000000000000000000000a6fe0',
            mint: '0x0',
            nonce: '0x420',
            r: '0x0',
            s: '0x0',
            sourceHash:
              '0x0456be3615ad9f8bb63410c832db98c02d4fdeda0139f4f98186970aef5111df',
            to: '0x4200000000000000000000000000000000000015',
            transactionIndex: '0x0',
            type: '0x7e',
            v: '0x0',
            value: '0x0',
            yParity: '0x0',
          },
          {
            blockHash:
              '0x40b65fabd4bdda5bb716b1a39e761d76a968d5cc54d887d05b47ac6c2c298846',
            blockNumber: '0x1',
            from: '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0001',
            gas: '0x420',
            hash: '0xf169b1021e555a1088b69e693938efd32a98231417eda1fb024de83aad98663a',
            maxFeePerGas: '0x0',
            maxPriorityFeePerGas: '0x0',
            input:
              '0x015d8eb900000000000000000000000000000000000000000000000000000000010b6402000000000000000000000000000000000000000000000000000000006492207b000000000000000000000000000000000000000000000000000000033601dfdd1eca1cc72d59c84864665457586b5e8910fb78a19fbffd1a23190862dc7f9dd900000000000000000000000000000000000000000000000000000000000000000000000000000000000000006887246668a3b87f54deb3b94ba47a6f63f3298500000000000000000000000000000000000000000000000000000000000000bc00000000000000000000000000000000000000000000000000000000000a6fe0',
            mint: undefined,
            nonce: '0x420',
            r: '0x0',
            s: '0x0',
            sourceHash:
              '0x0456be3615ad9f8bb63410c832db98c02d4fdeda0139f4f98186970aef5111df',
            to: '0x4200000000000000000000000000000000000015',
            transactionIndex: '0x0',
            type: '0x7e',
            v: '0x0',
            value: '0x0',
            yParity: '0x0',
          },
        ],
        uncles: [],
      }),
    ).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": 1n,
        "blobGasUsed": 0n,
        "difficulty": 0n,
        "excessBlobGas": 0n,
        "extraData": "0x",
        "gasLimit": 1056n,
        "gasUsed": 105n,
        "hash": "0x40b65fabd4bdda5bb716b1a39e761d76a968d5cc54d887d05b47ac6c2c298846",
        "logsBloom": "0x0000008002000011000c200080000012000010000400000010040000001000a010001010400002810016001000100001080000090000008020804000002022408010c800290400202090000c000020000081000080440000200000000460800100000000024000400040480002132800000010800000040802000198020000000012000000804001401000000000000001840000002000000000004000000000268080000008c1a024000804000800020000200000080000004000a0000000008404000208000000000800015030000001800250000800001001000a100030001010811020000008000000000040100804001000409000000000480008010010",
        "miner": "0x4200000000000000000000000000000000000011",
        "mixHash": "0x324be0a5ff604a0e2c11541ebfd5850046d6d9044fb2e3c93716080cb02f4887",
        "nonce": "0x0000000000000000",
        "number": 431136n,
        "parentHash": "0x15274362f5bf7aa966ec2eb95c972fd85f2917da803ab178bced6a53479752b6",
        "receiptsRoot": "0x4cfa86d92cf2d52d2bca8b901592a5a0444be409793f0a4c2af006c0c7aafbde",
        "sealFields": [
          "0x0",
        ],
        "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        "size": 431136n,
        "stateRoot": "0x95676f3a28d2c8a0bf64db60e910dc47275d37f5a3c3d7353b6f571c25fcd746",
        "timestamp": 10756201n,
        "totalDifficulty": 0n,
        "transactions": [
          {
            "blockHash": "0x40b65fabd4bdda5bb716b1a39e761d76a968d5cc54d887d05b47ac6c2c298846",
            "blockNumber": 1n,
            "chainId": undefined,
            "from": "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0001",
            "gas": 1056n,
            "gasPrice": undefined,
            "hash": "0xf169b1021e555a1088b69e693938efd32a98231417eda1fb024de83aad98663a",
            "input": "0x015d8eb900000000000000000000000000000000000000000000000000000000010b6402000000000000000000000000000000000000000000000000000000006492207b000000000000000000000000000000000000000000000000000000033601dfdd1eca1cc72d59c84864665457586b5e8910fb78a19fbffd1a23190862dc7f9dd900000000000000000000000000000000000000000000000000000000000000000000000000000000000000006887246668a3b87f54deb3b94ba47a6f63f3298500000000000000000000000000000000000000000000000000000000000000bc00000000000000000000000000000000000000000000000000000000000a6fe0",
            "isSystemTx": undefined,
            "maxFeePerBlobGas": undefined,
            "maxFeePerGas": 0n,
            "maxPriorityFeePerGas": 0n,
            "mint": 0n,
            "nonce": 1056,
            "r": "0x0",
            "s": "0x0",
            "sourceHash": "0x0456be3615ad9f8bb63410c832db98c02d4fdeda0139f4f98186970aef5111df",
            "to": "0x4200000000000000000000000000000000000015",
            "transactionIndex": 0,
            "type": "deposit",
            "typeHex": "0x7e",
            "v": 0n,
            "value": 0n,
            "yParity": 0,
          },
          {
            "blockHash": "0x40b65fabd4bdda5bb716b1a39e761d76a968d5cc54d887d05b47ac6c2c298846",
            "blockNumber": 1n,
            "chainId": undefined,
            "from": "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0001",
            "gas": 1056n,
            "gasPrice": undefined,
            "hash": "0xf169b1021e555a1088b69e693938efd32a98231417eda1fb024de83aad98663a",
            "input": "0x015d8eb900000000000000000000000000000000000000000000000000000000010b6402000000000000000000000000000000000000000000000000000000006492207b000000000000000000000000000000000000000000000000000000033601dfdd1eca1cc72d59c84864665457586b5e8910fb78a19fbffd1a23190862dc7f9dd900000000000000000000000000000000000000000000000000000000000000000000000000000000000000006887246668a3b87f54deb3b94ba47a6f63f3298500000000000000000000000000000000000000000000000000000000000000bc00000000000000000000000000000000000000000000000000000000000a6fe0",
            "isSystemTx": undefined,
            "maxFeePerBlobGas": undefined,
            "maxFeePerGas": 0n,
            "maxPriorityFeePerGas": 0n,
            "mint": undefined,
            "nonce": 1056,
            "r": "0x0",
            "s": "0x0",
            "sourceHash": "0x0456be3615ad9f8bb63410c832db98c02d4fdeda0139f4f98186970aef5111df",
            "to": "0x4200000000000000000000000000000000000015",
            "transactionIndex": 0,
            "type": "deposit",
            "typeHex": "0x7e",
            "v": 0n,
            "value": 0n,
            "yParity": 0,
          },
        ],
        "transactionsRoot": "0xe41f41da49507646478023c060078f8afa962973ac38da1f7efd0355363b31d5",
        "uncles": [],
      }
    `)

    expect(
      block.format({
        baseFeePerGas: '0x1',
        difficulty: '0x0',
        blobGasUsed: '0x0',
        excessBlobGas: '0x0',
        sealFields: ['0x0'],
        extraData: '0x0',
        gasLimit: '0x420',
        gasUsed: '0x69',
        hash: '0x40b65fabd4bdda5bb716b1a39e761d76a968d5cc54d887d05b47ac6c2c298846',
        logsBloom:
          '0x0000008002000011000c200080000012000010000400000010040000001000a010001010400002810016001000100001080000090000008020804000002022408010c800290400202090000c000020000081000080440000200000000460800100000000024000400040480002132800000010800000040802000198020000000012000000804001401000000000000001840000002000000000004000000000268080000008c1a024000804000800020000200000080000004000a0000000008404000208000000000800015030000001800250000800001001000a100030001010811020000008000000000040100804001000409000000000480008010010',
        miner: '0x4200000000000000000000000000000000000011',
        mixHash:
          '0x324be0a5ff604a0e2c11541ebfd5850046d6d9044fb2e3c93716080cb02f4887',
        nonce: '0x0000000000000000',
        number: '0x69420',
        parentHash:
          '0x15274362f5bf7aa966ec2eb95c972fd85f2917da803ab178bced6a53479752b6',
        receiptsRoot:
          '0x4cfa86d92cf2d52d2bca8b901592a5a0444be409793f0a4c2af006c0c7aafbde',
        sha3Uncles:
          '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        size: '0x69420',
        stateRoot:
          '0x95676f3a28d2c8a0bf64db60e910dc47275d37f5a3c3d7353b6f571c25fcd746',
        timestamp: '0xa42069',
        totalDifficulty: '0x0',
        transactionsRoot:
          '0xe41f41da49507646478023c060078f8afa962973ac38da1f7efd0355363b31d5',
        transactions: ['0x'],
        uncles: [],
      }),
    ).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": 1n,
        "blobGasUsed": 0n,
        "difficulty": 0n,
        "excessBlobGas": 0n,
        "extraData": "0x0",
        "gasLimit": 1056n,
        "gasUsed": 105n,
        "hash": "0x40b65fabd4bdda5bb716b1a39e761d76a968d5cc54d887d05b47ac6c2c298846",
        "logsBloom": "0x0000008002000011000c200080000012000010000400000010040000001000a010001010400002810016001000100001080000090000008020804000002022408010c800290400202090000c000020000081000080440000200000000460800100000000024000400040480002132800000010800000040802000198020000000012000000804001401000000000000001840000002000000000004000000000268080000008c1a024000804000800020000200000080000004000a0000000008404000208000000000800015030000001800250000800001001000a100030001010811020000008000000000040100804001000409000000000480008010010",
        "miner": "0x4200000000000000000000000000000000000011",
        "mixHash": "0x324be0a5ff604a0e2c11541ebfd5850046d6d9044fb2e3c93716080cb02f4887",
        "nonce": "0x0000000000000000",
        "number": 431136n,
        "parentHash": "0x15274362f5bf7aa966ec2eb95c972fd85f2917da803ab178bced6a53479752b6",
        "receiptsRoot": "0x4cfa86d92cf2d52d2bca8b901592a5a0444be409793f0a4c2af006c0c7aafbde",
        "sealFields": [
          "0x0",
        ],
        "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        "size": 431136n,
        "stateRoot": "0x95676f3a28d2c8a0bf64db60e910dc47275d37f5a3c3d7353b6f571c25fcd746",
        "timestamp": 10756201n,
        "totalDifficulty": 0n,
        "transactions": [
          "0x",
        ],
        "transactionsRoot": "0xe41f41da49507646478023c060078f8afa962973ac38da1f7efd0355363b31d5",
        "uncles": [],
      }
    `)
  })

  test('action', async () => {
    const block = await getBlock(optimismClient, {
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
        "maxFeePerBlobGas": undefined,
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
        "yParity": 0,
      }
    `)
    expect(rest).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": 83n,
        "blobGasUsed": undefined,
        "difficulty": 0n,
        "excessBlobGas": undefined,
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
})

describe('transaction', () => {
  test('formatter', () => {
    const { transaction } = optimism.formatters!

    expect(
      transaction.format({
        accessList: [],
        blockHash:
          '0xd981071322be9757dc3b5479a84d61b4f1f5dd2d44ecb66463be6cfc8246f574',
        blockNumber: '0x1',
        chainId: '0x1',
        from: '0xacd03d601e5bb1b275bb94076ff46ed9d753435a',
        gas: '0x69',
        hash: '0x64241d12d64bb6106a9e818d83d4c9f5d49ebef3c6180e58979bf5894461f822',
        input: '0x',
        maxFeePerGas: '0x1',
        maxPriorityFeePerGas: '0x2',
        nonce: '0x3',
        r: '0xf5272819865bb23110822bedd12b4f14a9b89ca113e280d40ec06c83d126090e',
        s: '0xaaa4249c6b174d714cd6d1eaf1a15a9549769addfcc6d846524f1f8ce38178a',
        to: '0xeb610a69341aace81ed810ed42428249512378cd',
        transactionIndex: '0x4',
        type: '0x2',
        v: '0x1',
        value: '0x69',
        yParity: '0x1',
      }),
    ).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "blockHash": "0xd981071322be9757dc3b5479a84d61b4f1f5dd2d44ecb66463be6cfc8246f574",
        "blockNumber": 1n,
        "chainId": 1,
        "from": "0xacd03d601e5bb1b275bb94076ff46ed9d753435a",
        "gas": 105n,
        "gasPrice": undefined,
        "hash": "0x64241d12d64bb6106a9e818d83d4c9f5d49ebef3c6180e58979bf5894461f822",
        "input": "0x",
        "maxFeePerGas": 1n,
        "maxPriorityFeePerGas": 2n,
        "nonce": 3,
        "r": "0xf5272819865bb23110822bedd12b4f14a9b89ca113e280d40ec06c83d126090e",
        "s": "0xaaa4249c6b174d714cd6d1eaf1a15a9549769addfcc6d846524f1f8ce38178a",
        "to": "0xeb610a69341aace81ed810ed42428249512378cd",
        "transactionIndex": 4,
        "type": "eip1559",
        "typeHex": "0x2",
        "v": 1n,
        "value": 105n,
        "yParity": 1,
      }
    `)
  })

  test('action', async () => {
    const transaction = await getTransaction(optimismClient, {
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
        "yParity": 1,
      }
    `)
  })
})

describe('transaction (deposit)', () => {
  test('formatter', () => {
    const { transaction } = optimism.formatters!

    expect(
      transaction.format({
        blockHash:
          '0xd981071322be9757dc3b5479a84d61b4f1f5dd2d44ecb66463be6cfc8246f574',
        blockNumber: '0x1',
        from: '0xacd03d601e5bb1b275bb94076ff46ed9d753435a',
        gas: '0x69',
        hash: '0x64241d12d64bb6106a9e818d83d4c9f5d49ebef3c6180e58979bf5894461f822',
        input: '0x',
        maxFeePerGas: '0x1',
        maxPriorityFeePerGas: '0x2',
        nonce: '0x3',
        r: '0xf5272819865bb23110822bedd12b4f14a9b89ca113e280d40ec06c83d126090e',
        s: '0xaaa4249c6b174d714cd6d1eaf1a15a9549769addfcc6d846524f1f8ce38178a',
        sourceHash: '0x',
        to: '0xeb610a69341aace81ed810ed42428249512378cd',
        transactionIndex: '0x4',
        type: '0x7e',
        v: '0x1',
        value: '0x69',
        yParity: '0x1',
      }),
    ).toMatchInlineSnapshot(`
      {
        "blockHash": "0xd981071322be9757dc3b5479a84d61b4f1f5dd2d44ecb66463be6cfc8246f574",
        "blockNumber": 1n,
        "chainId": undefined,
        "from": "0xacd03d601e5bb1b275bb94076ff46ed9d753435a",
        "gas": 105n,
        "gasPrice": undefined,
        "hash": "0x64241d12d64bb6106a9e818d83d4c9f5d49ebef3c6180e58979bf5894461f822",
        "input": "0x",
        "isSystemTx": undefined,
        "maxFeePerBlobGas": undefined,
        "maxFeePerGas": 1n,
        "maxPriorityFeePerGas": 2n,
        "mint": undefined,
        "nonce": 3,
        "r": "0xf5272819865bb23110822bedd12b4f14a9b89ca113e280d40ec06c83d126090e",
        "s": "0xaaa4249c6b174d714cd6d1eaf1a15a9549769addfcc6d846524f1f8ce38178a",
        "sourceHash": "0x",
        "to": "0xeb610a69341aace81ed810ed42428249512378cd",
        "transactionIndex": 4,
        "type": "deposit",
        "typeHex": "0x7e",
        "v": 1n,
        "value": 105n,
        "yParity": 1,
      }
    `)
  })

  test('action', async () => {
    const transaction = await getTransaction(optimismClient, {
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
        "maxFeePerBlobGas": undefined,
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
        "yParity": 0,
      }
    `)
  })
})

describe('transaction receipt', async () => {
  test('formatter', () => {
    const { transactionReceipt } = optimism.formatters!

    expect(
      transactionReceipt.format({
        blockHash:
          '0x7f9f15ca4806d8f8deb2c73e82a2a153a2de668118e14e27a96cd672936449f0',
        blockNumber: '0x1',
        contractAddress: null,
        cumulativeGasUsed: '0x1',
        effectiveGasPrice: '0x1',
        from: '0x24476ac81915c512b0e13207aa917923fba4a16a',
        gasUsed: '0x42069',
        l1Fee: '0x420',
        l1FeeScalar: '1.5',
        l1GasPrice: '0x69',
        l1GasUsed: '0x1',
        logs: [],
        logsBloom:
          '0x00000000000000004000000000000000000040000000021000000000000010102000000000000000000080000010000000000000000000000000000000000000004000000000000000000008000008000000000000000000000000000000000000040000060000000080100000000800000000000000000000000010000100000000000400000000000000000000000000000000280000000000000000000000000000004000020000000004000000008000000000000000000000000010000000001002000008000000000000000000000000000000000000000000000020001000800000000000000000002000100000010000000000000000000000000000',
        status: '0x1',
        to: '0xdd69db25f6d620a7bad3023c5d32761d353d3de9',
        transactionHash:
          '0x4d8f0ebd260ea5ac2e11886cdd0af8cba982b21d9f9c1efad808212c6d6a65d3',
        transactionIndex: '0x1',
        type: '0x2',
      }),
    ).toMatchInlineSnapshot(`
      {
        "blockHash": "0x7f9f15ca4806d8f8deb2c73e82a2a153a2de668118e14e27a96cd672936449f0",
        "blockNumber": 1n,
        "contractAddress": null,
        "cumulativeGasUsed": 1n,
        "effectiveGasPrice": 1n,
        "from": "0x24476ac81915c512b0e13207aa917923fba4a16a",
        "gasUsed": 270441n,
        "l1Fee": 1056n,
        "l1FeeScalar": 1.5,
        "l1GasPrice": 105n,
        "l1GasUsed": 1n,
        "logs": [],
        "logsBloom": "0x00000000000000004000000000000000000040000000021000000000000010102000000000000000000080000010000000000000000000000000000000000000004000000000000000000008000008000000000000000000000000000000000000040000060000000080100000000800000000000000000000000010000100000000000400000000000000000000000000000000280000000000000000000000000000004000020000000004000000008000000000000000000000000010000000001002000008000000000000000000000000000000000000000000000020001000800000000000000000002000100000010000000000000000000000000000",
        "status": "success",
        "to": "0xdd69db25f6d620a7bad3023c5d32761d353d3de9",
        "transactionHash": "0x4d8f0ebd260ea5ac2e11886cdd0af8cba982b21d9f9c1efad808212c6d6a65d3",
        "transactionIndex": 1,
        "type": "eip1559",
      }
    `)

    expect(
      transactionReceipt.format({
        blockHash:
          '0x7f9f15ca4806d8f8deb2c73e82a2a153a2de668118e14e27a96cd672936449f0',
        blockNumber: '0x1',
        contractAddress: null,
        cumulativeGasUsed: '0x1',
        effectiveGasPrice: '0x1',
        from: '0x24476ac81915c512b0e13207aa917923fba4a16a',
        gasUsed: '0x42069',
        l1Fee: null,
        l1FeeScalar: null,
        l1GasPrice: null,
        l1GasUsed: null,
        logs: [],
        logsBloom:
          '0x00000000000000004000000000000000000040000000021000000000000010102000000000000000000080000010000000000000000000000000000000000000004000000000000000000008000008000000000000000000000000000000000000040000060000000080100000000800000000000000000000000010000100000000000400000000000000000000000000000000280000000000000000000000000000004000020000000004000000008000000000000000000000000010000000001002000008000000000000000000000000000000000000000000000020001000800000000000000000002000100000010000000000000000000000000000',
        status: '0x1',
        to: '0xdd69db25f6d620a7bad3023c5d32761d353d3de9',
        transactionHash:
          '0x4d8f0ebd260ea5ac2e11886cdd0af8cba982b21d9f9c1efad808212c6d6a65d3',
        transactionIndex: '0x1',
        type: '0x2',
      }),
    ).toMatchInlineSnapshot(`
      {
        "blockHash": "0x7f9f15ca4806d8f8deb2c73e82a2a153a2de668118e14e27a96cd672936449f0",
        "blockNumber": 1n,
        "contractAddress": null,
        "cumulativeGasUsed": 1n,
        "effectiveGasPrice": 1n,
        "from": "0x24476ac81915c512b0e13207aa917923fba4a16a",
        "gasUsed": 270441n,
        "l1Fee": null,
        "l1FeeScalar": null,
        "l1GasPrice": null,
        "l1GasUsed": null,
        "logs": [],
        "logsBloom": "0x00000000000000004000000000000000000040000000021000000000000010102000000000000000000080000010000000000000000000000000000000000000004000000000000000000008000008000000000000000000000000000000000000040000060000000080100000000800000000000000000000000010000100000000000400000000000000000000000000000000280000000000000000000000000000004000020000000004000000008000000000000000000000000010000000001002000008000000000000000000000000000000000000000000000020001000800000000000000000002000100000010000000000000000000000000000",
        "status": "success",
        "to": "0xdd69db25f6d620a7bad3023c5d32761d353d3de9",
        "transactionHash": "0x4d8f0ebd260ea5ac2e11886cdd0af8cba982b21d9f9c1efad808212c6d6a65d3",
        "transactionIndex": 1,
        "type": "eip1559",
      }
    `)
  })

  test('action', async () => {
    const client = createClient({
      chain: optimism,
      transport: http(),
    })

    const transaction = await getTransactionReceipt(client, {
      hash: '0x4d8f0ebd260ea5ac2e11886cdd0af8cba982b21d9f9c1efad808212c6d6a65d3',
    })

    expect(transaction).toMatchInlineSnapshot(`
      {
        "blockHash": "0x7f9f15ca4806d8f8deb2c73e82a2a153a2de668118e14e27a96cd672936449f0",
        "blockNumber": 106812538n,
        "contractAddress": null,
        "cumulativeGasUsed": 1431996n,
        "effectiveGasPrice": 58n,
        "from": "0x24476ac81915c512b0e13207aa917923fba4a16a",
        "gasUsed": 228719n,
        "l1Fee": 44700351261503n,
        "l1FeeScalar": 0.684,
        "l1GasPrice": 15694378178n,
        "l1GasUsed": 4164n,
        "logs": [
          {
            "address": "0xdd69db25f6d620a7bad3023c5d32761d353d3de9",
            "blockHash": "0x7f9f15ca4806d8f8deb2c73e82a2a153a2de668118e14e27a96cd672936449f0",
            "blockNumber": 106812538n,
            "data": "0x000000000000000000000000000000000000000000000000008e1bc9bf040000",
            "logIndex": 19,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x00000000000000000000000024476ac81915c512b0e13207aa917923fba4a16a",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
            ],
            "transactionHash": "0x4d8f0ebd260ea5ac2e11886cdd0af8cba982b21d9f9c1efad808212c6d6a65d3",
            "transactionIndex": 10,
          },
          {
            "address": "0x81e792e5a9003cc1c8bf5569a00f34b65d75b017",
            "blockHash": "0x7f9f15ca4806d8f8deb2c73e82a2a153a2de668118e14e27a96cd672936449f0",
            "blockNumber": 106812538n,
            "data": "0x000000000000000000000000000000000000000000000000000031a1add99f8b",
            "logIndex": 20,
            "removed": false,
            "topics": [
              "0xdf21c415b78ed2552cc9971249e32a053abce6087a0ae0fbf3f78db5174a3493",
            ],
            "transactionHash": "0x4d8f0ebd260ea5ac2e11886cdd0af8cba982b21d9f9c1efad808212c6d6a65d3",
            "transactionIndex": 10,
          },
          {
            "address": "0x4d73adb72bc3dd368966edd0f0b2148401a178e2",
            "blockHash": "0x7f9f15ca4806d8f8deb2c73e82a2a153a2de668118e14e27a96cd672936449f0",
            "blockNumber": 106812538n,
            "data": "0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000002200010000000000000000000000000000000000000000000000000000000000030d40000000000000000000000000000000000000000000000000000000000000",
            "logIndex": 21,
            "removed": false,
            "topics": [
              "0xb0c632f55f1e1b3b2c3d82f41ee4716bb4c00f0f5d84cdafc141581bb8757a4f",
            ],
            "transactionHash": "0x4d8f0ebd260ea5ac2e11886cdd0af8cba982b21d9f9c1efad808212c6d6a65d3",
            "transactionIndex": 10,
          },
          {
            "address": "0xa0cc33dd6f4819d473226257792afe230ec3c67f",
            "blockHash": "0x7f9f15ca4806d8f8deb2c73e82a2a153a2de668118e14e27a96cd672936449f0",
            "blockNumber": 106812538n,
            "data": "0x000000000000000000000000000000000000000000000000000000000000009a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000014000000000000000000000000dd69db25f6d620a7bad3023c5d32761d353d3de90000000000000000000000000000000000000000000000000000000124c9d6c5",
            "logIndex": 22,
            "removed": false,
            "topics": [
              "0x4e41ee13e03cd5e0446487b524fdc48af6acf26c074dacdbdfb6b574b42c8146",
            ],
            "transactionHash": "0x4d8f0ebd260ea5ac2e11886cdd0af8cba982b21d9f9c1efad808212c6d6a65d3",
            "transactionIndex": 10,
          },
          {
            "address": "0x4d73adb72bc3dd368966edd0f0b2148401a178e2",
            "blockHash": "0x7f9f15ca4806d8f8deb2c73e82a2a153a2de668118e14e27a96cd672936449f0",
            "blockNumber": 106812538n,
            "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000d40000000000049d1a006fdd69db25f6d620a7bad3023c5d32761d353d3de9009a4f7a67464b5976d7547c860109e4432d50afb38e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000008e1bc9bf040000000000000000000000000000000000000000000000000000000000000000001424476ac81915c512b0e13207aa917923fba4a16a000000000000000000000000000000000000000000000000",
            "logIndex": 23,
            "removed": false,
            "topics": [
              "0xe9bded5f24a4168e4f3bf44e00298c993b22376aad8c58c7dda9718a54cbea82",
            ],
            "transactionHash": "0x4d8f0ebd260ea5ac2e11886cdd0af8cba982b21d9f9c1efad808212c6d6a65d3",
            "transactionIndex": 10,
          },
          {
            "address": "0xdd69db25f6d620a7bad3023c5d32761d353d3de9",
            "blockHash": "0x7f9f15ca4806d8f8deb2c73e82a2a153a2de668118e14e27a96cd672936449f0",
            "blockNumber": 106812538n,
            "data": "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000008e1bc9bf040000000000000000000000000000000000000000000000000000000000000000001424476ac81915c512b0e13207aa917923fba4a16a000000000000000000000000",
            "logIndex": 24,
            "removed": false,
            "topics": [
              "0x39a4c66499bcf4b56d79f0dde8ed7a9d4925a0df55825206b2b8531e202be0d0",
              "0x000000000000000000000000000000000000000000000000000000000000009a",
              "0x00000000000000000000000024476ac81915c512b0e13207aa917923fba4a16a",
            ],
            "transactionHash": "0x4d8f0ebd260ea5ac2e11886cdd0af8cba982b21d9f9c1efad808212c6d6a65d3",
            "transactionIndex": 10,
          },
        ],
        "logsBloom": "0x00000000000000004000000000000000000040000000021000000000000010102000000000000000000080000010000000000000000000000000000000000000004000000000000000000008000008000000000000000000000000000000000000040000060000000080100000000800000000000000000000000010000100000000000400000000000000000000000000000000280000000000000000000000000000004000020000000004000000008000000000000000000000000010000000001002000008000000000000000000000000000000000000000000000020001000800000000000000000002000100000010000000000000000000000000000",
        "status": "success",
        "to": "0xdd69db25f6d620a7bad3023c5d32761d353d3de9",
        "transactionHash": "0x4d8f0ebd260ea5ac2e11886cdd0af8cba982b21d9f9c1efad808212c6d6a65d3",
        "transactionIndex": 10,
        "type": "eip1559",
      }
    `)
  })
})
