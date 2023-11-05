import { describe, expect, test } from 'vitest'

import { getBlock } from '../../actions/public/getBlock.js'
import { getTransaction } from '../../actions/public/getTransaction.js'
import { getTransactionReceipt } from '../../actions/public/getTransactionReceipt.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import { celo } from '../index.js'

describe('block', () => {
  test('formatter', () => {
    const { block } = celo.formatters!

    expect(
      block.format({
        baseFeePerGas: '0x0',
        extraData:
          '0xd983010700846765746889676f312e31372e3133856c696e7578000000000000f8ccc0c080b84169807e4d7934803decfde330167e444ec323431e1ff4cd70f40f2e79f24ce91f60340b99f97e3562ee57389e2c72343a74379e0b8b7ca5237ec141e84278bb3e00f8418e3e8af95497b7f6ffe7d3c4cbfbbdb06b26f6f3e913ca2cb7dff23532eaf3eb9f3b06ae75498c88353d279cf58fb0570736e2aa20cf53381722b6485f0f3c8180f8418e3fffffffffffffffffffffffffffb0005d23be939b9f8135e6b1ff283baff985c1b6ccacf2b6aa7fbd8939c4b6178b1d242b574a614b6347182a3b3195258080',
        gasUsed: '0x1',
        hash: '0xac8c9bc3b84e103dc321bbe83b670e425ff68bfc9a333a4f1b1b204ad11c583d',
        logsBloom:
          '0x02004000004200000000000000800020000000000000400002040000002020000000802000000000000180000001000020800000000000000000000000000000000000000022000260000008000800000000000000000000000000000000000000000008000410002100000140000800000044c00200000000400010000800008800000080000000000010000040000000000000000000000000000000800020028000000100000000000000000000002002881000000000000800020000040020900402020000180000000000000040000800000011020090002000400000200010002000001000000000000080000000000000000000000000000004000000',
        miner: '0xe267d978037b89db06c6a5fcf82fad8297e290ff',
        number: '0x2',
        parentHash:
          '0xf6e57c99be5a81167bcb7bdf8d55572235384182c71635857ace2c04d25294ed',
        randomness: {
          committed:
            '0x339714505ecf55eacc2d2568ea53a7424bd0aa40fd710fd6892464d0716da711',
          revealed:
            '0xe10b5f01b0376fdc9151f66992f8c1b990083acabc14ec1b04f6a53ad804db88',
        },
        receiptsRoot:
          '0xca8aabc507534e45c982aa43e38118fc6f9cf222800e3d703a6e299a2e661f2a',
        size: '0x3',
        stateRoot:
          '0x051c8e40ed3d8afabbad5321a4bb6b9d686a8a62d9b696b3e5a5c769c3623d48',
        timestamp: '0x4',
        totalDifficulty: '0x5',
        transactions: [
          '0x487efb864b308ee85afd7ed5954e968457cfe84e71726114b0a44f31fb876e85',
        ],
        transactionsRoot:
          '0xb293e2c4ce20a9eac253241e750a5592c9d3c1b27bf090d0fc2fa4756a038866',
      }),
    ).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": 0n,
        "extraData": "0xd983010700846765746889676f312e31372e3133856c696e7578000000000000f8ccc0c080b84169807e4d7934803decfde330167e444ec323431e1ff4cd70f40f2e79f24ce91f60340b99f97e3562ee57389e2c72343a74379e0b8b7ca5237ec141e84278bb3e00f8418e3e8af95497b7f6ffe7d3c4cbfbbdb06b26f6f3e913ca2cb7dff23532eaf3eb9f3b06ae75498c88353d279cf58fb0570736e2aa20cf53381722b6485f0f3c8180f8418e3fffffffffffffffffffffffffffb0005d23be939b9f8135e6b1ff283baff985c1b6ccacf2b6aa7fbd8939c4b6178b1d242b574a614b6347182a3b3195258080",
        "gasUsed": 1n,
        "hash": "0xac8c9bc3b84e103dc321bbe83b670e425ff68bfc9a333a4f1b1b204ad11c583d",
        "logsBloom": "0x02004000004200000000000000800020000000000000400002040000002020000000802000000000000180000001000020800000000000000000000000000000000000000022000260000008000800000000000000000000000000000000000000000008000410002100000140000800000044c00200000000400010000800008800000080000000000010000040000000000000000000000000000000800020028000000100000000000000000000002002881000000000000800020000040020900402020000180000000000000040000800000011020090002000400000200010002000001000000000000080000000000000000000000000000004000000",
        "miner": "0xe267d978037b89db06c6a5fcf82fad8297e290ff",
        "number": 2n,
        "parentHash": "0xf6e57c99be5a81167bcb7bdf8d55572235384182c71635857ace2c04d25294ed",
        "randomness": {
          "committed": "0x339714505ecf55eacc2d2568ea53a7424bd0aa40fd710fd6892464d0716da711",
          "revealed": "0xe10b5f01b0376fdc9151f66992f8c1b990083acabc14ec1b04f6a53ad804db88",
        },
        "receiptsRoot": "0xca8aabc507534e45c982aa43e38118fc6f9cf222800e3d703a6e299a2e661f2a",
        "size": 3n,
        "stateRoot": "0x051c8e40ed3d8afabbad5321a4bb6b9d686a8a62d9b696b3e5a5c769c3623d48",
        "timestamp": 4n,
        "totalDifficulty": 5n,
        "transactions": [
          "0x487efb864b308ee85afd7ed5954e968457cfe84e71726114b0a44f31fb876e85",
        ],
        "transactionsRoot": "0xb293e2c4ce20a9eac253241e750a5592c9d3c1b27bf090d0fc2fa4756a038866",
      }
    `)

    expect(
      block.format({
        baseFeePerGas: '0x0',
        extraData:
          '0xd983010700846765746889676f312e31372e3133856c696e7578000000000000f8ccc0c080b84169807e4d7934803decfde330167e444ec323431e1ff4cd70f40f2e79f24ce91f60340b99f97e3562ee57389e2c72343a74379e0b8b7ca5237ec141e84278bb3e00f8418e3e8af95497b7f6ffe7d3c4cbfbbdb06b26f6f3e913ca2cb7dff23532eaf3eb9f3b06ae75498c88353d279cf58fb0570736e2aa20cf53381722b6485f0f3c8180f8418e3fffffffffffffffffffffffffffb0005d23be939b9f8135e6b1ff283baff985c1b6ccacf2b6aa7fbd8939c4b6178b1d242b574a614b6347182a3b3195258080',
        gasUsed: '0x1',
        hash: '0xac8c9bc3b84e103dc321bbe83b670e425ff68bfc9a333a4f1b1b204ad11c583d',
        logsBloom:
          '0x02004000004200000000000000800020000000000000400002040000002020000000802000000000000180000001000020800000000000000000000000000000000000000022000260000008000800000000000000000000000000000000000000000008000410002100000140000800000044c00200000000400010000800008800000080000000000010000040000000000000000000000000000000800020028000000100000000000000000000002002881000000000000800020000040020900402020000180000000000000040000800000011020090002000400000200010002000001000000000000080000000000000000000000000000004000000',
        miner: '0xe267d978037b89db06c6a5fcf82fad8297e290ff',
        number: '0x2',
        parentHash:
          '0xf6e57c99be5a81167bcb7bdf8d55572235384182c71635857ace2c04d25294ed',
        randomness: {
          committed:
            '0x339714505ecf55eacc2d2568ea53a7424bd0aa40fd710fd6892464d0716da711',
          revealed:
            '0xe10b5f01b0376fdc9151f66992f8c1b990083acabc14ec1b04f6a53ad804db88',
        },
        receiptsRoot:
          '0xca8aabc507534e45c982aa43e38118fc6f9cf222800e3d703a6e299a2e661f2a',
        size: '0x3',
        stateRoot:
          '0x051c8e40ed3d8afabbad5321a4bb6b9d686a8a62d9b696b3e5a5c769c3623d48',
        timestamp: '0x4',
        totalDifficulty: '0x5',
        transactions: [
          {
            accessList: [],
            blockHash:
              '0xac8c9bc3b84e103dc321bbe83b670e425ff68bfc9a333a4f1b1b204ad11c583d',
            blockNumber: '0x1',
            chainId: '0x1',
            feeCurrency: null,
            from: '0x045d685d23e8aa34dc408a66fb408f20dc84d785',
            gas: '0x69420',
            maxFeePerGas: '0x0',
            maxPriorityFeePerGas: '0x0',
            gatewayFee: '0x0',
            gatewayFeeRecipient: null,
            hash: '0x487efb864b308ee85afd7ed5954e968457cfe84e71726114b0a44f31fb876e85',
            input: '0x389ec778',
            nonce: '0x1',
            r: '0x1c0c8776e2e9d97b9a95435d2c2439d5f634e1afc35a5a0f0bd02093dd4724e0',
            s: '0xde418ff749f2430a85e60a4b3f81af9f8e2117cffbe32c719b9b784c01be774',
            to: '0xb86d682b1b6bf20d8d54f55c48f848b9487dec37',
            transactionIndex: '0x0',
            type: '0x2',
            v: '0x0',
            value: '0x0',
          },
          {
            accessList: [],
            blockHash:
              '0xac8c9bc3b84e103dc321bbe83b670e425ff68bfc9a333a4f1b1b204ad11c583d',
            blockNumber: '0x1',
            chainId: '0x1',
            feeCurrency: null,
            from: '0x045d685d23e8aa34dc408a66fb408f20dc84d785',
            gas: '0x69420',
            maxFeePerGas: '0x0',
            maxPriorityFeePerGas: '0x0',
            gatewayFee: null,
            gatewayFeeRecipient: null,
            hash: '0x487efb864b308ee85afd7ed5954e968457cfe84e71726114b0a44f31fb876e85',
            input: '0x389ec778',
            nonce: '0x1',
            r: '0x1c0c8776e2e9d97b9a95435d2c2439d5f634e1afc35a5a0f0bd02093dd4724e0',
            s: '0xde418ff749f2430a85e60a4b3f81af9f8e2117cffbe32c719b9b784c01be774',
            to: '0xb86d682b1b6bf20d8d54f55c48f848b9487dec37',
            transactionIndex: '0x0',
            type: '0x2',
            v: '0x0',
            value: '0x0',
          },
        ],
        transactionsRoot:
          '0xb293e2c4ce20a9eac253241e750a5592c9d3c1b27bf090d0fc2fa4756a038866',
      }),
    ).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": 0n,
        "extraData": "0xd983010700846765746889676f312e31372e3133856c696e7578000000000000f8ccc0c080b84169807e4d7934803decfde330167e444ec323431e1ff4cd70f40f2e79f24ce91f60340b99f97e3562ee57389e2c72343a74379e0b8b7ca5237ec141e84278bb3e00f8418e3e8af95497b7f6ffe7d3c4cbfbbdb06b26f6f3e913ca2cb7dff23532eaf3eb9f3b06ae75498c88353d279cf58fb0570736e2aa20cf53381722b6485f0f3c8180f8418e3fffffffffffffffffffffffffffb0005d23be939b9f8135e6b1ff283baff985c1b6ccacf2b6aa7fbd8939c4b6178b1d242b574a614b6347182a3b3195258080",
        "gasUsed": 1n,
        "hash": "0xac8c9bc3b84e103dc321bbe83b670e425ff68bfc9a333a4f1b1b204ad11c583d",
        "logsBloom": "0x02004000004200000000000000800020000000000000400002040000002020000000802000000000000180000001000020800000000000000000000000000000000000000022000260000008000800000000000000000000000000000000000000000008000410002100000140000800000044c00200000000400010000800008800000080000000000010000040000000000000000000000000000000800020028000000100000000000000000000002002881000000000000800020000040020900402020000180000000000000040000800000011020090002000400000200010002000001000000000000080000000000000000000000000000004000000",
        "miner": "0xe267d978037b89db06c6a5fcf82fad8297e290ff",
        "number": 2n,
        "parentHash": "0xf6e57c99be5a81167bcb7bdf8d55572235384182c71635857ace2c04d25294ed",
        "randomness": {
          "committed": "0x339714505ecf55eacc2d2568ea53a7424bd0aa40fd710fd6892464d0716da711",
          "revealed": "0xe10b5f01b0376fdc9151f66992f8c1b990083acabc14ec1b04f6a53ad804db88",
        },
        "receiptsRoot": "0xca8aabc507534e45c982aa43e38118fc6f9cf222800e3d703a6e299a2e661f2a",
        "size": 3n,
        "stateRoot": "0x051c8e40ed3d8afabbad5321a4bb6b9d686a8a62d9b696b3e5a5c769c3623d48",
        "timestamp": 4n,
        "totalDifficulty": 5n,
        "transactions": [
          {
            "accessList": [],
            "blockHash": "0xac8c9bc3b84e103dc321bbe83b670e425ff68bfc9a333a4f1b1b204ad11c583d",
            "blockNumber": 1n,
            "chainId": 1,
            "feeCurrency": null,
            "from": "0x045d685d23e8aa34dc408a66fb408f20dc84d785",
            "gas": 431136n,
            "gasPrice": undefined,
            "gatewayFee": 0n,
            "gatewayFeeRecipient": null,
            "hash": "0x487efb864b308ee85afd7ed5954e968457cfe84e71726114b0a44f31fb876e85",
            "input": "0x389ec778",
            "maxFeePerGas": 0n,
            "maxPriorityFeePerGas": 0n,
            "nonce": 1,
            "r": "0x1c0c8776e2e9d97b9a95435d2c2439d5f634e1afc35a5a0f0bd02093dd4724e0",
            "s": "0xde418ff749f2430a85e60a4b3f81af9f8e2117cffbe32c719b9b784c01be774",
            "to": "0xb86d682b1b6bf20d8d54f55c48f848b9487dec37",
            "transactionIndex": 0,
            "type": "eip1559",
            "typeHex": "0x2",
            "v": 0n,
            "value": 0n,
          },
          {
            "accessList": [],
            "blockHash": "0xac8c9bc3b84e103dc321bbe83b670e425ff68bfc9a333a4f1b1b204ad11c583d",
            "blockNumber": 1n,
            "chainId": 1,
            "feeCurrency": null,
            "from": "0x045d685d23e8aa34dc408a66fb408f20dc84d785",
            "gas": 431136n,
            "gasPrice": undefined,
            "gatewayFee": null,
            "gatewayFeeRecipient": null,
            "hash": "0x487efb864b308ee85afd7ed5954e968457cfe84e71726114b0a44f31fb876e85",
            "input": "0x389ec778",
            "maxFeePerGas": 0n,
            "maxPriorityFeePerGas": 0n,
            "nonce": 1,
            "r": "0x1c0c8776e2e9d97b9a95435d2c2439d5f634e1afc35a5a0f0bd02093dd4724e0",
            "s": "0xde418ff749f2430a85e60a4b3f81af9f8e2117cffbe32c719b9b784c01be774",
            "to": "0xb86d682b1b6bf20d8d54f55c48f848b9487dec37",
            "transactionIndex": 0,
            "type": "eip1559",
            "typeHex": "0x2",
            "v": 0n,
            "value": 0n,
          },
        ],
        "transactionsRoot": "0xb293e2c4ce20a9eac253241e750a5592c9d3c1b27bf090d0fc2fa4756a038866",
      }
    `)
  })

  test('action', async () => {
    const client = createPublicClient({
      chain: celo,
      transport: http(),
    })

    const block = await getBlock(client, {
      blockNumber: 16645775n,
      includeTransactions: true,
    })

    const { extraData: _extraData, transactions, ...rest } = block
    expect(transactions[0]).toMatchInlineSnapshot(`
        {
          "blockHash": "0xac8c9bc3b84e103dc321bbe83b670e425ff68bfc9a333a4f1b1b204ad11c583d",
          "blockNumber": 16645775n,
          "chainId": undefined,
          "ethCompatible": false,
          "feeCurrency": null,
          "from": "0x045d685d23e8aa34dc408a66fb408f20dc84d785",
          "gas": 1527520n,
          "gasPrice": 562129081n,
          "gatewayFee": 0n,
          "gatewayFeeRecipient": null,
          "hash": "0x487efb864b308ee85afd7ed5954e968457cfe84e71726114b0a44f31fb876e85",
          "input": "0x389ec778",
          "nonce": 714820,
          "r": "0x1c0c8776e2e9d97b9a95435d2c2439d5f634e1afc35a5a0f0bd02093dd4724e0",
          "s": "0xde418ff749f2430a85e60a4b3f81af9f8e2117cffbe32c719b9b784c01be774",
          "to": "0xb86d682b1b6bf20d8d54f55c48f848b9487dec37",
          "transactionIndex": 0,
          "type": "legacy",
          "typeHex": "0x0",
          "v": 84476n,
          "value": 0n,
        }
      `)
    expect(rest).toMatchInlineSnapshot(`
        {
          "baseFeePerGas": null,
          "epochSnarkData": null,
          "gasUsed": 5045322n,
          "hash": "0xac8c9bc3b84e103dc321bbe83b670e425ff68bfc9a333a4f1b1b204ad11c583d",
          "logsBloom": "0x02004000004200000000000000800020000000000000400002040000002020000000802000000000000180000001000020800000000000000000000000000000000000000022000260000008000800000000000000000000000000000000000000000008000410002100000140000800000044c00200000000400010000800008800000080000000000010000040000000000000000000000000000000800020028000000100000000000000000000002002881000000000000800020000040020900402020000180000000000000040000800000011020090002000400000200010002000001000000000000080000000000000000000000000000004000000",
          "miner": "0xe267d978037b89db06c6a5fcf82fad8297e290ff",
          "number": 16645775n,
          "parentHash": "0xf6e57c99be5a81167bcb7bdf8d55572235384182c71635857ace2c04d25294ed",
          "randomness": {
            "committed": "0x339714505ecf55eacc2d2568ea53a7424bd0aa40fd710fd6892464d0716da711",
            "revealed": "0xe10b5f01b0376fdc9151f66992f8c1b990083acabc14ec1b04f6a53ad804db88",
          },
          "receiptsRoot": "0xca8aabc507534e45c982aa43e38118fc6f9cf222800e3d703a6e299a2e661f2a",
          "size": 24562n,
          "stateRoot": "0x051c8e40ed3d8afabbad5321a4bb6b9d686a8a62d9b696b3e5a5c769c3623d48",
          "timestamp": 1670896907n,
          "totalDifficulty": 16645776n,
          "transactionsRoot": "0xb293e2c4ce20a9eac253241e750a5592c9d3c1b27bf090d0fc2fa4756a038866",
        }
      `)
  })
})

