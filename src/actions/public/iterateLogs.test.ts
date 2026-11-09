import { Hex } from 'ox'
import { createClient, http, parseAbiItem } from 'viem'
import {
  getBlockNumber,
  impersonateAccount,
  iterateLogs,
  mine,
  writeContract,
} from 'viem/actions'
import { beforeAll, expect, test } from 'vitest'

import { usdcContractConfig } from '~test/abis.js'
import { anvilMainnet } from '~test/anvil.js'
import { accounts, address } from '~test/constants.js'
import { createRpcProxy } from '~test/utils.js'

const client = anvilMainnet.getClient()

const event = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)

beforeAll(async () => {
  await impersonateAccount(client, { address: address.vitalik })
})

/** Mines 10 blocks with a USDC transfer in the first and the last, and returns the first. */
async function mineBlocks() {
  const transfer = () =>
    writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })

  const fromBlock = (await getBlockNumber(client, { cacheTime: 0 })) + 1n
  await transfer()
  await mine(client, { blocks: 9 })
  await transfer()
  await mine(client, { blocks: 1 })
  return fromBlock
}

/** Returns a page's block numbers relative to `base`, with its log count. */
function summarize(
  base: bigint,
  page: {
    endBlock: bigint
    fromBlock: bigint
    logs: unknown[]
    toBlock: bigint
  },
) {
  return {
    endBlock: page.endBlock - base,
    fromBlock: page.fromBlock - base,
    logs: page.logs.length,
    toBlock: page.toBlock - base,
  }
}

test('default', async () => {
  const fromBlock = await mineBlocks()

  const pages = []
  for await (const page of iterateLogs(client, {
    address: usdcContractConfig.address,
    blockRange: 4n,
    event,
    fromBlock,
    toBlock: fromBlock + 9n,
  }))
    pages.push(page)

  expect(
    pages.map((page) => summarize(fromBlock, page)),
  ).toMatchInlineSnapshot(`
    [
      {
        "endBlock": 9n,
        "fromBlock": 0n,
        "logs": 1,
        "toBlock": 3n,
      },
      {
        "endBlock": 9n,
        "fromBlock": 4n,
        "logs": 0,
        "toBlock": 7n,
      },
      {
        "endBlock": 9n,
        "fromBlock": 8n,
        "logs": 1,
        "toBlock": 9n,
      },
    ]
  `)
  expect(pages[0]!.logs[0]!.args).toMatchInlineSnapshot(`
    {
      "from": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "to": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "value": 1n,
    }
  `)
})

test('behavior: resolves a block tag once', async () => {
  const fromBlock = await mineBlocks()

  const pages = []
  for await (const page of iterateLogs(client, {
    address: usdcContractConfig.address,
    blockRange: 4n,
    event,
    fromBlock,
  })) {
    pages.push(page)
    await mine(client, { blocks: 5 })
  }

  expect(
    pages.map((page) => summarize(fromBlock, page)),
  ).toMatchInlineSnapshot(`
    [
      {
        "endBlock": 9n,
        "fromBlock": 0n,
        "logs": 1,
        "toBlock": 3n,
      },
      {
        "endBlock": 9n,
        "fromBlock": 4n,
        "logs": 0,
        "toBlock": 7n,
      },
      {
        "endBlock": 9n,
        "fromBlock": 8n,
        "logs": 1,
        "toBlock": 9n,
      },
    ]
  `)
})

test('behavior: splits a block range the RPC Provider rejects', async () => {
  const fromBlock = await mineBlocks()
  const url = await createRpcProxy(
    anvilMainnet.rpcUrl.http,
    ({ method, params }) => {
      if (method !== 'eth_getLogs') return undefined
      const [{ fromBlock, toBlock }] = params as [
        { fromBlock: Hex.Hex; toBlock: Hex.Hex },
      ]
      if (Hex.toBigInt(toBlock) - Hex.toBigInt(fromBlock) + 1n > 2n)
        return {
          error: { code: -32602, message: 'block range exceeds 2 blocks' },
        }
      return undefined
    },
  )
  const client_ = createClient({
    ...anvilMainnet.clientConfig,
    transport: http(url, { retryCount: 0 }),
  })

  const pages = []
  for await (const page of iterateLogs(client_, {
    address: usdcContractConfig.address,
    blockRange: 4n,
    event,
    fromBlock,
    toBlock: fromBlock + 9n,
  }))
    pages.push(page)

  expect(
    pages.map((page) => summarize(fromBlock, page)),
  ).toMatchInlineSnapshot(`
    [
      {
        "endBlock": 9n,
        "fromBlock": 0n,
        "logs": 1,
        "toBlock": 1n,
      },
      {
        "endBlock": 9n,
        "fromBlock": 2n,
        "logs": 0,
        "toBlock": 3n,
      },
      {
        "endBlock": 9n,
        "fromBlock": 4n,
        "logs": 0,
        "toBlock": 5n,
      },
      {
        "endBlock": 9n,
        "fromBlock": 6n,
        "logs": 0,
        "toBlock": 7n,
      },
      {
        "endBlock": 9n,
        "fromBlock": 8n,
        "logs": 1,
        "toBlock": 9n,
      },
    ]
  `)
})

test('behavior: throws a page that a smaller range does not fix', async () => {
  const fromBlock = await mineBlocks()
  const url = await createRpcProxy(
    anvilMainnet.rpcUrl.http,
    ({ method, params }) => {
      if (method !== 'eth_getLogs') return undefined
      const [{ fromBlock: from }] = params as [{ fromBlock: Hex.Hex }]
      if (Hex.toBigInt(from) === fromBlock + 4n)
        return { error: { code: 429, message: 'Too Many Requests' } }
      return undefined
    },
  )
  const client_ = createClient({
    ...anvilMainnet.clientConfig,
    transport: http(url, { retryCount: 0 }),
  })

  const pages = iterateLogs(client_, {
    address: usdcContractConfig.address,
    blockRange: 4n,
    event,
    fromBlock,
    toBlock: fromBlock + 9n,
  })
  const page = await pages.next()
  const error = await pages.next().catch((error) => error)

  expect(summarize(fromBlock, page.value!)).toMatchInlineSnapshot(`
    {
      "endBlock": 9n,
      "fromBlock": 0n,
      "logs": 1,
      "toBlock": 3n,
    }
  `)
  expect(error.name).toMatchInlineSnapshot(`"RpcRequestError"`)
})

test('behavior: throws when a single block is rejected', async () => {
  const fromBlock = await mineBlocks()
  const url = await createRpcProxy(anvilMainnet.rpcUrl.http, ({ method }) => {
    if (method === 'eth_getLogs')
      return {
        error: { code: -32005, message: 'query returned too many logs' },
      }
    return undefined
  })
  const client_ = createClient({
    ...anvilMainnet.clientConfig,
    transport: http(url, { retryCount: 0 }),
  })

  const error = await iterateLogs(client_, {
    event,
    fromBlock,
    toBlock: fromBlock + 9n,
  })
    .next()
    .catch((error) => error)

  expect(error.name).toMatchInlineSnapshot(`"LimitExceededRpcError"`)
})
