import { expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { getLogs } from '../../actions/public/getLogs.js'

import { parseEventLogs } from './parseEventLogs.js'

const client = anvilMainnet.getClient()

const abi = [
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
  },
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
  },
] as const

test('default', async () => {
  const logs = await getLogs(client, {
    fromBlock: anvilMainnet.forkBlockNumber - 5n,
    toBlock: anvilMainnet.forkBlockNumber,
  })

  const parsedLogs = parseEventLogs({
    abi,
    logs,
  })
  expect(parsedLogs.length).toBe(811)
  expect(parsedLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "args": {
        "from": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "to": "0x3785ca1128D2EfdDFec1a87ddb5686B59C7138F8",
        "value": 100000000000000000n,
      },
      "blockHash": "0xec0395936bc0113ff8a734eafb8883a21f2bb4489814a331213cf41f8a8dff2b",
      "blockNumber": 19808245n,
      "data": "0x000000000000000000000000000000000000000000000000016345785d8a0000",
      "eventName": "Transfer",
      "logIndex": 1,
      "removed": false,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d",
        "0x0000000000000000000000003785ca1128d2efddfec1a87ddb5686b59c7138f8",
      ],
      "transactionHash": "0x1f83dcc30cc4a2649a95ca04b47a2b1fe9524991a2c7858acb560d4b8e717d53",
      "transactionIndex": 0,
    }
  `)
})

test('args: eventName', async () => {
  const logs = await getLogs(client, {
    fromBlock: anvilMainnet.forkBlockNumber - 5n,
    toBlock: anvilMainnet.forkBlockNumber,
  })

  const transferLogs = parseEventLogs({
    abi,
    eventName: 'Transfer',
    logs,
  })
  expect(transferLogs.length).toBe(698)
  expect(transferLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "args": {
        "from": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "to": "0x3785ca1128D2EfdDFec1a87ddb5686B59C7138F8",
        "value": 100000000000000000n,
      },
      "blockHash": "0xec0395936bc0113ff8a734eafb8883a21f2bb4489814a331213cf41f8a8dff2b",
      "blockNumber": 19808245n,
      "data": "0x000000000000000000000000000000000000000000000000016345785d8a0000",
      "eventName": "Transfer",
      "logIndex": 1,
      "removed": false,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d",
        "0x0000000000000000000000003785ca1128d2efddfec1a87ddb5686b59c7138f8",
      ],
      "transactionHash": "0x1f83dcc30cc4a2649a95ca04b47a2b1fe9524991a2c7858acb560d4b8e717d53",
      "transactionIndex": 0,
    }
  `)

  const approvalLogs = parseEventLogs({
    abi,
    eventName: 'Approval',
    logs,
  })
  expect(approvalLogs.length).toBe(113)
  expect(approvalLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0x55c3a56e638e96c91f98735cc86f60a6820e6a44",
      "args": {
        "owner": "0xD40d02d0CccFD8302149104DCc72eBF1af5034Bc",
        "spender": "0x80a64c6D7f12C47B7c66c5B4E20E72bc1FCd5d9e",
        "value": 115792089237316195423570985008687907853269984665640564039429318831067397538272n,
      },
      "blockHash": "0xec0395936bc0113ff8a734eafb8883a21f2bb4489814a331213cf41f8a8dff2b",
      "blockNumber": 19808245n,
      "data": "0xfffffffffffffffffffffffffffffffffffffffffffffffe77bdeb6a048ac1e0",
      "eventName": "Approval",
      "logIndex": 6,
      "removed": false,
      "topics": [
        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
        "0x000000000000000000000000d40d02d0cccfd8302149104dcc72ebf1af5034bc",
        "0x00000000000000000000000080a64c6d7f12c47b7c66c5b4e20e72bc1fcd5d9e",
      ],
      "transactionHash": "0x3139f407c34c78f4c66298aa88082120328e3fdd2e3a12ff42af82c6cc8fb6c4",
      "transactionIndex": 1,
    }
  `)

  const contractLogs = parseEventLogs({
    abi,
    eventName: ['Approval', 'Transfer'],
    logs,
  })
  expect(contractLogs.length).toBe(811)
  expect(contractLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "args": {
        "from": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "to": "0x3785ca1128D2EfdDFec1a87ddb5686B59C7138F8",
        "value": 100000000000000000n,
      },
      "blockHash": "0xec0395936bc0113ff8a734eafb8883a21f2bb4489814a331213cf41f8a8dff2b",
      "blockNumber": 19808245n,
      "data": "0x000000000000000000000000000000000000000000000000016345785d8a0000",
      "eventName": "Transfer",
      "logIndex": 1,
      "removed": false,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d",
        "0x0000000000000000000000003785ca1128d2efddfec1a87ddb5686b59c7138f8",
      ],
      "transactionHash": "0x1f83dcc30cc4a2649a95ca04b47a2b1fe9524991a2c7858acb560d4b8e717d53",
      "transactionIndex": 0,
    }
  `)
})

test('args: strict', async () => {
  const logs = await getLogs(client, {
    fromBlock: anvilMainnet.forkBlockNumber - 5n,
    toBlock: anvilMainnet.forkBlockNumber,
  })

  const parsedLogs = parseEventLogs({
    abi,
    logs,
    strict: false,
  })
  expect(parsedLogs.length).toBe(1008)
  expect(parsedLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "args": {
        "from": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "to": "0x3785ca1128D2EfdDFec1a87ddb5686B59C7138F8",
        "value": 100000000000000000n,
      },
      "blockHash": "0xec0395936bc0113ff8a734eafb8883a21f2bb4489814a331213cf41f8a8dff2b",
      "blockNumber": 19808245n,
      "data": "0x000000000000000000000000000000000000000000000000016345785d8a0000",
      "eventName": "Transfer",
      "logIndex": 1,
      "removed": false,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d",
        "0x0000000000000000000000003785ca1128d2efddfec1a87ddb5686b59c7138f8",
      ],
      "transactionHash": "0x1f83dcc30cc4a2649a95ca04b47a2b1fe9524991a2c7858acb560d4b8e717d53",
      "transactionIndex": 0,
    }
  `)
})
