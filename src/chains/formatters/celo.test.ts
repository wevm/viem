import { expect, test } from 'vitest'

import { getBlock } from '../../actions/public/getBlock.js'
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
