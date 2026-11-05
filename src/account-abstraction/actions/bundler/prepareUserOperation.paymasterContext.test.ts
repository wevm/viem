import { createServer } from 'node:http'
import { describe, expect, test } from 'vitest'
import { mainnet } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { stringToHex } from '../../../utils/encoding/toHex.js'
import { toSmartAccount } from '../../accounts/toSmartAccount.js'
import { createBundlerClient } from '../../clients/createBundlerClient.js'
import { createPaymasterClient } from '../../clients/createPaymasterClient.js'
import { prepareUserOperation } from './prepareUserOperation.js'

const paymaster = '0x0000000000000000000000000000000000000001'

async function setup() {
  const server = createServer((req, res) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      const { id, method, params } = JSON.parse(data)
      if (
        method !== 'pm_getPaymasterStubData' &&
        method !== 'pm_getPaymasterData'
      ) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            id,
            jsonrpc: '2.0',
            error: { code: -32601, message: 'Method not found' },
          }),
        )
        return
      }

      const context = params[3]
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          id,
          jsonrpc: '2.0',
          result: {
            paymaster,
            paymasterData: stringToHex(JSON.stringify(context ?? null)),
          },
        }),
      )
    })
  })
  await new Promise<void>((resolve) => server.listen(0, resolve))
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0

  const account = await toSmartAccount({
    client: createClient({
      chain: mainnet,
      transport: http('http://localhost:1'),
    }),
    entryPoint: {
      abi: [],
      address: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
      version: '0.7',
    },
    getAddress: async () => '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    encodeCalls: async () => '0x',
    getFactoryArgs: async () => ({}),
    getStubSignature: async () => '0x',
    signMessage: async () => '0x',
    signTypedData: async () => '0x',
    signUserOperation: async () => '0x',
  })

  const paymasterClient = createPaymasterClient({
    transport: http(`http://localhost:${port}`),
  })

  return {
    account,
    bundlerClient: (paymasterContext: unknown) =>
      createBundlerClient({
        chain: mainnet,
        paymaster: paymasterClient,
        ...(paymasterContext !== undefined ? { paymasterContext } : {}),
        transport: http('http://localhost:1'),
      }),
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  }
}

describe('paymasterContext', () => {
  test.each([
    { name: 'false', value: false },
    { name: '0', value: 0 },
    { name: "''", value: '' },
    { name: 'object', value: { source: 'op' } },
  ])(
    'forwards a falsy per-operation paymasterContext ($name) instead of the client default',
    async ({ value }) => {
      const { account, bundlerClient, close } = await setup()

      const request = await prepareUserOperation(
        bundlerClient({ source: 'client-default' }),
        {
          account,
          callData: '0x',
          parameters: ['paymaster'] as const,
          paymasterContext: value,
        },
      )
      await close()

      expect(request.paymasterData).toBe(stringToHex(JSON.stringify(value)))
    },
  )

  test('falls back to the client default when no per-operation paymasterContext is given', async () => {
    const { account, bundlerClient, close } = await setup()

    const request = await prepareUserOperation(
      bundlerClient({ source: 'client-default' }),
      {
        account,
        callData: '0x',
        parameters: ['paymaster'] as const,
      },
    )
    await close()

    expect(request.paymasterData).toBe(
      stringToHex(JSON.stringify({ source: 'client-default' })),
    )
  })

  test('forwards a falsy per-operation paymasterContext when no client default exists', async () => {
    const { account, bundlerClient, close } = await setup()

    const request = await prepareUserOperation(bundlerClient(undefined), {
      account,
      callData: '0x',
      parameters: ['paymaster'] as const,
      paymasterContext: false,
    })
    await close()

    expect(request.paymasterData).toBe(stringToHex(JSON.stringify(false)))
  })
})