describe('transaction', () => {
  test('formatter', () => {
    const { transaction } = celo.formatters!

    expect(
      transaction.format({
        accessList: [],
        blockHash:
          '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d',
        blockNumber: '0x1',
        chainId: '0x1',
        feeCurrency: null,
        from: '0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e',
        gas: '0x2',
        gasPrice: undefined,
        gatewayFee: '0x3',
        gatewayFeeRecipient: null,
        hash: '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b',
        input:
          '0x23b872dd000000000000000000000000a00f99bc38b1ecda1fd70eaa1cd31d576a9f46b0000000000000000000000000f16e9b0d03470827a95cdfd0cb8a8a3b46969b910000000000000000000000000000000000000000000000000000002b3b6fb3d0',
        maxFeePerGas: '0x4',
        maxPriorityFeePerGas: '0x5',
        nonce: '0x6',
        r: '0x5e49a7bd0534c6b6d3bbe581659424d3747f920d40ce56e48d26e5d94aac32ca',
        s: '0x1746abe27b7c4f00bda1ec714ac1f7083e9025b6ca3b2248e439a173e4ab55e0',
        to: '0x15d4c048f83bd7e37d49ea4c83a07267ec4203da',
        transactionIndex: '0x7',
        type: '0x2',
        v: '0x1',
        value: '0x0',
      }),
    ).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "blockHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
        "blockNumber": 1n,
        "chainId": 1,
        "feeCurrency": null,
        "from": "0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e",
        "gas": 2n,
        "gasPrice": undefined,
        "gatewayFee": 3n,
        "gatewayFeeRecipient": null,
        "hash": "0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b",
        "input": "0x23b872dd000000000000000000000000a00f99bc38b1ecda1fd70eaa1cd31d576a9f46b0000000000000000000000000f16e9b0d03470827a95cdfd0cb8a8a3b46969b910000000000000000000000000000000000000000000000000000002b3b6fb3d0",
        "maxFeePerGas": 4n,
        "maxPriorityFeePerGas": 5n,
        "nonce": 6,
        "r": "0x5e49a7bd0534c6b6d3bbe581659424d3747f920d40ce56e48d26e5d94aac32ca",
        "s": "0x1746abe27b7c4f00bda1ec714ac1f7083e9025b6ca3b2248e439a173e4ab55e0",
        "to": "0x15d4c048f83bd7e37d49ea4c83a07267ec4203da",
        "transactionIndex": 7,
        "type": "eip1559",
        "typeHex": "0x2",
        "v": 1n,
        "value": 0n,
      }
    `)

    expect(
      transaction.format({
        accessList: [],
        blockHash:
          '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d',
        blockNumber: '0x1',
        chainId: '0x1',
        feeCurrency: null,
        from: '0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e',
        gas: '0x2',
        gasPrice: undefined,
        gatewayFee: null,
        gatewayFeeRecipient: null,
        hash: '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b',
        input:
          '0x23b872dd000000000000000000000000a00f99bc38b1ecda1fd70eaa1cd31d576a9f46b0000000000000000000000000f16e9b0d03470827a95cdfd0cb8a8a3b46969b910000000000000000000000000000000000000000000000000000002b3b6fb3d0',
        maxFeePerGas: '0x4',
        maxPriorityFeePerGas: '0x5',
        nonce: '0x6',
        r: '0x5e49a7bd0534c6b6d3bbe581659424d3747f920d40ce56e48d26e5d94aac32ca',
        s: '0x1746abe27b7c4f00bda1ec714ac1f7083e9025b6ca3b2248e439a173e4ab55e0',
        to: '0x15d4c048f83bd7e37d49ea4c83a07267ec4203da',
        transactionIndex: '0x7',
        type: '0x2',
        v: '0x1',
        value: '0x0',
      }),
    ).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "blockHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
        "blockNumber": 1n,
        "chainId": 1,
        "feeCurrency": null,
        "from": "0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e",
        "gas": 2n,
        "gasPrice": undefined,
        "gatewayFee": null,
        "gatewayFeeRecipient": null,
        "hash": "0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b",
        "input": "0x23b872dd000000000000000000000000a00f99bc38b1ecda1fd70eaa1cd31d576a9f46b0000000000000000000000000f16e9b0d03470827a95cdfd0cb8a8a3b46969b910000000000000000000000000000000000000000000000000000002b3b6fb3d0",
        "maxFeePerGas": 4n,
        "maxPriorityFeePerGas": 5n,
        "nonce": 6,
        "r": "0x5e49a7bd0534c6b6d3bbe581659424d3747f920d40ce56e48d26e5d94aac32ca",
        "s": "0x1746abe27b7c4f00bda1ec714ac1f7083e9025b6ca3b2248e439a173e4ab55e0",
        "to": "0x15d4c048f83bd7e37d49ea4c83a07267ec4203da",
        "transactionIndex": 7,
        "type": "eip1559",
        "typeHex": "0x2",
        "v": 1n,
        "value": 0n,
      }
    `)
  })

  test('action', async () => {
    const client = createPublicClient({
      chain: celo,
      transport: http(),
    })

    const transaction = await getTransaction(client, {
      blockNumber: 16628100n,
      index: 0,
    })

    expect(transaction).toMatchInlineSnapshot(`
      {
        "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
        "blockNumber": 16628100n,
        "chainId": undefined,
        "ethCompatible": false,
        "feeCurrency": null,
        "from": "0x045d685d23e8aa34dc408a66fb408f20dc84d785",
        "gas": 1527520n,
        "gasPrice": 2999683966n,
        "gatewayFee": 0n,
        "gatewayFeeRecipient": null,
        "hash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
        "input": "0x389ec778",
        "nonce": 697201,
        "r": "0xf507fb8fa33ffd05a7f26c980bbb8271aa113affc8f192feba87abe26549bda1",
        "s": "0x7971c7b15ab4475ce6256da0bdf62ca1d1e491be8a03fe7637289f98c166f521",
        "to": "0xb86d682b1b6bf20d8d54f55c48f848b9487dec37",
        "transactionIndex": 0,
        "type": "legacy",
        "typeHex": "0x0",
        "v": 84475n,
        "value": 0n,
      }
    `)
  })
})

