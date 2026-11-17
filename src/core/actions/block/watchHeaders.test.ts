import { expect, test } from 'vitest'

import { Actions, Client, http, webSocket } from 'viem'

import * as Ws from '~test/ws.js'

const header = {
  baseFeePerGas: '0x1',
  difficulty: '0x0',
  extraData: '0x',
  gasLimit: '0x1c9c380',
  gasUsed: '0x5208',
  hash: '0x0000000000000000000000000000000000000000000000000000000000000001',
  logsBloom: `0x${'0'.repeat(512)}`,
  miner: '0x0000000000000000000000000000000000000000',
  mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  nonce: '0x0000000000000000',
  number: '0x1',
  parentHash:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  receiptsRoot:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  sha3Uncles:
    '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
  stateRoot:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  timestamp: '0x1',
  transactionsRoot:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
} as const

test('emits subscription headers without fetching full blocks', async () => {
  const server = await Ws.createServer((connection, message) => {
    const request = JSON.parse(message)
    if (request.method !== 'eth_subscribe') return
    connection.send(
      JSON.stringify({ id: request.id, jsonrpc: '2.0', result: '0x1' }),
    )
    for (const number of ['0x1', '0x2'])
      connection.send(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_subscription',
          params: {
            result: { ...header, number, timestamp: number },
            subscription: '0x1',
          },
        }),
      )
  })

  try {
    const client = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })
    const headers: Actions.block.watchHeaders.BlockHeader[] = []
    const previous: Actions.block.watchHeaders.BlockHeader[] = []
    const watch = Actions.block.watchHeaders(client)
    watch.onBlockHeader((blockHeader, prevBlockHeader) => {
      headers.push(blockHeader)
      if (prevBlockHeader) previous.push(prevBlockHeader)
    })

    await expect.poll(() => headers.length).toBe(2)
    watch.off()
    ;(await client.transport.getRpcClient()).close()

    expect(headers.map((value) => value.number)).toEqual([1n, 2n])
    expect(headers.map((value) => value.timestamp)).toEqual([1n, 2n])
    expect(headers[0]).not.toHaveProperty('size')
    expect(headers[0]).not.toHaveProperty('transactions')
    expect(headers[0]).not.toHaveProperty('withdrawals')
    expect(previous).toEqual([headers[0]])
    expect(
      server.connections.flatMap(({ messages }) =>
        messages.map((message) => JSON.parse(message).method),
      ),
    ).not.toContain('eth_getBlockByNumber')
  } finally {
    await server.close()
  }
})

test('reports an error for transports without subscriptions', async () => {
  const client = Client.create({ transport: http('http://127.0.0.1:1') })
  const watch = Actions.block.watchHeaders(client)
  const error = new Promise<Error>((resolve) => watch.onError(resolve))
  watch.onBlockHeader(() => {})

  await expect(error).resolves.toMatchObject({
    message: '`block.watchHeaders` requires a subscription transport.',
  })
  watch.off()
})
