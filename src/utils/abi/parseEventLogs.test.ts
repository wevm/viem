import { expect, test } from 'vitest'

import { forkBlockNumber } from '~test/src/constants.js'
import { publicClient } from '~test/src/utils.js'

import { getLogs } from '../../actions/public/getLogs.js'
import { parseEventLogs } from './parseEventLogs.js'

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
  const logs = await getLogs(publicClient, {
    fromBlock: forkBlockNumber - 5n,
    toBlock: forkBlockNumber,
  })

  const parsedLogs = parseEventLogs({
    abi,
    logs,
  })
  expect(parsedLogs.length).toBe(978)
  expect(parsedLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "args": {
        "from": "0x00000000003b3cc22aF3aE1EAc0440BcEe416B40",
        "to": "0x393ADf60012809316659Af13A3117ec22D093a38",
        "value": 1162592016924672n,
      },
      "blockHash": "0xc972251b03cbef4c2f8d63d5357fbae2a8502c7e4aabb18a6dea77be65a5cd34",
      "blockNumber": 16280765n,
      "data": "0x0000000000000000000000000000000000000000000000000004215f0c300000",
      "eventName": "Transfer",
      "logIndex": 0,
      "removed": false,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x00000000000000000000000000000000003b3cc22af3ae1eac0440bcee416b40",
        "0x000000000000000000000000393adf60012809316659af13a3117ec22d093a38",
      ],
      "transactionHash": "0x46807ccb87375145fe102ee95b9a76c47ea8e2b36202b28639260a6055cabf95",
      "transactionIndex": 1,
    }
  `)
})

test('args: eventName', async () => {
  const logs = await getLogs(publicClient, {
    fromBlock: forkBlockNumber - 5n,
    toBlock: forkBlockNumber,
  })

  const transferLogs = parseEventLogs({
    abi,
    eventName: 'Transfer',
    logs,
  })
  expect(transferLogs.length).toBe(783)
  expect(transferLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "args": {
        "from": "0x00000000003b3cc22aF3aE1EAc0440BcEe416B40",
        "to": "0x393ADf60012809316659Af13A3117ec22D093a38",
        "value": 1162592016924672n,
      },
      "blockHash": "0xc972251b03cbef4c2f8d63d5357fbae2a8502c7e4aabb18a6dea77be65a5cd34",
      "blockNumber": 16280765n,
      "data": "0x0000000000000000000000000000000000000000000000000004215f0c300000",
      "eventName": "Transfer",
      "logIndex": 0,
      "removed": false,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x00000000000000000000000000000000003b3cc22af3ae1eac0440bcee416b40",
        "0x000000000000000000000000393adf60012809316659af13a3117ec22d093a38",
      ],
      "transactionHash": "0x46807ccb87375145fe102ee95b9a76c47ea8e2b36202b28639260a6055cabf95",
      "transactionIndex": 1,
    }
  `)

  const approvalLogs = parseEventLogs({
    abi,
    eventName: 'Approval',
    logs,
  })
  expect(approvalLogs.length).toBe(195)
  expect(approvalLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xf4b38f5e42e2a5ffd545121574fef335e77dd493",
      "args": {
        "owner": "0xF4B38F5E42e2A5FfD545121574Fef335e77dD493",
        "spender": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "value": 345000000000000000000000000000n,
      },
      "blockHash": "0xc972251b03cbef4c2f8d63d5357fbae2a8502c7e4aabb18a6dea77be65a5cd34",
      "blockNumber": 16280765n,
      "data": "0x00000000000000000000000000000000000000045ac14fb35ffcd214a8000000",
      "eventName": "Approval",
      "logIndex": 9,
      "removed": false,
      "topics": [
        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
        "0x000000000000000000000000f4b38f5e42e2a5ffd545121574fef335e77dd493",
        "0x0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d",
      ],
      "transactionHash": "0x11e0a2fd9eaed1bbceb832786ae0b0e17ca36b04cfb1f7ba9e9c7f0040e43464",
      "transactionIndex": 2,
    }
  `)

  const contractLogs = parseEventLogs({
    abi,
    eventName: ['Approval', 'Transfer'],
    logs,
  })
  expect(contractLogs.length).toBe(978)
  expect(contractLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "args": {
        "from": "0x00000000003b3cc22aF3aE1EAc0440BcEe416B40",
        "to": "0x393ADf60012809316659Af13A3117ec22D093a38",
        "value": 1162592016924672n,
      },
      "blockHash": "0xc972251b03cbef4c2f8d63d5357fbae2a8502c7e4aabb18a6dea77be65a5cd34",
      "blockNumber": 16280765n,
      "data": "0x0000000000000000000000000000000000000000000000000004215f0c300000",
      "eventName": "Transfer",
      "logIndex": 0,
      "removed": false,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x00000000000000000000000000000000003b3cc22af3ae1eac0440bcee416b40",
        "0x000000000000000000000000393adf60012809316659af13a3117ec22d093a38",
      ],
      "transactionHash": "0x46807ccb87375145fe102ee95b9a76c47ea8e2b36202b28639260a6055cabf95",
      "transactionIndex": 1,
    }
  `)
})

test('args: strict', async () => {
  const logs = await getLogs(publicClient, {
    fromBlock: forkBlockNumber - 5n,
    toBlock: forkBlockNumber,
  })

  const parsedLogs = parseEventLogs({
    abi,
    logs,
    strict: false,
  })
  expect(parsedLogs.length).toBe(1292)
  expect(parsedLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "args": {
        "from": "0x00000000003b3cc22aF3aE1EAc0440BcEe416B40",
        "to": "0x393ADf60012809316659Af13A3117ec22D093a38",
        "value": 1162592016924672n,
      },
      "blockHash": "0xc972251b03cbef4c2f8d63d5357fbae2a8502c7e4aabb18a6dea77be65a5cd34",
      "blockNumber": 16280765n,
      "data": "0x0000000000000000000000000000000000000000000000000004215f0c300000",
      "eventName": "Transfer",
      "logIndex": 0,
      "removed": false,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x00000000000000000000000000000000003b3cc22af3ae1eac0440bcee416b40",
        "0x000000000000000000000000393adf60012809316659af13a3117ec22d093a38",
      ],
      "transactionHash": "0x46807ccb87375145fe102ee95b9a76c47ea8e2b36202b28639260a6055cabf95",
      "transactionIndex": 1,
    }
  `)
})
