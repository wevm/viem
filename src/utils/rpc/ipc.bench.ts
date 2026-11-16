import { rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, bench, describe } from 'vitest'

import { getIpcRpcClient } from './ipc.js'

const path = join(tmpdir(), `viem-ipc-bench-${process.pid}.sock`)
rmSync(path, { force: true })

// Responds to each request with a `result` of `params[0]` bytes, which
// `node:net` delivers to the client in 64KB chunks.
const server = createServer((socket) => {
  socket.on('data', (data) => {
    const { id, params } = JSON.parse(data.toString())
    const result = `0x${'ab'.repeat(params[0] / 2)}`
    socket.write(JSON.stringify({ jsonrpc: '2.0', id, result }))
  })
})
await new Promise<void>((resolve) => server.listen(path, resolve))
const client = await getIpcRpcClient(path)

afterAll(() => {
  client.close()
  server.close()
  rmSync(path, { force: true })
})

for (const size of [1, 4, 16])
  describe(`Receive a ${size}MB response over IPC`, () => {
    bench(
      'viem: `getIpcRpcClient`',
      async () => {
        await client.requestAsync({
          body: { method: 'eth_call', params: [size * 1024 * 1024] },
          timeout: 60_000,
        })
      },
      { iterations: 5, time: 0, warmupIterations: 1, warmupTime: 0 },
    )
  })
