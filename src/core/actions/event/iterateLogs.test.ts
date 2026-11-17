import { AbiEvent, Hex } from 'ox'
import { Actions, Client, http } from 'viem'
import { expect, test } from 'vitest'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'
import * as Http from '~test/http.js'

const client = anvil.getClient(anvil.mainnet)

const transferEvent = AbiEvent.from(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)

const a = constants.accounts[0].address
const b = constants.accounts[1].address

const { address } = await contract.deploy(client, {
  bytecode: generated.Events.bytecode.object,
})

/**
 * Mines 10 blocks with a `Transfer` log in the first and the last, and returns
 * the first block.
 */
async function mineBlocks() {
  const transfer = async (value: bigint) => {
    await Actions.contract.write(client, {
      abi: generated.Events.abi,
      account: a,
      address,
      args: [a, b, value],
      functionName: 'emitTransfer',
    })
    await Actions.block.mine(client, { blocks: 1 })
  }

  const fromBlock =
    (await Actions.block.getNumber(client, { cacheTime: 0 })) + 1n
  await transfer(1n)
  await Actions.block.mine(client, { blocks: 8 })
  await transfer(2n)
  return fromBlock
}

/** Returns a page's block numbers relative to `base`, with its log values. */
function summarize(
  base: bigint,
  page: {
    endBlock: bigint
    fromBlock: bigint
    logs: readonly { args: { value?: bigint | undefined } }[]
    toBlock: bigint
  },
) {
  return {
    endBlock: page.endBlock - base,
    fromBlock: page.fromBlock - base,
    toBlock: page.toBlock - base,
    values: page.logs.map((log) => log.args.value),
  }
}

/**
 * Returns a Client whose `eth_getLogs` requests are answered by `getReply`
 * when it returns a reply, and forwarded to anvil otherwise.
 */
async function getProxyClient(
  getReply: (
    from: bigint,
    to: bigint,
  ) => { error: { code: number; message: string } } | undefined,
) {
  const url = await Http.createRpcProxy(
    anvil.mainnet.rpcUrl.http,
    ({ method, params }) => {
      if (method !== 'eth_getLogs') return undefined
      const [{ fromBlock, toBlock }] = params as [
        { fromBlock: Hex.Hex; toBlock: Hex.Hex },
      ]
      return getReply(Hex.toBigInt(fromBlock), Hex.toBigInt(toBlock))
    },
  )
  return Client.create({ transport: http(url, { retryCount: 0 }) })
}

test('default', async () => {
  const fromBlock = await mineBlocks()

  const pages = []
  for await (const page of Actions.event.iterateLogs(client, {
    address,
    blockRange: 4n,
    event: transferEvent,
    fromBlock,
    toBlock: fromBlock + 9n,
  }))
    pages.push(page)

  expect(pages.map((page) => summarize(fromBlock, page)))
    .toMatchInlineSnapshot(`
      [
        {
          "endBlock": 9n,
          "fromBlock": 0n,
          "toBlock": 3n,
          "values": [
            1n,
          ],
        },
        {
          "endBlock": 9n,
          "fromBlock": 4n,
          "toBlock": 7n,
          "values": [],
        },
        {
          "endBlock": 9n,
          "fromBlock": 8n,
          "toBlock": 9n,
          "values": [
            2n,
          ],
        },
      ]
    `)
  expect(pages[0]!.logs[0]!.args).toMatchInlineSnapshot(`
    {
      "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "value": 1n,
    }
  `)
})

test('behavior: returns raw logs without `event`', async () => {
  const fromBlock = await mineBlocks()

  const pages = []
  for await (const page of Actions.event.iterateLogs(client, {
    address,
    blockRange: 10n,
    fromBlock,
    toBlock: fromBlock + 9n,
  }))
    pages.push(page)

  expect(
    pages.map((page) => ({
      fromBlock: page.fromBlock - fromBlock,
      logs: page.logs.map((log) => log.blockNumber! - fromBlock),
      toBlock: page.toBlock - fromBlock,
    })),
  ).toMatchInlineSnapshot(`
    [
      {
        "fromBlock": 0n,
        "logs": [
          0n,
          9n,
        ],
        "toBlock": 9n,
      },
    ]
  `)
})

