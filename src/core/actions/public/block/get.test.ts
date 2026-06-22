import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { z } from 'ox/zod'
import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

const client = anvil.getClient(anvil.mainnet)

test('default', async () => {
  // the pinned fork-tip block is cached by anvil, so the header is
  // deterministic. omit the large transactions array (asserted below).
  const { transactions, ...block } = await Actions.block.get(client)
  expect(block).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": 635678744n,
        "blobGasUsed": 786432n,
        "difficulty": 0n,
        "excessBlobGas": 1572864n,
        "extraData": "0x6265617665726275696c642e6f7267",
        "gasLimit": 35964845n,
        "gasUsed": 14170967n,
        "hash": "0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d",
        "logsBloom": "0xa336825265c0691c36791a28c7814901910c6b230e016020408d80135c1980b01016af2c481b78027612ff562ed6c7821228e23a0ccfea2b689d740905656000544085800d0928884ad6e10a344820e9f508517102f601cc0c081464d844b6993b4dd2a082e3462944ca5a4ab4227e8ce368046230b8974506a20496000f111406a9b5004e25a580a0e9204843b3100e18454253b384b508362280d101b634a12f62148431086a90625f16a482818f0841bac44db90101000f39c532160c7460d012000688201ea0013a33920e7b384728250356c52700955c3e2bc20891e2c62572a843e142470000051461200009428f79b8428b08a4c04b899412204954a5",
        "miner": "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
        "mixHash": "0x33fd71ca8e38da7aa264c9b9252b7d2864484826eeeae67c2aaf3ab0a756f133",
        "nonce": "0x0000000000000000",
        "number": 22263623n,
        "parentBeaconBlockRoot": "0xa7b4e889e408381f1860000a708b6e5fd42ccd9de7fb1cb442a8e91ecb9e6f6c",
        "parentHash": "0x019d374731477005b8d3e3236aca44d11ef53fc9eb0ab0c9e11f942636b04b1b",
        "receiptsRoot": "0x230fa17d30bd0ca83606cd4704400735bf05cd09110bc96eeee7dbfbc0f870c9",
        "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        "size": 88414n,
        "stateRoot": "0xadea44d9167ee7c415601810dbb3f090de70edfdea34632b7e077cefad038af3",
        "timestamp": 1744590299n,
        "totalDifficulty": undefined,
        "transactionsRoot": "0x5c41008fd93b95aff0a1a453b657539b7e43d67d20c196c87fe59f5f2f1dd214",
        "uncles": [],
        "withdrawals": [
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": 19103985n,
            "index": 83658587,
            "validatorIndex": 781903,
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": 66464378n,
            "index": 83658588,
            "validatorIndex": 781904,
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": 19228531n,
            "index": 83658589,
            "validatorIndex": 781910,
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": 19248796n,
            "index": 83658590,
            "validatorIndex": 781911,
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": 65224245n,
            "index": 83658591,
            "validatorIndex": 781912,
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": 19292309n,
            "index": 83658592,
            "validatorIndex": 781913,
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": 19366144n,
            "index": 83658593,
            "validatorIndex": 781914,
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": 19377442n,
            "index": 83658594,
            "validatorIndex": 781915,
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": 19388560n,
            "index": 83658595,
            "validatorIndex": 781916,
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": 19272415n,
            "index": 83658596,
            "validatorIndex": 781917,
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": 65246773n,
            "index": 83658597,
            "validatorIndex": 781918,
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": 19318898n,
            "index": 83658598,
            "validatorIndex": 781919,
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": 19304159n,
            "index": 83658599,
            "validatorIndex": 781920,
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": 19296855n,
            "index": 83658600,
            "validatorIndex": 781921,
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": 19304968n,
            "index": 83658601,
            "validatorIndex": 781922,
          },
          {
            "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
            "amount": 19354444n,
            "index": 83658602,
            "validatorIndex": 781923,
          },
        ],
        "withdrawalsRoot": "0x96c5c22e9b58cb7141b2aecf4250fc84b0486a00a78353cdcfc9d42c214b2127",
      }
    `)
  // schema-less default path returns transaction hashes.
  expect(transactions.every((tx) => typeof tx === 'string')).toBe(true)
})

test('args: blockNumber', async () => {
  const block = await Actions.block.get(client, {
    blockNumber: anvil.mainnet.forkBlockNumber - 100n,
  })
  expect(block.number).toBe(anvil.mainnet.forkBlockNumber - 100n)
})

test('args: blockTag', async () => {
  const block = await Actions.block.get(client, { blockTag: 'latest' })
  expect(block.number).toBe(anvil.mainnet.forkBlockNumber)
})

test('args: blockHash', async () => {
  const { hash } = await Actions.block.get(client)
  const block = await Actions.block.get(client, { blockHash: hash! })
  expect(block.hash).toBe(hash)
  expect(block.number).toBe(anvil.mainnet.forkBlockNumber)
})

test('args: includeTransactions', async () => {
  const block = await Actions.block.get(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
    includeTransactions: true,
  })
  expect(block.transactions[0]).toMatchInlineSnapshot(`
    {
      "accessList": [],
      "blockHash": "0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d",
      "blockNumber": 22263623n,
      "chainId": 1,
      "data": "0x380db829",
      "from": "0xe2da046340e00264c4f0443243a0565007ae08ac",
      "gas": 2000000n,
      "gasPrice": 13319389978n,
      "hash": "0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926",
      "input": "0x380db829",
      "maxFeePerGas": 13319389978n,
      "maxPriorityFeePerGas": 12683711234n,
      "nonce": 13314n,
      "r": "0xc266bb09b052429bff556bf3d29249c71286851267246acb2d47a8f33502850c",
      "s": "0x5c9715330193048ba9be906ccbbe2ef4c58eb3cdd25f21a2cad243a48371a931",
      "to": "0x39b7f514c199e4beb1739576a2dbd4de7414981b",
      "transactionIndex": 0,
      "type": "eip1559",
      "v": 28,
      "value": 0n,
      "yParity": 1,
    }
  `)
})

test('behavior: decodes via chain schema when declared', async () => {
  const chain = mainnet.extend({
    rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
    schema: { block: { fromRpc: z.Block.Block } },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const viaSchema = await Actions.block.get(schemaClient, {
    blockNumber: anvil.mainnet.forkBlockNumber,
  })
  const viaDefault = await Actions.block.get(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
  })
  expect(viaSchema).toEqual(viaDefault)
})

test('behavior: decodes custom properties via chain schema', async () => {
  const chain = mainnet.extend({
    rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
    schema: {
      block: {
        fromRpc: z.pipe(
          z.Block.Block,
          z.transform((block) => ({ ...block, custom: 'hello' as const })),
        ),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const block = await Actions.block.get(schemaClient, {
    blockNumber: anvil.mainnet.forkBlockNumber,
  })
  // custom property is decoded onto the result.
  expect(block.custom).toBe('hello')
  // standard properties still decode correctly.
  expect(block.number).toBe(anvil.mainnet.forkBlockNumber)
})

test('error: block not found', async () => {
  await expect(() => Actions.block.get(client, { blockNumber: 9_999_999_999n }))
    .rejects.toThrowErrorMatchingInlineSnapshot(`
      [Block.NotFoundError: Block at number "9999999999" could not be found.

      Version: viem@2.52.1]
    `)
})

test('error: block not found (by hash)', async () => {
  await expect(() =>
    Actions.block.get(client, {
      blockHash:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Block.NotFoundError: Block at hash "0x0000000000000000000000000000000000000000000000000000000000000000" could not be found.

      Version: viem@2.52.1]
    `)
})
