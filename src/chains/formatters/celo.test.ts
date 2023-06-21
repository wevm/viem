import { expect, test } from 'vitest'

import { getBlock } from '../../actions/public/getBlock.js'
import { getTransaction } from '../../actions/public/getTransaction.js'
import { getTransactionReceipt } from '../../actions/public/getTransactionReceipt.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import { celo } from '../index.js'

test('block', async () => {
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

test('transaction', async () => {
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

test('transactionReceipt', async () => {
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