test('behavior: resolves a block tag once', async () => {
  const fromBlock = await mineBlocks()

  const pages = []
  for await (const page of Actions.event.iterateLogs(client, {
    address,
    blockRange: 4n,
    event: transferEvent,
    fromBlock,
  })) {
    pages.push(page)
    await Actions.block.mine(client, { blocks: 5 })
  }

  expect(pages.map((page) => summarize(fromBlock, page)))
    .toMatchInlineSnapshot(`
      [
        {
          "endBlock": 9n,
          "fromBlock": 0n,
          "toBlock": 3n,
          "values": [
            1n,
          ],
        },
        {
          "endBlock": 9n,
          "fromBlock": 4n,
          "toBlock": 7n,
          "values": [],
        },
        {
          "endBlock": 9n,
          "fromBlock": 8n,
          "toBlock": 9n,
          "values": [
            2n,
          ],
        },
      ]
    `)
})

test('behavior: splits a block range the RPC Provider rejects', async () => {
  const fromBlock = await mineBlocks()
  const proxyClient = await getProxyClient((from, to) =>
    to - from + 1n > 2n
      ? { error: { code: -32602, message: 'block range exceeds 2 blocks' } }
      : undefined,
  )

  const pages = []
  for await (const page of Actions.event.iterateLogs(proxyClient, {
    address,
    blockRange: 4n,
    event: transferEvent,
    fromBlock,
    toBlock: fromBlock + 9n,
  }))
    pages.push(page)

  expect(pages.map((page) => summarize(fromBlock, page)))
    .toMatchInlineSnapshot(`
      [
        {
          "endBlock": 9n,
          "fromBlock": 0n,
          "toBlock": 1n,
          "values": [
            1n,
          ],
        },
        {
          "endBlock": 9n,
          "fromBlock": 2n,
          "toBlock": 3n,
          "values": [],
        },
        {
          "endBlock": 9n,
          "fromBlock": 4n,
          "toBlock": 5n,
          "values": [],
        },
        {
          "endBlock": 9n,
          "fromBlock": 6n,
          "toBlock": 7n,
          "values": [],
        },
        {
          "endBlock": 9n,
          "fromBlock": 8n,
          "toBlock": 9n,
          "values": [
            2n,
          ],
        },
      ]
    `)
})

test('behavior: throws a page that a smaller range does not fix', async () => {
  const fromBlock = await mineBlocks()
  const proxyClient = await getProxyClient((from) =>
    from === fromBlock + 4n
      ? { error: { code: 429, message: 'Too Many Requests' } }
      : undefined,
  )

  const pages = Actions.event.iterateLogs(proxyClient, {
    address,
    blockRange: 4n,
    event: transferEvent,
    fromBlock,
    toBlock: fromBlock + 9n,
  })
  const page = await pages.next()
  const error = await pages.next().catch((error) => error)

  expect({
    error: error.name,
    page: summarize(fromBlock, page.value!),
  }).toMatchInlineSnapshot(`
    {
      "error": "RpcResponse.InternalError",
      "page": {
        "endBlock": 9n,
        "fromBlock": 0n,
        "toBlock": 3n,
        "values": [
          1n,
        ],
      },
    }
  `)
})

test('behavior: throws when a single block is rejected', async () => {
  const fromBlock = await mineBlocks()
  const proxyClient = await getProxyClient(() => ({
    error: { code: -32005, message: 'query returned too many logs' },
  }))

  const error = await Actions.event
    .iterateLogs(proxyClient, {
      event: transferEvent,
      fromBlock,
      toBlock: fromBlock + 9n,
    })
    .next()
    .catch((error) => error)

  expect(error.name).toMatchInlineSnapshot(`"RpcResponse.LimitExceededError"`)
})

test('behavior: rejects a block range of less than one block', async () => {
  const error = await Actions.event
    .iterateLogs(client, {
      blockRange: 0n,
      fromBlock: 0n,
      toBlock: 1n,
    })
    .next()
    .catch((error) => error)

  expect(error).toMatchInlineSnapshot(`
    [Event.InvalidBlockRangeError: \`blockRange\` must be at least 1n. Received 0n.

    Version: viem@x.x.x]
  `)
})
