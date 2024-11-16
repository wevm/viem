import { describe, expect, test } from 'vitest'

import { getBlock } from '../actions/public/getBlock.js'
import { getTransaction } from '../actions/public/getTransaction.js'
import { getTransactionReceipt } from '../actions/public/getTransactionReceipt.js'
import { zksync } from '../chains/index.js'
import { createPublicClient } from '../clients/createPublicClient.js'
import { http } from '../clients/transports/http.js'

describe('block', () => {
  test('formatter', async () => {
    const { block } = zksync.formatters!

    expect(
      block.format({
        blobGasUsed: '0x0',
        excessBlobGas: '0x0',
        hash: '0x288c26fa1cc1814b638f3010f20d17fc5d1a2667fb5aa1dd6354ad889fa335b4',
        parentHash:
          '0xb1f996bdcc7c1f1893b016bd47150a846ac1e11f443d23df4cbc7c36fa1d4ae1',
        sha3Uncles:
          '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        miner: '0x0000000000000000000000000000000000000000',
        stateRoot:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        transactionsRoot:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        receiptsRoot:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        number: '0x232223',
        l1BatchNumber: '0x5076',
        gasUsed: '0x20d70b',
        gasLimit: '0xffffffff',
        baseFeePerGas: '0xee6b280',
        extraData: '0x',
        logsBloom:
          '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        timestamp: '0x64495efe',
        l1BatchTimestamp: '0x64495ec1',
        difficulty: '0x0',
        totalDifficulty: '0x0',
        sealFields: [],
        uncles: [],
        transactions: [
          '0xae443579604b132e8e8a9a03a09f4ba1c8387190d4feac2f60283a6df564b66c',
        ],
        size: '0x0',
        mixHash:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        nonce: '0x0000000000000000',
      }),
    ).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": 250000000n,
        "blobGasUsed": 0n,
        "difficulty": 0n,
        "excessBlobGas": 0n,
        "extraData": "0x",
        "gasLimit": 4294967295n,
        "gasUsed": 2152203n,
        "hash": "0x288c26fa1cc1814b638f3010f20d17fc5d1a2667fb5aa1dd6354ad889fa335b4",
        "l1BatchNumber": 20598n,
        "l1BatchTimestamp": 1682529985n,
        "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "miner": "0x0000000000000000000000000000000000000000",
        "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "nonce": "0x0000000000000000",
        "number": 2302499n,
        "parentHash": "0xb1f996bdcc7c1f1893b016bd47150a846ac1e11f443d23df4cbc7c36fa1d4ae1",
        "receiptsRoot": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "sealFields": [],
        "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        "size": 0n,
        "stateRoot": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "timestamp": 1682530046n,
        "totalDifficulty": 0n,
        "transactions": [
          "0xae443579604b132e8e8a9a03a09f4ba1c8387190d4feac2f60283a6df564b66c",
        ],
        "transactionsRoot": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "uncles": [],
      }
    `)

    expect(
      block.format({
        blobGasUsed: '0x0',
        excessBlobGas: '0x0',
        hash: '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
        parentHash:
          '0x4adced86c99c6a0db3288bcb1c99ab984f2c51ecf5b9efa243ca029b86ce1476',
        sha3Uncles:
          '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        miner: '0x0000000000000000000000000000000000000000',
        stateRoot:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        transactionsRoot:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        receiptsRoot:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        number: '0x8acd',
        l1BatchNumber: '0x239',
        gasUsed: '0x318fd7',
        gasLimit: '0xffffffff',
        baseFeePerGas: '0xee6b280',
        extraData: '0x',
        logsBloom:
          '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        timestamp: '0x641e1763',
        l1BatchTimestamp: '0x641e16e8',
        difficulty: '0x0',
        totalDifficulty: '0x0',
        sealFields: [],
        uncles: [],
        transactions: [
          {
            hash: '0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6',
            nonce: '0xf',
            blockHash:
              '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
            blockNumber: '0x8acd',
            transactionIndex: '0x0',
            from: '0xef9e8e39782b1b544a6eb6db6aa85207bacb4c20',
            to: '0x8b791913eb07c32779a16750e3868aa8495f5964',
            value: '0x0',
            gasPrice: '0xee6b280',
            gas: '0x86084b',
            input:
              '0x0fc87d250000000000000000000000003355df6d4c9c3035724fd0e3914de96a5a83aaf40000000000000000000000003f81edcbd9bc84271fb8fdf270257a18f4d47e9b0000000000000000000000000000000000000000000002b94cc7d236b39b0bff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c2000000000000000000000000000000000000000000000000000000000641e1c0b0000000000000000000000000000000000000000000000000000000000000000',
            v: '0x0',
            r: '0xfdea6b4ea965cb184257159dfdcbbe6045bf264c0de4d1b76c06821e4c33284',
            s: '0x39d0abb813b58d4ebd9c085cc31df866df218803e6a7808f21c3c651e4609981',
            type: '0x71',
            maxFeePerGas: '0xee6b280',
            maxPriorityFeePerGas: '0xee6b280',
            chainId: '0x144',
            l1BatchNumber: '0x239',
            l1BatchTxIndex: '0x154',
            yParity: '0x0',
          },
        ],
        size: '0x0',
        mixHash:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        nonce: '0x0000000000000000',
      }),
    ).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": 250000000n,
        "blobGasUsed": 0n,
        "difficulty": 0n,
        "excessBlobGas": 0n,
        "extraData": "0x",
        "gasLimit": 4294967295n,
        "gasUsed": 3248087n,
        "hash": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
        "l1BatchNumber": 569n,
        "l1BatchTimestamp": 1679693544n,
        "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "miner": "0x0000000000000000000000000000000000000000",
        "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "nonce": "0x0000000000000000",
        "number": 35533n,
        "parentHash": "0x4adced86c99c6a0db3288bcb1c99ab984f2c51ecf5b9efa243ca029b86ce1476",
        "receiptsRoot": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "sealFields": [],
        "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        "size": 0n,
        "stateRoot": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "timestamp": 1679693667n,
        "totalDifficulty": 0n,
        "transactions": [
          {
            "blockHash": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
            "blockNumber": 35533n,
            "chainId": 324,
            "from": "0xef9e8e39782b1b544a6eb6db6aa85207bacb4c20",
            "gas": 8783947n,
            "gasPrice": 250000000n,
            "hash": "0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6",
            "input": "0x0fc87d250000000000000000000000003355df6d4c9c3035724fd0e3914de96a5a83aaf40000000000000000000000003f81edcbd9bc84271fb8fdf270257a18f4d47e9b0000000000000000000000000000000000000000000002b94cc7d236b39b0bff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c2000000000000000000000000000000000000000000000000000000000641e1c0b0000000000000000000000000000000000000000000000000000000000000000",
            "l1BatchNumber": 569n,
            "l1BatchTxIndex": 340n,
            "maxFeePerBlobGas": undefined,
            "maxFeePerGas": 250000000n,
            "maxPriorityFeePerGas": 250000000n,
            "nonce": 15,
            "r": "0xfdea6b4ea965cb184257159dfdcbbe6045bf264c0de4d1b76c06821e4c33284",
            "s": "0x39d0abb813b58d4ebd9c085cc31df866df218803e6a7808f21c3c651e4609981",
            "to": "0x8b791913eb07c32779a16750e3868aa8495f5964",
            "transactionIndex": 0,
            "type": "eip712",
            "typeHex": "0x71",
            "v": 0n,
            "value": 0n,
            "yParity": 0,
          },
        ],
        "transactionsRoot": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "uncles": [],
      }
    `)

    expect(
      block.format({
        blobGasUsed: '0x0',
        excessBlobGas: '0x0',
        hash: '0x288c26fa1cc1814b638f3010f20d17fc5d1a2667fb5aa1dd6354ad889fa335b4',
        parentHash:
          '0xb1f996bdcc7c1f1893b016bd47150a846ac1e11f443d23df4cbc7c36fa1d4ae1',
        sha3Uncles:
          '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        miner: '0x0000000000000000000000000000000000000000',
        stateRoot:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        transactionsRoot:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        receiptsRoot:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        number: '0x232223',
        l1BatchNumber: null,
        gasUsed: '0x20d70b',
        gasLimit: '0xffffffff',
        baseFeePerGas: '0xee6b280',
        extraData: '0x',
        logsBloom:
          '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        timestamp: '0x64495efe',
        l1BatchTimestamp: null,
        difficulty: '0x0',
        totalDifficulty: '0x0',
        sealFields: [],
        uncles: [],
        transactions: [
          '0xae443579604b132e8e8a9a03a09f4ba1c8387190d4feac2f60283a6df564b66c',
        ],
        size: '0x0',
        mixHash:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        nonce: '0x0000000000000000',
      }),
    ).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": 250000000n,
        "blobGasUsed": 0n,
        "difficulty": 0n,
        "excessBlobGas": 0n,
        "extraData": "0x",
        "gasLimit": 4294967295n,
        "gasUsed": 2152203n,
        "hash": "0x288c26fa1cc1814b638f3010f20d17fc5d1a2667fb5aa1dd6354ad889fa335b4",
        "l1BatchNumber": null,
        "l1BatchTimestamp": null,
        "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "miner": "0x0000000000000000000000000000000000000000",
        "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "nonce": "0x0000000000000000",
        "number": 2302499n,
        "parentHash": "0xb1f996bdcc7c1f1893b016bd47150a846ac1e11f443d23df4cbc7c36fa1d4ae1",
        "receiptsRoot": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "sealFields": [],
        "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        "size": 0n,
        "stateRoot": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "timestamp": 1682530046n,
        "totalDifficulty": 0n,
        "transactions": [
          "0xae443579604b132e8e8a9a03a09f4ba1c8387190d4feac2f60283a6df564b66c",
        ],
        "transactionsRoot": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "uncles": [],
      }
    `)
  })

  test('action', async () => {
    const client = createPublicClient({
      chain: zksync,
      transport: http(),
    })

    const block = await getBlock(client, {
      blockNumber: 1n,
      includeTransactions: true,
    })

    const { extraData: _extraData, transactions, ...rest } = block
    expect(transactions[0]).toMatchInlineSnapshot(`
      {
        "blockHash": "0x51f81bcdfc324a0dff2b5bec9d92e21cbebc4d5e29d3a3d30de3e03fbeab8d7f",
        "blockNumber": 1n,
        "chainId": 324,
        "from": "0x29df43f75149d0552475a6f9b2ac96e28796ed0b",
        "gas": 72000000n,
        "gasPrice": 0n,
        "hash": "0xe9a1a8601bc9199c80c97169fdc9e1fc7c307185a0c9fa2cfab04098a7840645",
        "input": "0x3cda33510000000000000000000000000000000000000000000000000000000000000000010000553109a66f1432eb2286c54694784d1b6993bc24a168be0a49b4d0fd4500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "l1BatchNumber": 1n,
        "l1BatchTxIndex": 0n,
        "maxFeePerBlobGas": undefined,
        "maxFeePerGas": 0n,
        "maxPriorityFeePerGas": 0n,
        "nonce": 0,
        "to": "0x0000000000000000000000000000000000008006",
        "transactionIndex": 0,
        "type": "priority",
        "typeHex": "0xff",
        "v": undefined,
        "value": 0n,
        "yParity": undefined,
      }
    `)
    expect(rest).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": 500000000n,
        "blobGasUsed": undefined,
        "difficulty": 0n,
        "excessBlobGas": undefined,
        "gasLimit": 4294967295n,
        "gasUsed": 432000000n,
        "hash": "0x51f81bcdfc324a0dff2b5bec9d92e21cbebc4d5e29d3a3d30de3e03fbeab8d7f",
        "l1BatchNumber": 1n,
        "l1BatchTimestamp": 1676384542n,
        "logsBloom": "0x000000200004000800000100000000004001800000004000008008000400000008000000000000011400000000100000200000000010000000000000000000000001000000200400000021200000420200010000800000000000000000000000000000000200000000040000010808000000008000004001000000000000004000000810000400000000000000000000000001000000800000001000208000000080a0000001000000000000800500030440000010040000002000010000000080000020008100000000200000040000085000000552000000010000000020004802000000100000000400000000000010000080000000000200000010004000",
        "miner": "0x0000000000000000000000000000000000000000",
        "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "nonce": "0x0000000000000000",
        "number": 1n,
        "parentHash": "0xe8e77626586f73b955364c7b4bbf0bb7f7685ebd40e852b164633a4acbd3244c",
        "receiptsRoot": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "sealFields": [],
        "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        "size": 0n,
        "stateRoot": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "timestamp": 1676384542n,
        "totalDifficulty": 0n,
        "transactionsRoot": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "uncles": [],
      }
    `)
  })
})