describe('transactionReceipt', () => {
  test('formatter', () => {
    const { transactionReceipt } = celo.formatters!
    expect(
      transactionReceipt.format({
        blockHash:
          '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d',
        blockNumber: '0x1',
        contractAddress: '0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e',
        cumulativeGasUsed: '0x2',
        effectiveGasPrice: '0x3',
        feeCurrency: null,
        from: '0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e',
        gasUsed: '0x4',
        gatewayFee: null,
        gatewayFeeRecipient: null,
        logs: [],
        to: '0x15d4c048f83bd7e37d49ea4c83a07267ec4203da',
        status: '0x0',
        type: '0x0',
      }),
    ).toMatchInlineSnapshot(`
      {
        "blockHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
        "blockNumber": 1n,
        "contractAddress": "0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e",
        "cumulativeGasUsed": 2n,
        "effectiveGasPrice": 3n,
        "feeCurrency": null,
        "from": "0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e",
        "gasUsed": 4n,
        "gatewayFee": null,
        "gatewayFeeRecipient": null,
        "logs": [],
        "status": "reverted",
        "to": "0x15d4c048f83bd7e37d49ea4c83a07267ec4203da",
        "transactionIndex": null,
        "type": "legacy",
      }
    `)

    expect(
      transactionReceipt.format({
        blockHash:
          '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d',
        blockNumber: '0x1',
        contractAddress: '0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e',
        cumulativeGasUsed: '0x2',
        effectiveGasPrice: '0x3',
        feeCurrency: null,
        from: '0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e',
        gasUsed: '0x4',
        gatewayFee: '0x123',
        gatewayFeeRecipient: null,
        logs: [],
        to: '0x15d4c048f83bd7e37d49ea4c83a07267ec4203da',
        status: '0x0',
        type: '0x0',
      }),
    ).toMatchInlineSnapshot(`
      {
        "blockHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
        "blockNumber": 1n,
        "contractAddress": "0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e",
        "cumulativeGasUsed": 2n,
        "effectiveGasPrice": 3n,
        "feeCurrency": null,
        "from": "0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e",
        "gasUsed": 4n,
        "gatewayFee": 291n,
        "gatewayFeeRecipient": null,
        "logs": [],
        "status": "reverted",
        "to": "0x15d4c048f83bd7e37d49ea4c83a07267ec4203da",
        "transactionIndex": null,
        "type": "legacy",
      }
    `)
  })

  test('action', async () => {
    const client = createPublicClient({
      chain: celo,
      transport: http(),
    })

    const transaction = await getTransactionReceipt(client, {
      hash: '0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17',
    })

    expect(transaction).toMatchInlineSnapshot(`
      {
        "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
        "blockNumber": 16628100n,
        "contractAddress": null,
        "cumulativeGasUsed": 490857n,
        "effectiveGasPrice": 2999683966n,
        "feeCurrency": undefined,
        "from": "0x045d685d23e8aa34dc408a66fb408f20dc84d785",
        "gasUsed": 490857n,
        "gatewayFee": null,
        "gatewayFeeRecipient": undefined,
        "logs": [
          {
            "address": "0x918146359264c492bd6934071c6bd31c854edbc3",
            "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
            "blockNumber": 16628100n,
            "data": "0x0000000000000000000000000000000000000000000000000004be9c24a9467d0000000000000000000000000000000000000000035b7e007bd2ad61e3574e25",
            "logIndex": 0,
            "removed": false,
            "topics": [
              "0x4beccb90f994c31aced7a23b5611020728a23d8ec5cddd1a3e9d97b96fda8666",
              "0x000000000000000000000000f94fea0c87d2b357dc72b743b45a8cb682b0716e",
              "0x000000000000000000000000045d685d23e8aa34dc408a66fb408f20dc84d785",
            ],
            "transactionHash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
            "transactionIndex": 0,
          },
          {
            "address": "0x918146359264c492bd6934071c6bd31c854edbc3",
            "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
            "blockNumber": 16628100n,
            "data": "0x0000000000000000000000000000000000000000000000000004be9c24a9467d",
            "logIndex": 1,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000f94fea0c87d2b357dc72b743b45a8cb682b0716e",
              "0x000000000000000000000000045d685d23e8aa34dc408a66fb408f20dc84d785",
            ],
            "transactionHash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
            "transactionIndex": 0,
          },
          {
            "address": "0xe273ad7ee11dcfaa87383ad5977ee1504ac07568",
            "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
            "blockNumber": 16628100n,
            "data": "0x000000000000000000000000000000000000000000000000000051069a5460020000000000000000000000000000000000000000033267b28d9c01bb6124f934",
            "logIndex": 2,
            "removed": false,
            "topics": [
              "0x4beccb90f994c31aced7a23b5611020728a23d8ec5cddd1a3e9d97b96fda8666",
              "0x000000000000000000000000f94fea0c87d2b357dc72b743b45a8cb682b0716e",
              "0x000000000000000000000000045d685d23e8aa34dc408a66fb408f20dc84d785",
            ],
            "transactionHash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
            "transactionIndex": 0,
          },
          {
            "address": "0xe273ad7ee11dcfaa87383ad5977ee1504ac07568",
            "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
            "blockNumber": 16628100n,
            "data": "0x000000000000000000000000000000000000000000000000000051069a546002",
            "logIndex": 3,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000f94fea0c87d2b357dc72b743b45a8cb682b0716e",
              "0x000000000000000000000000045d685d23e8aa34dc408a66fb408f20dc84d785",
            ],
            "transactionHash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
            "transactionIndex": 0,
          },
          {
            "address": "0x471ece3750da237f93b8e339c536989b8978a438",
            "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
            "blockNumber": 16628100n,
            "data": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "logIndex": 4,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000b460f9ae1fea4f77107146c1960bb1c978118816",
              "0x000000000000000000000000045d685d23e8aa34dc408a66fb408f20dc84d785",
            ],
            "transactionHash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
            "transactionIndex": 0,
          },
          {
            "address": "0x918146359264c492bd6934071c6bd31c854edbc3",
            "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
            "blockNumber": 16628100n,
            "data": "0x0000000000000000000000000000000000000000000000000002950b4b3a43b40000000000000000000000000000000000000000035b7e007bd2ad61e3574e25",
            "logIndex": 5,
            "removed": false,
            "topics": [
              "0x4beccb90f994c31aced7a23b5611020728a23d8ec5cddd1a3e9d97b96fda8666",
              "0x000000000000000000000000b460f9ae1fea4f77107146c1960bb1c978118816",
              "0x000000000000000000000000045d685d23e8aa34dc408a66fb408f20dc84d785",
            ],
            "transactionHash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
            "transactionIndex": 0,
          },
          {
            "address": "0x918146359264c492bd6934071c6bd31c854edbc3",
            "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
            "blockNumber": 16628100n,
            "data": "0x0000000000000000000000000000000000000000000000000002950b4b3a43b4",
            "logIndex": 6,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000b460f9ae1fea4f77107146c1960bb1c978118816",
              "0x000000000000000000000000045d685d23e8aa34dc408a66fb408f20dc84d785",
            ],
            "transactionHash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
            "transactionIndex": 0,
          },
          {
            "address": "0x122013fd7df1c6f636a5bb8f03108e876548b455",
            "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
            "blockNumber": 16628100n,
            "data": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "logIndex": 7,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000313e1b5edeebab73b6e869a74a896dc999e204cc",
              "0x000000000000000000000000045d685d23e8aa34dc408a66fb408f20dc84d785",
            ],
            "transactionHash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
            "transactionIndex": 0,
          },
          {
            "address": "0x918146359264c492bd6934071c6bd31c854edbc3",
            "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
            "blockNumber": 16628100n,
            "data": "0x00000000000000000000000000000000000000000000000000024144eaf931230000000000000000000000000000000000000000035b7e007bd2ad61e3574e25",
            "logIndex": 8,
            "removed": false,
            "topics": [
              "0x4beccb90f994c31aced7a23b5611020728a23d8ec5cddd1a3e9d97b96fda8666",
              "0x000000000000000000000000313e1b5edeebab73b6e869a74a896dc999e204cc",
              "0x000000000000000000000000045d685d23e8aa34dc408a66fb408f20dc84d785",
            ],
            "transactionHash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
            "transactionIndex": 0,
          },
          {
            "address": "0x918146359264c492bd6934071c6bd31c854edbc3",
            "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
            "blockNumber": 16628100n,
            "data": "0x00000000000000000000000000000000000000000000000000024144eaf93123",
            "logIndex": 9,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000313e1b5edeebab73b6e869a74a896dc999e204cc",
              "0x000000000000000000000000045d685d23e8aa34dc408a66fb408f20dc84d785",
            ],
            "transactionHash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
            "transactionIndex": 0,
          },
          {
            "address": "0x02de4766c272abc10bc88c220d214a26960a7e92",
            "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
            "blockNumber": 16628100n,
            "data": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "logIndex": 10,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000ec5c9c99ad30adf396ac4b48fba09dc34819c65a",
              "0x000000000000000000000000045d685d23e8aa34dc408a66fb408f20dc84d785",
            ],
            "transactionHash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
            "transactionIndex": 0,
          },
          {
            "address": "0x918146359264c492bd6934071c6bd31c854edbc3",
            "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
            "blockNumber": 16628100n,
            "data": "0x000000000000000000000000000000000000000000000000000121f3877515ea0000000000000000000000000000000000000000035b7e007bd2ad61e3574e25",
            "logIndex": 11,
            "removed": false,
            "topics": [
              "0x4beccb90f994c31aced7a23b5611020728a23d8ec5cddd1a3e9d97b96fda8666",
              "0x000000000000000000000000ec5c9c99ad30adf396ac4b48fba09dc34819c65a",
              "0x000000000000000000000000045d685d23e8aa34dc408a66fb408f20dc84d785",
            ],
            "transactionHash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
            "transactionIndex": 0,
          },
          {
            "address": "0x918146359264c492bd6934071c6bd31c854edbc3",
            "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
            "blockNumber": 16628100n,
            "data": "0x000000000000000000000000000000000000000000000000000121f3877515ea",
            "logIndex": 12,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000ec5c9c99ad30adf396ac4b48fba09dc34819c65a",
              "0x000000000000000000000000045d685d23e8aa34dc408a66fb408f20dc84d785",
            ],
            "transactionHash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
            "transactionIndex": 0,
          },
        ],
        "logsBloom": "0x00004000004000000000000000800000000000000000400002000000002000000000800000000000000180000001000000000000000000000000000000000000000000000000000020000008000800000000000000000000000000000000000000000000000000000000000040000800000004000000000000000010000800000000000000000000000010000000000000000000000000000000000000000000020000000000000000000000000000002000081000000000000000000000040020800402000000100000000000000000000000000010000010000000000000200010002000000000000000000080000000000000000000000000000004000000",
        "status": "success",
        "to": "0xb86d682b1b6bf20d8d54f55c48f848b9487dec37",
        "transactionHash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
        "transactionIndex": 0,
        "type": "legacy",
      }
    `)
  })
})

