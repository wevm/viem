import { createServer } from 'node:http'
import { createClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { tempoLocalnet } from 'viem/chains'
import { Addresses, Relay, Store } from 'viem/tempo'
import { expect, onTestFinished, test } from 'vitest'

test.each(
  ['transaction', 'feePayer', 'multisig'].flatMap((mode) =>
    [0, 1].map((retryCount) => ({ mode, retryCount })),
  ),
)(
  'preserves the downstream retry budget: $mode, $retryCount',
  async ({ mode, retryCount }) => {
    // A temporarily unavailable endpoint becomes permanently unavailable after
    // the permitted attempts. An extra forwarding retry changes the observed error.
    const server = createServer()
    const failures = Array.from({ length: retryCount + 1 }, () => ({
      code: -32603,
      message: 'Temporarily unavailable',
    }))
    server.on('request', (_request, response) => {
      response.setHeader('Content-Type', 'application/json')
      response.end(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          error: failures.shift() ?? {
            code: -32602,
            message: 'Permanently unavailable',
          },
        }),
      )
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    onTestFinished(
      () =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()))
          server.closeAllConnections()
        }),
    )
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Missing port')
    const relay = Relay.create({
      client: createClient({
        chain: tempoLocalnet,
        transport: http(`http://127.0.0.1:${address.port}`, { retryCount: 0 }),
      }),
      plugins:
        mode === 'transaction'
          ? [Relay.simulate(), Relay.autoSwap(), Relay.feeToken()]
          : mode === 'feePayer'
            ? [
                Relay.feePayer({
                  account: privateKeyToAccount(
                    '0x0000000000000000000000000000000000000000000000000000000000000001',
                  ),
                }),
              ]
            : [Relay.multisig({ store: Store.memory() })],
    })
    await expect(
      relay.request(
        {
          method:
            mode === 'multisig' ? 'multisig_getConfig' : 'eth_fillTransaction',
          params: [
            mode !== 'multisig'
              ? {
                  from: '0x0000000000000000000000000000000000000001',
                  to: '0x0000000000000000000000000000000000000002',
                  feeToken: Addresses.pathUsd,
                }
              : { address: '0x0000000000000000000000000000000000000001' },
          ],
        },
        { retryCount, retryDelay: 0 },
      ),
    ).rejects.toMatchObject({ code: -32603 })
  },
)