describe('transaction', () => {
  test('formatter', () => {
    const { transaction } = zksync.formatters!

    expect(
      transaction.format({
        accessList: [],
        blockHash:
          '0xf24f67fb9f8fb300164045fe6ba409acb03904e680ec7df41ed2d331dc38f545',
        blockNumber: '0x1',
        chainId: '0x104',
        from: '0x36615cf349d7f6344891b1e7ca7c72883f5dc049',
        gas: '0x0',
        gasPrice: undefined,
        hash: '0xf24f67fb9f8fb300164045fe6ba409acb03904e680ec7df41ed2d331dc38f545',
        input:
          '0x02f87582010480840ee6b280840ee6b2808312b84b94a61464658afeaf65cccaafd3a512b69a83b77618880de0b6b3a764000080c080a08ab03d8a1aa4ab231867d9b12a1d7ebacaec3395cf9c4940674f83d79e342e4ca0475dda75d501e72fd816a9699f02af05ef7305668ee4acd0e25561d4628758a3',
        l1BatchNumber: '0x1',
        maxFeePerGas: '0xee6b280',
        maxPriorityFeePerGas: '0xee6b280',
        nonce: '0x0',
        r: '0x0',
        s: '0x0',
        to: '0xa61464658afeaf65cccaafd3a512b69a83b77618',
        transactionIndex: '0x1',
        type: '0x2',
        v: '0x104',
        value: '0xde0b6b3a7640000',
        l1BatchTxIndex: '0x5',
        yParity: '0x1',
      }),
    ).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "blockHash": "0xf24f67fb9f8fb300164045fe6ba409acb03904e680ec7df41ed2d331dc38f545",
        "blockNumber": 1n,
        "chainId": 260,
        "from": "0x36615cf349d7f6344891b1e7ca7c72883f5dc049",
        "gas": 0n,
        "gasPrice": undefined,
        "hash": "0xf24f67fb9f8fb300164045fe6ba409acb03904e680ec7df41ed2d331dc38f545",
        "input": "0x02f87582010480840ee6b280840ee6b2808312b84b94a61464658afeaf65cccaafd3a512b69a83b77618880de0b6b3a764000080c080a08ab03d8a1aa4ab231867d9b12a1d7ebacaec3395cf9c4940674f83d79e342e4ca0475dda75d501e72fd816a9699f02af05ef7305668ee4acd0e25561d4628758a3",
        "l1BatchNumber": 1n,
        "l1BatchTxIndex": 5n,
        "maxFeePerGas": 250000000n,
        "maxPriorityFeePerGas": 250000000n,
        "nonce": 0,
        "r": "0x0",
        "s": "0x0",
        "to": "0xa61464658afeaf65cccaafd3a512b69a83b77618",
        "transactionIndex": 1,
        "type": "eip1559",
        "typeHex": "0x2",
        "v": 260n,
        "value": 1000000000000000000n,
        "yParity": 1,
      }
    `)

    expect(
      transaction.format({
        accessList: [],
        blockHash:
          '0xf24f67fb9f8fb300164045fe6ba409acb03904e680ec7df41ed2d331dc38f545',
        blockNumber: '0x1',
        chainId: '0x104',
        from: '0x36615cf349d7f6344891b1e7ca7c72883f5dc049',
        gas: '0x0',
        gasPrice: undefined,
        hash: '0xf24f67fb9f8fb300164045fe6ba409acb03904e680ec7df41ed2d331dc38f545',
        input:
          '0x02f87582010480840ee6b280840ee6b2808312b84b94a61464658afeaf65cccaafd3a512b69a83b77618880de0b6b3a764000080c080a08ab03d8a1aa4ab231867d9b12a1d7ebacaec3395cf9c4940674f83d79e342e4ca0475dda75d501e72fd816a9699f02af05ef7305668ee4acd0e25561d4628758a3',
        l1BatchNumber: null,
        maxFeePerGas: '0xee6b280',
        maxPriorityFeePerGas: '0xee6b280',
        nonce: '0x0',
        r: '0x0',
        s: '0x0',
        to: '0xa61464658afeaf65cccaafd3a512b69a83b77618',
        transactionIndex: '0x1',
        type: '0x2',
        v: '0x104',
        value: '0xde0b6b3a7640000',
        l1BatchTxIndex: null,
        yParity: '0x1',
      }),
    ).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "blockHash": "0xf24f67fb9f8fb300164045fe6ba409acb03904e680ec7df41ed2d331dc38f545",
        "blockNumber": 1n,
        "chainId": 260,
        "from": "0x36615cf349d7f6344891b1e7ca7c72883f5dc049",
        "gas": 0n,
        "gasPrice": undefined,
        "hash": "0xf24f67fb9f8fb300164045fe6ba409acb03904e680ec7df41ed2d331dc38f545",
        "input": "0x02f87582010480840ee6b280840ee6b2808312b84b94a61464658afeaf65cccaafd3a512b69a83b77618880de0b6b3a764000080c080a08ab03d8a1aa4ab231867d9b12a1d7ebacaec3395cf9c4940674f83d79e342e4ca0475dda75d501e72fd816a9699f02af05ef7305668ee4acd0e25561d4628758a3",
        "l1BatchNumber": null,
        "l1BatchTxIndex": null,
        "maxFeePerGas": 250000000n,
        "maxPriorityFeePerGas": 250000000n,
        "nonce": 0,
        "r": "0x0",
        "s": "0x0",
        "to": "0xa61464658afeaf65cccaafd3a512b69a83b77618",
        "transactionIndex": 1,
        "type": "eip1559",
        "typeHex": "0x2",
        "v": 260n,
        "value": 1000000000000000000n,
        "yParity": 1,
      }
    `)

    expect(
      transaction.format({
        accessList: [],
        blockHash:
          '0xf24f67fb9f8fb300164045fe6ba409acb03904e680ec7df41ed2d331dc38f545',
        blockNumber: '0x1',
        chainId: '0x104',
        from: '0x36615cf349d7f6344891b1e7ca7c72883f5dc049',
        gas: '0x0',
        gasPrice: undefined,
        hash: '0xf24f67fb9f8fb300164045fe6ba409acb03904e680ec7df41ed2d331dc38f545',
        input:
          '0x02f87582010480840ee6b280840ee6b2808312b84b94a61464658afeaf65cccaafd3a512b69a83b77618880de0b6b3a764000080c080a08ab03d8a1aa4ab231867d9b12a1d7ebacaec3395cf9c4940674f83d79e342e4ca0475dda75d501e72fd816a9699f02af05ef7305668ee4acd0e25561d4628758a3',
        l1BatchNumber: null,
        maxFeePerGas: '0xee6b280',
        maxPriorityFeePerGas: '0xee6b280',
        nonce: '0x0',
        r: '0x0',
        s: '0x0',
        to: '0xa61464658afeaf65cccaafd3a512b69a83b77618',
        transactionIndex: '0x1',
        type: '0x2',
        v: '0x104',
        yParity: '0x1',
        value: '0xde0b6b3a7640000',
        l1BatchTxIndex: null,
      }),
    ).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "blockHash": "0xf24f67fb9f8fb300164045fe6ba409acb03904e680ec7df41ed2d331dc38f545",
        "blockNumber": 1n,
        "chainId": 260,
        "from": "0x36615cf349d7f6344891b1e7ca7c72883f5dc049",
        "gas": 0n,
        "gasPrice": undefined,
        "hash": "0xf24f67fb9f8fb300164045fe6ba409acb03904e680ec7df41ed2d331dc38f545",
        "input": "0x02f87582010480840ee6b280840ee6b2808312b84b94a61464658afeaf65cccaafd3a512b69a83b77618880de0b6b3a764000080c080a08ab03d8a1aa4ab231867d9b12a1d7ebacaec3395cf9c4940674f83d79e342e4ca0475dda75d501e72fd816a9699f02af05ef7305668ee4acd0e25561d4628758a3",
        "l1BatchNumber": null,
        "l1BatchTxIndex": null,
        "maxFeePerGas": 250000000n,
        "maxPriorityFeePerGas": 250000000n,
        "nonce": 0,
        "r": "0x0",
        "s": "0x0",
        "to": "0xa61464658afeaf65cccaafd3a512b69a83b77618",
        "transactionIndex": 1,
        "type": "eip1559",
        "typeHex": "0x2",
        "v": 260n,
        "value": 1000000000000000000n,
        "yParity": 1,
      }
    `)
  })

  test('action - Priority', async () => {
    const client = createPublicClient({
      chain: zksync,
      transport: http(),
    })

    const transaction = await getTransaction(client, {
      blockNumber: 1n,
      index: 0,
    })

    expect(transaction).toMatchInlineSnapshot(`
      {
        "blockHash": "0x51f81bcdfc324a0dff2b5bec9d92e21cbebc4d5e29d3a3d30de3e03fbeab8d7f",
        "blockNumber": 1n,
        "chainId": 324,
        "from": "0x29df43f75149d0552475a6f9b2ac96e28796ed0b",
        "gas": 72000000n,
        "gasPrice": 0n,
        "hash": "0xe9a1a8601bc9199c80c97169fdc9e1fc7c307185a0c9fa2cfab04098a7840645",
        "input": "0x3cda33510000000000000000000000000000000000000000000000000000000000000000010000553109a66f1432eb2286c54694784d1b6993bc24a168be0a49b4d0fd4500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "l1BatchNumber": 1n,
        "l1BatchTxIndex": 0n,
        "maxFeePerBlobGas": undefined,
        "maxFeePerGas": 0n,
        "maxPriorityFeePerGas": 0n,
        "nonce": 0,
        "to": "0x0000000000000000000000000000000000008006",
        "transactionIndex": 0,
        "type": "priority",
        "typeHex": "0xff",
        "v": undefined,
        "value": 0n,
        "yParity": undefined,
      }
    `)
  })

  test('action - Legacy', async () => {
    const client = createPublicClient({
      chain: zksync,
      transport: http(),
    })

    const transaction = await getTransaction(client, {
      blockNumber: 150n,
      index: 0,
    })

    expect(transaction).toMatchInlineSnapshot(`
    {
      "blockHash": "0x3e9b219693a0850d24f1739869ccb3a867d521c5adaf53c87706ab810d32bed2",
      "blockNumber": 150n,
      "chainId": 324,
      "from": "0xcd5b610c0b53f63d9edaf0672929ddbfcbf15456",
      "gas": 1482241n,
      "gasPrice": 250000000n,
      "hash": "0x6bc7e6b26858b9aeb5958e3757d755738b0a792b829a4f6fffb72f5d2cb34709",
      "input": "0x",
      "l1BatchNumber": 26n,
      "l1BatchTxIndex": 19n,
      "nonce": 49,
      "r": "0x324e0198438135fe1a627a7f8844986a23471e71d33217db0621a4b380a0303f",
      "s": "0xba25941249fdb7b3948961ca007fed8b898d5f6f75d20564e970fb8ac769ce3",
      "to": "0x93235e9c76a90fc5320513d07b6e24293b8fcca8",
      "transactionIndex": 0,
      "type": "legacy",
      "typeHex": "0x0",
      "v": 683n,
      "value": 1000000000000000n,
    }
    `)
  })

  test('action - EIP1559', async () => {
    const client = createPublicClient({
      chain: zksync,
      transport: http(),
    })

    const transaction = await getTransaction(client, {
      blockNumber: 35530n,
      index: 0,
    })

    expect(transaction).toMatchInlineSnapshot(`
      {
        "blockHash": "0x3f95d3889717d263348ef9c8bf11438e102b7f6ac5c09ddf2afa1061506ff095",
        "blockNumber": 35530n,
        "chainId": 324,
        "from": "0x9bbfc28528f65df1d5acaa1d3cc402d30ad7a89c",
        "gas": 4500010n,
        "gasPrice": 250000000n,
        "hash": "0x573bd41a8a4b35cf171107f628851234d7cb83bb18fd47c601823839a3faae03",
        "input": "0x7ff36ab500000000000000000000000000000000000000000000000000000000009b2d0400000000000000000000000000000000000000000000000000000000000000800000000000000000000000009bbfc28528f65df1d5acaa1d3cc402d30ad7a89c00000000000000000000000000000000000000000000000000000000641e1c0100000000000000000000000000000000000000000000000000000000000000020000000000000000000000005aea5775959fbc2557cc8789bc1bf90a239d9a910000000000000000000000003355df6d4c9c3035724fd0e3914de96a5a83aaf4",
        "l1BatchNumber": 569n,
        "l1BatchTxIndex": 331n,
        "maxFeePerGas": 250000000n,
        "maxPriorityFeePerGas": 250000000n,
        "nonce": 3,
        "r": "0x74a76f0ec59c3ea5021c81c4f70453c1ae0184ca0fbb8112ac8dfe359d8ed7c6",
        "s": "0x162d33d2ab26e232e76928a2229394eaed8c66e6f39f784e3fb276b7438bab9a",
        "to": "0xbe7d1fd1f6748bbdefc4fbacafbb11c6fc506d1d",
        "transactionIndex": 0,
        "type": "eip1559",
        "typeHex": "0x2",
        "v": 0n,
        "value": 6000000000000000n,
        "yParity": 0,
      }
    `)
  })

  test('action - EIP712', async () => {
    const client = createPublicClient({
      chain: zksync,
      transport: http(),
    })

    const transaction = await getTransaction(client, {
      blockNumber: 35533n,
      index: 0,
    })

    expect(transaction).toMatchInlineSnapshot(`
      {
        "blockHash": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
        "blockNumber": 35533n,
        "chainId": 324,
        "from": "0xef9e8e39782b1b544a6eb6db6aa85207bacb4c20",
        "gas": 8783947n,
        "gasPrice": 250000000n,
        "hash": "0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6",
        "input": "0x0fc87d250000000000000000000000003355df6d4c9c3035724fd0e3914de96a5a83aaf40000000000000000000000003f81edcbd9bc84271fb8fdf270257a18f4d47e9b0000000000000000000000000000000000000000000002b94cc7d236b39b0bff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c2000000000000000000000000000000000000000000000000000000000641e1c0b0000000000000000000000000000000000000000000000000000000000000000",
        "l1BatchNumber": 569n,
        "l1BatchTxIndex": 340n,
        "maxFeePerBlobGas": undefined,
        "maxFeePerGas": 250000000n,
        "maxPriorityFeePerGas": 250000000n,
        "nonce": 15,
        "r": "0xfdea6b4ea965cb184257159dfdcbbe6045bf264c0de4d1b76c06821e4c33284",
        "s": "0x39d0abb813b58d4ebd9c085cc31df866df218803e6a7808f21c3c651e4609981",
        "to": "0x8b791913eb07c32779a16750e3868aa8495f5964",
        "transactionIndex": 0,
        "type": "eip712",
        "typeHex": "0x71",
        "v": 0n,
        "value": 0n,
        "yParity": 0,
      }
    `)
  })
})

describe('transaction receipt', () => {
  test('formatter', () => {
    const { transactionReceipt } = zksync.formatters!

    expect(
      transactionReceipt.format({
        transactionHash:
          '0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6',
        transactionIndex: '0x0',
        blockHash:
          '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
        blockNumber: '0x8acd',
        l1BatchTxIndex: '0x154',
        l1BatchNumber: '0x239',
        from: '0xef9e8e39782b1b544a6eb6db6aa85207bacb4c20',
        to: '0x8b791913eb07c32779a16750e3868aa8495f5964',
        cumulativeGasUsed: '0x0',
        gasUsed: '0x318fd7',
        contractAddress: null,
        logs: [
          {
            address: '0x000000000000000000000000000000000000800a',
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              '0x000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c20',
              '0x0000000000000000000000000000000000000000000000000000000000008001',
            ],
            data: '0x0000000000000000000000000000000000000000000000000007cd3d022a4b80',
            blockHash:
              '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
            blockNumber: '0x8acd',
            l1BatchNumber: '0x239',
            transactionHash:
              '0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6',
            transactionIndex: '0x0',
            logIndex: '0x0',
            transactionLogIndex: '0x0',
            logType: null,
            removed: false,
          },
          {
            address: '0xe0cdfcec9dcde1ec6b29d38673d3336a3a219c1e',
            topics: [
              '0xdec2bacdd2f05b59de34da9b523dff8be42e5e38e818c82fdb0bae774387a724',
              '0x000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c20',
            ],
            data: '0x0000000000000000000000000000000000000000000002b94cc7d236b39b0bff0000000000000000000000000000000000000000000000000000000000000000',
            blockHash:
              '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
            blockNumber: '0x8acd',
            l1BatchNumber: '0x239',
            transactionHash:
              '0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6',
            transactionIndex: '0x0',
            logIndex: '0x1',
            transactionLogIndex: '0x1',
            logType: null,
            removed: false,
          },
          {
            address: '0xe0cdfcec9dcde1ec6b29d38673d3336a3a219c1e',
            topics: [
              '0xdec2bacdd2f05b59de34da9b523dff8be42e5e38e818c82fdb0bae774387a724',
              '0x000000000000000000000000e0cdfcec9dcde1ec6b29d38673d3336a3a219c1e',
            ],
            data: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002b94cc7d236b39b0bff',
            blockHash:
              '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
            blockNumber: '0x8acd',
            l1BatchNumber: '0x239',
            transactionHash:
              '0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6',
            transactionIndex: '0x0',
            logIndex: '0x2',
            transactionLogIndex: '0x2',
            logType: null,
            removed: false,
          },
          {
            address: '0xe0cdfcec9dcde1ec6b29d38673d3336a3a219c1e',
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              '0x000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c20',
              '0x000000000000000000000000e0cdfcec9dcde1ec6b29d38673d3336a3a219c1e',
            ],
            data: '0x0000000000000000000000000000000000000000000002b94cc7d236b39b0bff',
            blockHash:
              '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
            blockNumber: '0x8acd',
            l1BatchNumber: '0x239',
            transactionHash:
              '0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6',
            transactionIndex: '0x0',
            logIndex: '0x3',
            transactionLogIndex: '0x3',
            logType: null,
            removed: false,
          },
          {
            address: '0xe0cdfcec9dcde1ec6b29d38673d3336a3a219c1e',
            topics: [
              '0xdec2bacdd2f05b59de34da9b523dff8be42e5e38e818c82fdb0bae774387a724',
              '0x000000000000000000000000e0cdfcec9dcde1ec6b29d38673d3336a3a219c1e',
            ],
            data: '0x0000000000000000000000000000000000000000000002b94cc7d236b39b0bff0000000000000000000000000000000000000000000000000000000000000000',
            blockHash:
              '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
            blockNumber: '0x8acd',
            l1BatchNumber: '0x239',
            transactionHash:
              '0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6',
            transactionIndex: '0x0',
            logIndex: '0x4',
            transactionLogIndex: '0x4',
            logType: null,
            removed: false,
          },
          {
            address: '0xe0cdfcec9dcde1ec6b29d38673d3336a3a219c1e',
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              '0x000000000000000000000000e0cdfcec9dcde1ec6b29d38673d3336a3a219c1e',
              '0x0000000000000000000000000000000000000000000000000000000000000000',
            ],
            data: '0x0000000000000000000000000000000000000000000002b94cc7d236b39b0bff',
            blockHash:
              '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
            blockNumber: '0x8acd',
            l1BatchNumber: '0x239',
            transactionHash:
              '0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6',
            transactionIndex: '0x0',
            logIndex: '0x5',
            transactionLogIndex: '0x5',
            logType: null,
            removed: false,
          },
          {
            address: '0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4',
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              '0x000000000000000000000000e0cdfcec9dcde1ec6b29d38673d3336a3a219c1e',
              '0x000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c20',
            ],
            data: '0x0000000000000000000000000000000000000000000000000000000009f62322',
            blockHash:
              '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
            blockNumber: '0x8acd',
            l1BatchNumber: '0x239',
            transactionHash:
              '0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6',
            transactionIndex: '0x0',
            logIndex: '0x6',
            transactionLogIndex: '0x6',
            logType: null,
            removed: false,
          },
          {
            address: '0x3f81edcbd9bc84271fb8fdf270257a18f4d47e9b',
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              '0x000000000000000000000000e0cdfcec9dcde1ec6b29d38673d3336a3a219c1e',
              '0x000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c20',
            ],
            data: '0x0000000000000000000000000000000000beaac4bd1b7f557aaca0ff08cfb011',
            blockHash:
              '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
            blockNumber: '0x8acd',
            l1BatchNumber: '0x239',
            transactionHash:
              '0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6',
            transactionIndex: '0x0',
            logIndex: '0x7',
            transactionLogIndex: '0x7',
            logType: null,
            removed: false,
          },
          {
            address: '0xe0cdfcec9dcde1ec6b29d38673d3336a3a219c1e',
            topics: [
              '0xcf2aa50876cdfbb541206f89af0ee78d44a2abf8d328e37fa4917f982149848a',
            ],
            data: '0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000001116facf7304fef',
            blockHash:
              '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
            blockNumber: '0x8acd',
            l1BatchNumber: '0x239',
            transactionHash:
              '0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6',
            transactionIndex: '0x0',
            logIndex: '0x8',
            transactionLogIndex: '0x8',
            logType: null,
            removed: false,
          },
          {
            address: '0xe0cdfcec9dcde1ec6b29d38673d3336a3a219c1e',
            topics: [
              '0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496',
              '0x0000000000000000000000008b791913eb07c32779a16750e3868aa8495f5964',
              '0x000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c20',
            ],
            data: '0x0000000000000000000000000000000000000000000000000000000009f623220000000000000000000000000000000000beaac4bd1b7f557aaca0ff08cfb011',
            blockHash:
              '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
            blockNumber: '0x8acd',
            l1BatchNumber: null,
            transactionHash:
              '0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6',
            transactionIndex: '0x0',
            logIndex: '0x9',
            transactionLogIndex: '0x9',
            logType: null,
            removed: false,
          },
          {
            address: '0x000000000000000000000000000000000000800a',
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              '0x0000000000000000000000000000000000000000000000000000000000008001',
              '0x000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c20',
            ],
            data: '0x0000000000000000000000000000000000000000000000000004eab57634e200',
            blockHash:
              '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
            blockNumber: '0x8acd',
            l1BatchNumber: '0x239',
            transactionHash:
              '0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6',
            transactionIndex: '0x0',
            logIndex: '0xa',
            transactionLogIndex: '0xa',
            logType: null,
            removed: false,
          },
        ],
        l2ToL1Logs: [],
        status: '0x1',
        root: '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
        logsBloom:
          '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        type: '0x71',
        effectiveGasPrice: '0xee6b280',
      }),
    ).toMatchInlineSnapshot(`
      {
        "blockHash": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
        "blockNumber": 35533n,
        "contractAddress": null,
        "cumulativeGasUsed": 0n,
        "effectiveGasPrice": 250000000n,
        "from": "0xef9e8e39782b1b544a6eb6db6aa85207bacb4c20",
        "gasUsed": 3248087n,
        "l1BatchNumber": 569n,
        "l1BatchTxIndex": 340n,
        "l2ToL1Logs": [],
        "logs": [
          {
            "address": "0x000000000000000000000000000000000000800a",
            "blockHash": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
            "blockNumber": 35533n,
            "data": "0x0000000000000000000000000000000000000000000000000007cd3d022a4b80",
            "l1BatchNumber": 569n,
            "logIndex": 0,
            "logType": null,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c20",
              "0x0000000000000000000000000000000000000000000000000000000000008001",
            ],
            "transactionHash": "0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6",
            "transactionIndex": 0,
            "transactionLogIndex": 0,
          },
          {
            "address": "0xe0cdfcec9dcde1ec6b29d38673d3336a3a219c1e",
            "blockHash": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
            "blockNumber": 35533n,
            "data": "0x0000000000000000000000000000000000000000000002b94cc7d236b39b0bff0000000000000000000000000000000000000000000000000000000000000000",
            "l1BatchNumber": 569n,
            "logIndex": 1,
            "logType": null,
            "removed": false,
            "topics": [
              "0xdec2bacdd2f05b59de34da9b523dff8be42e5e38e818c82fdb0bae774387a724",
              "0x000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c20",
            ],
            "transactionHash": "0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6",
            "transactionIndex": 0,
            "transactionLogIndex": 1,
          },
          {
            "address": "0xe0cdfcec9dcde1ec6b29d38673d3336a3a219c1e",
            "blockHash": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
            "blockNumber": 35533n,
            "data": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002b94cc7d236b39b0bff",
            "l1BatchNumber": 569n,
            "logIndex": 2,
            "logType": null,
            "removed": false,
            "topics": [
              "0xdec2bacdd2f05b59de34da9b523dff8be42e5e38e818c82fdb0bae774387a724",
              "0x000000000000000000000000e0cdfcec9dcde1ec6b29d38673d3336a3a219c1e",
            ],
            "transactionHash": "0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6",
            "transactionIndex": 0,
            "transactionLogIndex": 2,
          },
          {
            "address": "0xe0cdfcec9dcde1ec6b29d38673d3336a3a219c1e",
            "blockHash": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
            "blockNumber": 35533n,
            "data": "0x0000000000000000000000000000000000000000000002b94cc7d236b39b0bff",
            "l1BatchNumber": 569n,
            "logIndex": 3,
            "logType": null,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c20",
              "0x000000000000000000000000e0cdfcec9dcde1ec6b29d38673d3336a3a219c1e",
            ],
            "transactionHash": "0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6",
            "transactionIndex": 0,
            "transactionLogIndex": 3,
          },
          {
            "address": "0xe0cdfcec9dcde1ec6b29d38673d3336a3a219c1e",
            "blockHash": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
            "blockNumber": 35533n,
            "data": "0x0000000000000000000000000000000000000000000002b94cc7d236b39b0bff0000000000000000000000000000000000000000000000000000000000000000",
            "l1BatchNumber": 569n,
            "logIndex": 4,
            "logType": null,
            "removed": false,
            "topics": [
              "0xdec2bacdd2f05b59de34da9b523dff8be42e5e38e818c82fdb0bae774387a724",
              "0x000000000000000000000000e0cdfcec9dcde1ec6b29d38673d3336a3a219c1e",
            ],
            "transactionHash": "0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6",
            "transactionIndex": 0,
            "transactionLogIndex": 4,
          },
          {
            "address": "0xe0cdfcec9dcde1ec6b29d38673d3336a3a219c1e",
            "blockHash": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
            "blockNumber": 35533n,
            "data": "0x0000000000000000000000000000000000000000000002b94cc7d236b39b0bff",
            "l1BatchNumber": 569n,
            "logIndex": 5,
            "logType": null,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000e0cdfcec9dcde1ec6b29d38673d3336a3a219c1e",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
            ],
            "transactionHash": "0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6",
            "transactionIndex": 0,
            "transactionLogIndex": 5,
          },
          {
            "address": "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4",
            "blockHash": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
            "blockNumber": 35533n,
            "data": "0x0000000000000000000000000000000000000000000000000000000009f62322",
            "l1BatchNumber": 569n,
            "logIndex": 6,
            "logType": null,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000e0cdfcec9dcde1ec6b29d38673d3336a3a219c1e",
              "0x000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c20",
            ],
            "transactionHash": "0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6",
            "transactionIndex": 0,
            "transactionLogIndex": 6,
          },
          {
            "address": "0x3f81edcbd9bc84271fb8fdf270257a18f4d47e9b",
            "blockHash": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
            "blockNumber": 35533n,
            "data": "0x0000000000000000000000000000000000beaac4bd1b7f557aaca0ff08cfb011",
            "l1BatchNumber": 569n,
            "logIndex": 7,
            "logType": null,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000e0cdfcec9dcde1ec6b29d38673d3336a3a219c1e",
              "0x000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c20",
            ],
            "transactionHash": "0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6",
            "transactionIndex": 0,
            "transactionLogIndex": 7,
          },
          {
            "address": "0xe0cdfcec9dcde1ec6b29d38673d3336a3a219c1e",
            "blockHash": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
            "blockNumber": 35533n,
            "data": "0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000001116facf7304fef",
            "l1BatchNumber": 569n,
            "logIndex": 8,
            "logType": null,
            "removed": false,
            "topics": [
              "0xcf2aa50876cdfbb541206f89af0ee78d44a2abf8d328e37fa4917f982149848a",
            ],
            "transactionHash": "0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6",
            "transactionIndex": 0,
            "transactionLogIndex": 8,
          },
          {
            "address": "0xe0cdfcec9dcde1ec6b29d38673d3336a3a219c1e",
            "blockHash": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
            "blockNumber": 35533n,
            "data": "0x0000000000000000000000000000000000000000000000000000000009f623220000000000000000000000000000000000beaac4bd1b7f557aaca0ff08cfb011",
            "l1BatchNumber": null,
            "logIndex": 9,
            "logType": null,
            "removed": false,
            "topics": [
              "0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496",
              "0x0000000000000000000000008b791913eb07c32779a16750e3868aa8495f5964",
              "0x000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c20",
            ],
            "transactionHash": "0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6",
            "transactionIndex": 0,
            "transactionLogIndex": 9,
          },
          {
            "address": "0x000000000000000000000000000000000000800a",
            "blockHash": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
            "blockNumber": 35533n,
            "data": "0x0000000000000000000000000000000000000000000000000004eab57634e200",
            "l1BatchNumber": 569n,
            "logIndex": 10,
            "logType": null,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x0000000000000000000000000000000000000000000000000000000000008001",
              "0x000000000000000000000000ef9e8e39782b1b544a6eb6db6aa85207bacb4c20",
            ],
            "transactionHash": "0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6",
            "transactionIndex": 0,
            "transactionLogIndex": 10,
          },
        ],
        "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "root": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
        "status": "success",
        "to": "0x8b791913eb07c32779a16750e3868aa8495f5964",
        "transactionHash": "0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6",
        "transactionIndex": 0,
        "type": "0x71",
      }
    `)

    expect(
      transactionReceipt.format({
        transactionHash:
          '0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6',
        transactionIndex: '0x0',
        blockHash:
          '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
        blockNumber: '0x8acd',
        l1BatchTxIndex: null,
        l1BatchNumber: null,
        from: '0xef9e8e39782b1b544a6eb6db6aa85207bacb4c20',
        to: '0x8b791913eb07c32779a16750e3868aa8495f5964',
        cumulativeGasUsed: '0x0',
        gasUsed: '0x318fd7',
        contractAddress: null,
        logs: [],
        l2ToL1Logs: [],
        status: '0x1',
        root: '0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2',
        logsBloom:
          '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        type: '0x71',
        effectiveGasPrice: '0xee6b280',
      }),
    ).toMatchInlineSnapshot(`
      {
        "blockHash": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
        "blockNumber": 35533n,
        "contractAddress": null,
        "cumulativeGasUsed": 0n,
        "effectiveGasPrice": 250000000n,
        "from": "0xef9e8e39782b1b544a6eb6db6aa85207bacb4c20",
        "gasUsed": 3248087n,
        "l1BatchNumber": null,
        "l1BatchTxIndex": null,
        "l2ToL1Logs": [],
        "logs": [],
        "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "root": "0xfd73aaef0e91fcd6c171056b235a2b0f17650dcbe17038d17f76bbf3980c4da2",
        "status": "success",
        "to": "0x8b791913eb07c32779a16750e3868aa8495f5964",
        "transactionHash": "0xe56c11904d690e1bd41a7e901df609c2dc011d1033415379193ebc4197f32fc6",
        "transactionIndex": 0,
        "type": "0x71",
      }
    `)
  })

  test('action', async () => {
    const client = createPublicClient({
      chain: zksync,
      transport: http(),
    })

    const transaction = await getTransactionReceipt(client, {
      hash: '0xec06ab90e8cbada2b205874567504ceed9e005df452a997472823a8b59cb30ec',
    })

    expect(transaction).toMatchInlineSnapshot(`
      {
        "blockHash": "0x51f81bcdfc324a0dff2b5bec9d92e21cbebc4d5e29d3a3d30de3e03fbeab8d7f",
        "blockNumber": 1n,
        "contractAddress": "0x11f943b2c77b743ab90f4a0ae7d5a4e7fca3e102",
        "cumulativeGasUsed": 0n,
        "effectiveGasPrice": 0n,
        "from": "0x689a1966931eb4bb6fb81430e6ce0a03aabdf174",
        "gasUsed": 72000000n,
        "l1BatchNumber": 1n,
        "l1BatchTxIndex": 5n,
        "l2ToL1Logs": [
          {
            "blockHash": "0x51f81bcdfc324a0dff2b5bec9d92e21cbebc4d5e29d3a3d30de3e03fbeab8d7f",
            "blockNumber": 37075710707809432191796592030900317027155189206620910115769376626082614840703n,
            "isService": true,
            "key": "0xec06ab90e8cbada2b205874567504ceed9e005df452a997472823a8b59cb30ec",
            "l1BatchNumber": 1n,
            "logIndex": 6n,
            "sender": "0x0000000000000000000000000000000000008001",
            "shardId": 0n,
            "transactionHash": "0xec06ab90e8cbada2b205874567504ceed9e005df452a997472823a8b59cb30ec",
            "transactionIndex": 5n,
            "value": "0x0000000000000000000000000000000000000000000000000000000000000001",
          },
        ],
        "logs": [
          {
            "address": "0x11f943b2c77b743ab90f4a0ae7d5a4e7fca3e102",
            "blockHash": "0x51f81bcdfc324a0dff2b5bec9d92e21cbebc4d5e29d3a3d30de3e03fbeab8d7f",
            "blockNumber": 1n,
            "blockTimestamp": "0x63eb991e",
            "data": "0x",
            "l1BatchNumber": 1n,
            "logIndex": 14,
            "logType": null,
            "removed": false,
            "topics": [
              "0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b",
              "0x0000000000000000000000006d7a34eb3055549866a227df64e954b142d97430",
            ],
            "transactionHash": "0xec06ab90e8cbada2b205874567504ceed9e005df452a997472823a8b59cb30ec",
            "transactionIndex": 5,
            "transactionLogIndex": 0,
          },
          {
            "address": "0x9c931462ac1bf8b47a727aaad7776405ac894482",
            "blockHash": "0x51f81bcdfc324a0dff2b5bec9d92e21cbebc4d5e29d3a3d30de3e03fbeab8d7f",
            "blockNumber": 1n,
            "blockTimestamp": "0x63eb991e",
            "data": "0x0000000000000000000000000000000000000000000000000000000000000001",
            "l1BatchNumber": 1n,
            "logIndex": 15,
            "logType": null,
            "removed": false,
            "topics": [
              "0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498",
            ],
            "transactionHash": "0xec06ab90e8cbada2b205874567504ceed9e005df452a997472823a8b59cb30ec",
            "transactionIndex": 5,
            "transactionLogIndex": 1,
          },
          {
            "address": "0x0000000000000000000000000000000000008006",
            "blockHash": "0x51f81bcdfc324a0dff2b5bec9d92e21cbebc4d5e29d3a3d30de3e03fbeab8d7f",
            "blockNumber": 1n,
            "blockTimestamp": "0x63eb991e",
            "data": "0x",
            "l1BatchNumber": 1n,
            "logIndex": 16,
            "logType": null,
            "removed": false,
            "topics": [
              "0x290afdae231a3fc0bbae8b1af63698b0a1d79b21ad17df0342dfb952fe74f8e5",
              "0x00000000000000000000000011f943b2c77b743ab90f4a0ae7d5a4e7fca3e102",
              "0x0100033fd2449be163d507a8801182eb51381e623e8fad17a786ffb51b75d882",
              "0x0000000000000000000000009c931462ac1bf8b47a727aaad7776405ac894482",
            ],
            "transactionHash": "0xec06ab90e8cbada2b205874567504ceed9e005df452a997472823a8b59cb30ec",
            "transactionIndex": 5,
            "transactionLogIndex": 2,
          },
          {
            "address": "0x1eb710030273e529a6ad7e1e14d4e601765ba3c6",
            "blockHash": "0x51f81bcdfc324a0dff2b5bec9d92e21cbebc4d5e29d3a3d30de3e03fbeab8d7f",
            "blockNumber": 1n,
            "blockTimestamp": "0x63eb991e",
            "data": "0x",
            "l1BatchNumber": 1n,
            "logIndex": 17,
            "logType": null,
            "removed": false,
            "topics": [
              "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x00000000000000000000000011f943b2c77b743ab90f4a0ae7d5a4e7fca3e102",
            ],
            "transactionHash": "0xec06ab90e8cbada2b205874567504ceed9e005df452a997472823a8b59cb30ec",
            "transactionIndex": 5,
            "transactionLogIndex": 3,
          },
          {
            "address": "0x0000000000000000000000000000000000008006",
            "blockHash": "0x51f81bcdfc324a0dff2b5bec9d92e21cbebc4d5e29d3a3d30de3e03fbeab8d7f",
            "blockNumber": 1n,
            "blockTimestamp": "0x63eb991e",
            "data": "0x",
            "l1BatchNumber": 1n,
            "logIndex": 18,
            "logType": null,
            "removed": false,
            "topics": [
              "0x290afdae231a3fc0bbae8b1af63698b0a1d79b21ad17df0342dfb952fe74f8e5",
              "0x00000000000000000000000011f943b2c77b743ab90f4a0ae7d5a4e7fca3e102",
              "0x0100009979ec46148a53897990610eee987ed2b2498649d890a8b8303cc9a719",
              "0x0000000000000000000000001eb710030273e529a6ad7e1e14d4e601765ba3c6",
            ],
            "transactionHash": "0xec06ab90e8cbada2b205874567504ceed9e005df452a997472823a8b59cb30ec",
            "transactionIndex": 5,
            "transactionLogIndex": 4,
          },
          {
            "address": "0x1eb710030273e529a6ad7e1e14d4e601765ba3c6",
            "blockHash": "0x51f81bcdfc324a0dff2b5bec9d92e21cbebc4d5e29d3a3d30de3e03fbeab8d7f",
            "blockNumber": 1n,
            "blockTimestamp": "0x63eb991e",
            "data": "0x",
            "l1BatchNumber": 1n,
            "logIndex": 19,
            "logType": null,
            "removed": false,
            "topics": [
              "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
              "0x00000000000000000000000011f943b2c77b743ab90f4a0ae7d5a4e7fca3e102",
              "0x00000000000000000000000029df43f75149d0552475a6f9b2ac96e28796ed0b",
            ],
            "transactionHash": "0xec06ab90e8cbada2b205874567504ceed9e005df452a997472823a8b59cb30ec",
            "transactionIndex": 5,
            "transactionLogIndex": 5,
          },
          {
            "address": "0x11f943b2c77b743ab90f4a0ae7d5a4e7fca3e102",
            "blockHash": "0x51f81bcdfc324a0dff2b5bec9d92e21cbebc4d5e29d3a3d30de3e03fbeab8d7f",
            "blockNumber": 1n,
            "blockTimestamp": "0x63eb991e",
            "data": "0x0000000000000000000000000000000000000000000000000000000000000001",
            "l1BatchNumber": 1n,
            "logIndex": 20,
            "logType": null,
            "removed": false,
            "topics": [
              "0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498",
            ],
            "transactionHash": "0xec06ab90e8cbada2b205874567504ceed9e005df452a997472823a8b59cb30ec",
            "transactionIndex": 5,
            "transactionLogIndex": 6,
          },
          {
            "address": "0x11f943b2c77b743ab90f4a0ae7d5a4e7fca3e102",
            "blockHash": "0x51f81bcdfc324a0dff2b5bec9d92e21cbebc4d5e29d3a3d30de3e03fbeab8d7f",
            "blockNumber": 1n,
            "blockTimestamp": "0x63eb991e",
            "data": "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000029df43f75149d0552475a6f9b2ac96e28796ed0b",
            "l1BatchNumber": 1n,
            "logIndex": 21,
            "logType": null,
            "removed": false,
            "topics": [
              "0x7e644d79422f17c01e4894b5f4f588d331ebfa28653d42ae832dc59e38c9798f",
            ],
            "transactionHash": "0xec06ab90e8cbada2b205874567504ceed9e005df452a997472823a8b59cb30ec",
            "transactionIndex": 5,
            "transactionLogIndex": 7,
          },
          {
            "address": "0x0000000000000000000000000000000000008006",
            "blockHash": "0x51f81bcdfc324a0dff2b5bec9d92e21cbebc4d5e29d3a3d30de3e03fbeab8d7f",
            "blockNumber": 1n,
            "blockTimestamp": "0x63eb991e",
            "data": "0x",
            "l1BatchNumber": 1n,
            "logIndex": 22,
            "logType": null,
            "removed": false,
            "topics": [
              "0x290afdae231a3fc0bbae8b1af63698b0a1d79b21ad17df0342dfb952fe74f8e5",
              "0x000000000000000000000000689a1966931eb4bb6fb81430e6ce0a03aabdf174",
              "0x010001731d2166e711848b2386b8da623c20fc3c2e428eadca169a615ddec57a",
              "0x00000000000000000000000011f943b2c77b743ab90f4a0ae7d5a4e7fca3e102",
            ],
            "transactionHash": "0xec06ab90e8cbada2b205874567504ceed9e005df452a997472823a8b59cb30ec",
            "transactionIndex": 5,
            "transactionLogIndex": 8,
          },
          {
            "address": "0x000000000000000000000000000000000000800a",
            "blockHash": "0x51f81bcdfc324a0dff2b5bec9d92e21cbebc4d5e29d3a3d30de3e03fbeab8d7f",
            "blockNumber": 1n,
            "blockTimestamp": "0x63eb991e",
            "data": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "l1BatchNumber": 1n,
            "logIndex": 23,
            "logType": null,
            "removed": false,
            "topics": [
              "0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885",
              "0x000000000000000000000000c301f8b2a2c08958e6e7a286ab49a986c1f7ef6a",
            ],
            "transactionHash": "0xec06ab90e8cbada2b205874567504ceed9e005df452a997472823a8b59cb30ec",
            "transactionIndex": 5,
            "transactionLogIndex": 9,
          },
        ],
        "logsBloom": "0x00000020000400000000000000000000400100000000000000800000040000000000000000000000100000000010000020000000001000000000000000000000000000000020040000002100000042000001000000000000000000000000000000000000020000000000000001000800000000800000400000000000000000400000081000000000000000000000000000000100000080000000100020800000008080000001000000000000800400030440000010000000002000010000000080000020008100000000200000040000085000000552000000010000000020000802000000100000000000000000000010000080000000000200000010004000",
        "status": "success",
        "to": "0x0000000000000000000000000000000000008006",
        "transactionHash": "0xec06ab90e8cbada2b205874567504ceed9e005df452a997472823a8b59cb30ec",
        "transactionIndex": 5,
        "type": "0xff",
      }
    `)
  })
})

describe('transactionRequest', () => {
  test('formatter', () => {
    const { transactionRequest } = zksync.formatters!

    const baseRequest = {
      from: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9' as `0x${string}`,
      gas: 13000n,
      nonce: 4,
      maxFeePerGas: 2n,
      maxPriorityFeePerGas: 1n,
      value: 0n,
    }

    // Provide all EIP712Meta fields, except customSignature
    expect(
      transactionRequest.format({
        ...baseRequest,
        paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021',
        paymasterInput:
          '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
        gasPerPubdata: 50000n,
        factoryDeps: ['0x1234', '0xabcd'],
        type: 'eip712',
      }),
    ).toMatchInlineSnapshot(`
      {
        "eip712Meta": {
          "factoryDeps": [
            [
              18,
              52,
            ],
            [
              171,
              205,
            ],
          ],
          "gasPerPubdata": "0xc350",
          "paymasterParams": {
            "paymaster": "0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021",
            "paymasterInput": [
              140,
              90,
              52,
              69,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              32,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
            ],
          },
        },
        "from": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "gas": "0x32c8",
        "maxFeePerGas": "0x2",
        "maxPriorityFeePerGas": "0x1",
        "nonce": "0x4",
        "type": "0x71",
        "value": "0x0",
      }
    `)

    // Only factoryDeps defined
    expect(
      transactionRequest.format({
        ...baseRequest,
        factoryDeps: ['0x1234', '0xabcd'],
        type: 'eip712',
      }),
    ).toMatchInlineSnapshot(`
      {
        "eip712Meta": {
          "factoryDeps": [
            [
              18,
              52,
            ],
            [
              171,
              205,
            ],
          ],
          "gasPerPubdata": "0xc350",
        },
        "from": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "gas": "0x32c8",
        "maxFeePerGas": "0x2",
        "maxPriorityFeePerGas": "0x1",
        "nonce": "0x4",
        "type": "0x71",
        "value": "0x0",
      }
    `)

    // Only customSignature defined
    expect(
      transactionRequest.format({
        ...baseRequest,
        customSignature: '0x1234',
        type: 'eip712',
      }),
    ).toMatchInlineSnapshot(`
      {
        "eip712Meta": {
          "customSignature": [
            18,
            52,
          ],
          "gasPerPubdata": "0xc350",
        },
        "from": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "gas": "0x32c8",
        "maxFeePerGas": "0x2",
        "maxPriorityFeePerGas": "0x1",
        "nonce": "0x4",
        "type": "0x71",
        "value": "0x0",
      }
    `)

    // Only paymaster and paymasterInput defined
    expect(
      transactionRequest.format({
        ...baseRequest,
        paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021',
        paymasterInput:
          '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
        type: 'eip712',
      }),
    ).toMatchInlineSnapshot(`
      {
        "eip712Meta": {
          "gasPerPubdata": "0xc350",
          "paymasterParams": {
            "paymaster": "0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021",
            "paymasterInput": [
              140,
              90,
              52,
              69,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              32,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
            ],
          },
        },
        "from": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "gas": "0x32c8",
        "maxFeePerGas": "0x2",
        "maxPriorityFeePerGas": "0x1",
        "nonce": "0x4",
        "type": "0x71",
        "value": "0x0",
      }
    `)

    // Only gasPerPubdata defined
    expect(
      transactionRequest.format({
        ...baseRequest,
        gasPerPubdata: 50000n,
        type: 'eip712',
      }),
    ).toMatchInlineSnapshot(`
      {
        "eip712Meta": {
          "gasPerPubdata": "0xc350",
        },
        "from": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "gas": "0x32c8",
        "maxFeePerGas": "0x2",
        "maxPriorityFeePerGas": "0x1",
        "nonce": "0x4",
        "type": "0x71",
        "value": "0x0",
      }
    `)

    // Only gasPerPubdata defined with type priority
    expect(
      transactionRequest.format({
        ...baseRequest,
        gasPerPubdata: 50000n,
        type: 'priority',
      }),
    ).toMatchInlineSnapshot(`
      {
        "eip712Meta": {
          "gasPerPubdata": "0xc350",
        },
        "from": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "gas": "0x32c8",
        "maxFeePerGas": "0x2",
        "maxPriorityFeePerGas": "0x1",
        "nonce": "0x4",
        "type": "0x71",
        "value": "0x0",
      }
    `)

    // No EIP712 field defined
    expect(transactionRequest.format(baseRequest)).toMatchInlineSnapshot(`
      {
        "from": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "gas": "0x32c8",
        "maxFeePerGas": "0x2",
        "maxPriorityFeePerGas": "0x1",
        "nonce": "0x4",
        "value": "0x0",
      }
    `)
  })
})