describe('transactionRequest', () => {
  const { transactionRequest } = celo.formatters!

  test('formatter cip42', () => {
    expect(
      transactionRequest.format({
        feeCurrency: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        from: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        gas: 1n,
        gatewayFee: 4n,
        gatewayFeeRecipient: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        maxFeePerGas: 2n,
        maxPriorityFeePerGas: 1n,
        nonce: 1,
        value: 1n,
      }),
    ).toMatchInlineSnapshot(`
      {
        "feeCurrency": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "from": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "gas": "0x1",
        "gasPrice": undefined,
        "gatewayFee": "0x4",
        "gatewayFeeRecipient": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "maxFeePerGas": "0x2",
        "maxPriorityFeePerGas": "0x1",
        "nonce": "0x1",
        "type": "0x7c",
        "value": "0x1",
      }
    `)

    expect(
      transactionRequest.format({
        feeCurrency: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        from: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        gas: 1n,
        gatewayFeeRecipient: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        maxFeePerGas: 2n,
        maxPriorityFeePerGas: 1n,
        nonce: 1,
        value: 1n,
      }),
    ).toMatchInlineSnapshot(`
      {
        "feeCurrency": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "from": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "gas": "0x1",
        "gasPrice": undefined,
        "gatewayFee": undefined,
        "gatewayFeeRecipient": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "maxFeePerGas": "0x2",
        "maxPriorityFeePerGas": "0x1",
        "nonce": "0x1",
        "type": "0x7c",
        "value": "0x1",
      }
    `)

    expect(
      transactionRequest.format({
        feeCurrency: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        from: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        gas: 1n,
        gatewayFee: 4n,
        gatewayFeeRecipient: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        maxFeePerGas: 2n,
        maxPriorityFeePerGas: 1n,
        nonce: 1,
        value: 1n,
      }),
    ).toMatchInlineSnapshot(`
      {
        "feeCurrency": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "from": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "gas": "0x1",
        "gasPrice": undefined,
        "gatewayFee": "0x4",
        "gatewayFeeRecipient": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "maxFeePerGas": "0x2",
        "maxPriorityFeePerGas": "0x1",
        "nonce": "0x1",
        "type": "0x7c",
        "value": "0x1",
      }
    `)

    expect(
      transactionRequest.format({
        feeCurrency: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        from: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        gas: 1n,
        gatewayFee: 4n,
        gatewayFeeRecipient: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        maxFeePerGas: 2n,
        maxPriorityFeePerGas: 1n,
        nonce: 1,
        value: 1n,
      }),
    ).toMatchInlineSnapshot(`
      {
        "feeCurrency": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "from": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "gas": "0x1",
        "gasPrice": undefined,
        "gatewayFee": "0x4",
        "gatewayFeeRecipient": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "maxFeePerGas": "0x2",
        "maxPriorityFeePerGas": "0x1",
        "nonce": "0x1",
        "type": "0x7c",
        "value": "0x1",
      }
    `)

    expect(
      transactionRequest.format({
        feeCurrency: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        from: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        gas: 1n,
        gatewayFee: 4n,
        gatewayFeeRecipient: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        maxFeePerGas: 2n,
        maxPriorityFeePerGas: 4n,
        nonce: 1,
        value: 1n,
      }),
    ).toMatchInlineSnapshot(`
      {
        "feeCurrency": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "from": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "gas": "0x1",
        "gasPrice": undefined,
        "gatewayFee": "0x4",
        "gatewayFeeRecipient": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "maxFeePerGas": "0x2",
        "maxPriorityFeePerGas": "0x4",
        "nonce": "0x1",
        "type": "0x7c",
        "value": "0x1",
      }
    `)
  })
  test('formatter cip64', () => {
    expect(
      transactionRequest.format({
        feeCurrency: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        from: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        gas: 1n,
        maxFeePerGas: 2n,
        maxPriorityFeePerGas: 1n,
        nonce: 1,
        value: 1n,
      }),
    ).toMatchInlineSnapshot(`
      {
        "feeCurrency": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "from": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "gas": "0x1",
        "gasPrice": undefined,
        "maxFeePerGas": "0x2",
        "maxPriorityFeePerGas": "0x1",
        "nonce": "0x1",
        "type": "0x7b",
        "value": "0x1",
      }
    `)

    expect(
      transactionRequest.format({
        from: '0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9',
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // Recipient (illustrative address)
        value: 1n,
        feeCurrency: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1', // cUSD fee currency
        maxFeePerGas: 2n, // Special field for dynamic fee transaction type (EIP-1559)
        maxPriorityFeePerGas: 2n, // Special field for dynamic fee transaction type (EIP-1559)
      }),
    ).toMatchInlineSnapshot(`
      {
        "feeCurrency": "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
        "from": "0x0f16e9b0d03470827a95cdfd0cb8a8a3b46969b9",
        "gas": undefined,
        "gasPrice": undefined,
        "maxFeePerGas": "0x2",
        "maxPriorityFeePerGas": "0x2",
        "nonce": undefined,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "0x7b",
        "value": "0x1",
      }
    `)
  })
})
