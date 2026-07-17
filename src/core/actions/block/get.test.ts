import { Block } from 'ox'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

const client = anvil.getClient(anvil.mainnet)

test('default', async () => {
  // the pinned fork-tip block is cached by anvil, so the header is
  // deterministic. omit the large transactions array (asserted below).
  const { transactions, ...block } = await Actions.block.get(client)
  expect(block).toMatchInlineSnapshot(`
    {
      "baseFeePerGas": 20101622n,
      "blobGasUsed": 524288n,
      "difficulty": 0n,
      "excessBlobGas": 117695473n,
      "extraData": "0x4275696c6465724e6574202842656176657229",
      "gasLimit": 59999886n,
      "gasUsed": 57860235n,
      "hash": "0x738cc1716ea1f08adac2d4e2230aedcee2d5cd3f65d66d5d3597e05d710a3d50",
      "logsBloom": "0xfff637fef97cdaffbeb779b7b6bb7f6fd743ff75f77bee3f73fdbb7a3efbacf3d0bddffdecd8f4457ffedbd74e5efffbf7d3c599ffffecdd4fd736f97b7f3cbffeeed1de7557df3acd14fb6f77edbdff23e5dfb2d3ffeb68cbfe7a76d73b8edfffcfaf6fdbbf6bf7fc0f9eb35a3b7b2dfbfb6de78fb567fabe86d7f7181fdf7bea7cd79fffbbcfedd956fbf79f9907ffbef59dfdbff7f6fbfe3e19583d7f7dfb7f4a5b82fe913ffed5ffcce7de3784d575f77abef7fd45ff36fbd67ffd2d3f7fefb77e6ff7f2bfff9fdddf9dfffefefed5ee7f6ff5ffb4f77cfe81f7e7e8ffc36f5afde9e3f478d6e56edffca1ff78d75f799bbf99ecfbdcb77db77bd7bdfbbf",
      "miner": "0xdadb0d80178819f2319190d340ce9a924f783711",
      "mixHash": "0xc7fe46e962cf07c5fb1753288aca9fd314978caf7fa340402e2313f4d33d5340",
      "nonce": "0x0000000000000000",
      "number": 24000000n,
      "parentBeaconBlockRoot": "0xa279641d0ea25a2c2f6006286a37d6abc309c19c01cb8f44d403cec2dcda1c2e",
      "parentHash": "0xe8f20171e085c248ac4d60b65ddeb9c1bd679149cc1be9925ad58799dc380b25",
      "receiptsRoot": "0x0ec610cfa89232b258c001f41c725a70c32e73a68ecd344c31e004926bf6ca93",
      "requestsHash": "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
      "size": 118941n,
      "stateRoot": "0x8538eaf25c61e2bfcf82ef95782a6dd6d51a7c76c1fa69c0fd301093c673669f",
      "timestamp": 1765584371n,
      "totalDifficulty": undefined,
      "transactionsRoot": "0x2de92cce8ea3e1dc8f62c21c9bf9dcf5937c95edf6ccd46f5c86e1922cb65f4d",
      "uncles": [],
      "withdrawals": [
        {
          "address": "0x210b3cb99fa1de0a64085fa80e18c22fe4722a1b",
          "amount": 17442977n,
          "index": 111440619,
          "validatorIndex": 1651406,
        },
        {
          "address": "0x210b3cb99fa1de0a64085fa80e18c22fe4722a1b",
          "amount": 17448450n,
          "index": 111440620,
          "validatorIndex": 1651407,
        },
        {
          "address": "0x210b3cb99fa1de0a64085fa80e18c22fe4722a1b",
          "amount": 17436792n,
          "index": 111440621,
          "validatorIndex": 1651408,
        },
        {
          "address": "0x210b3cb99fa1de0a64085fa80e18c22fe4722a1b",
          "amount": 17488567n,
          "index": 111440622,
          "validatorIndex": 1651409,
        },
        {
          "address": "0x210b3cb99fa1de0a64085fa80e18c22fe4722a1b",
          "amount": 17518675n,
          "index": 111440623,
          "validatorIndex": 1651410,
        },
        {
          "address": "0x210b3cb99fa1de0a64085fa80e18c22fe4722a1b",
          "amount": 17463190n,
          "index": 111440624,
          "validatorIndex": 1651411,
        },
        {
          "address": "0x210b3cb99fa1de0a64085fa80e18c22fe4722a1b",
          "amount": 17498485n,
          "index": 111440625,
          "validatorIndex": 1651412,
        },
        {
          "address": "0x210b3cb99fa1de0a64085fa80e18c22fe4722a1b",
          "amount": 17520847n,
          "index": 111440626,
          "validatorIndex": 1651413,
        },
        {
          "address": "0x210b3cb99fa1de0a64085fa80e18c22fe4722a1b",
          "amount": 17517382n,
          "index": 111440627,
          "validatorIndex": 1651414,
        },
        {
          "address": "0x210b3cb99fa1de0a64085fa80e18c22fe4722a1b",
          "amount": 17497155n,
          "index": 111440628,
          "validatorIndex": 1651415,
        },
        {
          "address": "0x210b3cb99fa1de0a64085fa80e18c22fe4722a1b",
          "amount": 17518156n,
          "index": 111440629,
          "validatorIndex": 1651416,
        },
        {
          "address": "0x210b3cb99fa1de0a64085fa80e18c22fe4722a1b",
          "amount": 17469958n,
          "index": 111440630,
          "validatorIndex": 1651417,
        },
        {
          "address": "0x210b3cb99fa1de0a64085fa80e18c22fe4722a1b",
          "amount": 17492260n,
          "index": 111440631,
          "validatorIndex": 1651418,
        },
        {
          "address": "0x210b3cb99fa1de0a64085fa80e18c22fe4722a1b",
          "amount": 17513247n,
          "index": 111440632,
          "validatorIndex": 1651419,
        },
        {
          "address": "0x0f3a1bfd2a873c36bae8a7d442247fe4b8b88a69",
          "amount": 64030001n,
          "index": 111440633,
          "validatorIndex": 1651421,
        },
        {
          "address": "0x0f3a1bfd2a873c36bae8a7d442247fe4b8b88a69",
          "amount": 17485795n,
          "index": 111440634,
          "validatorIndex": 1651422,
        },
      ],
      "withdrawalsRoot": "0x7e6f37f2fb74ada6d20947df157b129d1a5209d45d0f803ac88799c3526830f9",
    }
  `)
  // codec-less default path returns transaction hashes.
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
  // `blockTimestamp` presence depends on the upstream node implementation.
  const { blockTimestamp: _blockTimestamp, ...transaction } =
    block.transactions[0]!
  expect(transaction).toMatchInlineSnapshot(`
    {
      "accessList": [],
      "blobVersionedHashes": [
        "0x01637b24589ef367eaac307125f539f42cc84ca482d6c5f309698532c8a2d9d7",
        "0x01244879be004a8d2180995d74c273e8c2b1edcd283620308015ffa774c1d1d7",
        "0x01a426abdef2a217bd940077a2559b4eee7d9b98ce7c2f183a83d0c9564e0867",
      ],
      "blockHash": "0x738cc1716ea1f08adac2d4e2230aedcee2d5cd3f65d66d5d3597e05d710a3d50",
      "blockNumber": 24000000n,
      "chainId": 1,
      "data": "0x",
      "from": "0x5050f69a9786f081509234f1a7f4684b5e5b76c9",
      "gas": 21000n,
      "gasPrice": 10030101622n,
      "hash": "0xa94e96a83d0c8ec8726d5393b832f2973bdb16249f8c84b01672b5a150010836",
      "input": "0x",
      "maxFeePerBlobGas": 1000000000n,
      "maxFeePerGas": 30030000000n,
      "maxPriorityFeePerGas": 10010000000n,
      "nonce": 1846289n,
      "r": "0xcca4472fa8fc4b09e23098d51d8ffd8c6c6b5924c11c22c60e319c3e90e97434",
      "s": "0x025948b75cb749fe6e8ce13d10575e3a1e18d31c849d808e3d23263ea9e71021",
      "to": "0xff00000000000000000000000000000000008453",
      "transactionIndex": 0,
      "type": "eip4844",
      "v": 27,
      "value": 0n,
      "yParity": 0,
    }
  `)
})

test('behavior: converts via chain codecs when declared', async () => {
  const chain = mainnet.extend({
    rpcUrls: { http: anvil.mainnet.rpcUrl.http },
    codecs: { block: { fromRpc: (rpc: Block.Rpc) => Block.fromRpc(rpc) } },
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

test('behavior: converts custom properties via chain codecs', async () => {
  const chain = mainnet.extend({
    rpcUrls: { http: anvil.mainnet.rpcUrl.http },
    codecs: {
      block: {
        fromRpc: (rpc: Block.Rpc) => ({
          ...Block.fromRpc(rpc),
          custom: 'hello' as const,
        }),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const block = await Actions.block.get(schemaClient, {
    blockNumber: anvil.mainnet.forkBlockNumber,
  })
  // custom property is converted onto the result.
  expect(block.custom).toBe('hello')
  // standard properties still convert correctly.
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
