import { beforeAll, describe, expect, test } from 'vitest'

import { setVitalikResolver } from '~test/src/utils.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { optimism } from '../../chains/index.js'
import { http } from '../../clients/transports/http.js'

import { createHttpServer } from '~test/src/utils.js'
import {
  createClient,
  encodeErrorResult,
  encodeFunctionResult,
  parseAbi,
} from '~viem/index.js'
import { reset } from '../test/reset.js'
import { getEnsText } from './getEnsText.js'

const client = anvilMainnet.getClient()

beforeAll(async () => {
  await reset(client, {
    blockNumber: 19_258_213n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })
  await setVitalikResolver()
})

test('gets text record for name', async () => {
  await expect(
    getEnsText(client, { name: 'wagmi-dev.eth', key: 'com.twitter' }),
  ).resolves.toMatchInlineSnapshot('"wagmi_sh"')
})

test('gatewayUrls provided', async () => {
  let called = false

  const server = await createHttpServer((_, res) => {
    called = true
    res.end()
  })

  await getEnsText(client, {
    name: '1.offchainexample.eth',
    key: 'email',
    gatewayUrls: [server.url],
  }).catch(() => {})

  expect(called).toBe(true)
})

test('name without text record', async () => {
  await expect(
    getEnsText(client, {
      name: 'unregistered-name.eth',
      key: 'com.twitter',
    }),
  ).resolves.toBeNull()
})

test('name with resolver that does not support text()', async () => {
  await expect(
    getEnsText(client, {
      name: 'vitalik.eth',
      key: 'com.twitter',
    }),
  ).resolves.toBeNull()
})

test('name with resolver that does not support text() - strict', async () => {
  await expect(
    getEnsText(client, {
      name: 'vitalik.eth',
      key: 'com.twitter',
      strict: true,
    }),
  ).rejects.toMatchInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "resolve" reverted.

    Error: ResolverError(bytes returnData)
                        (0x)
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  resolve(bytes name, bytes data)
      args:             (0x07766974616c696b0365746800, 0x59d1d43cee6c4522aab0003e8d14cd40a6af439055fd2577951148c14b6cea9a534758350000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b636f6d2e74776974746572000000000000000000000000000000000000000000)

    Docs: https://viem.sh/docs/contract/readContract
    Version: viem@x.y.z]
  `)
})

test('name without resolver', async () => {
  await expect(
    getEnsText(client, {
      name: 'random1223232222.eth',
      key: 'com.twitter',
    }),
  ).resolves.toBeNull()
})

test('name without resolver - strict', async () => {
  await expect(
    getEnsText(client, {
      name: 'random1223232222.eth',
      key: 'com.twitter',
      strict: true,
    }),
  ).rejects.toMatchInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "resolve" reverted.

    Error: ResolverWildcardNotSupported()
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  resolve(bytes name, bytes data)
      args:             (0x1072616e646f6d313232333233323232320365746800, 0x59d1d43c08e69c7f3b86ec46d8fb6fcebf6b6512306f0171375c6309b751a585ab24864b0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b636f6d2e74776974746572000000000000000000000000000000000000000000)

    Docs: https://viem.sh/docs/contract/readContract
    Version: viem@x.y.z]
  `)
})

test('name with non-contract resolver', async () => {
  await expect(
    getEnsText(client, {
      name: 'vbuterin.eth',
      key: 'com.twitter',
    }),
  ).resolves.toBeNull()
})
test('name with non-contract resolver - strict', async () => {
  await expect(
    getEnsText(client, {
      name: 'vbuterin.eth',
      key: 'com.twitter',
      strict: true,
    }),
  ).rejects.toMatchInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "resolve" reverted.

    Error: ResolverNotContract()
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  resolve(bytes name, bytes data)
      args:             (0x08766275746572696e0365746800, 0x59d1d43c133a0d6e787307c1bdb6a3cde083ac5096ad9d67298908427642512fa2f6aa4f0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b636f6d2e74776974746572000000000000000000000000000000000000000000)

    Docs: https://viem.sh/docs/contract/readContract
    Version: viem@x.y.z]
  `)
})

describe('http error', () => {
  let server: Awaited<ReturnType<typeof createHttpServer>> | undefined
  beforeAll(async () => {
    server = await createHttpServer((_, res) => {
      const parsed = parseAbi([
        'function query((address,string[],bytes)[]) returns (bool[],bytes[])',
        'error HttpError((uint16,string)[])',
      ])

      const encoded = encodeFunctionResult({
        abi: parsed,
        functionName: 'query',
        result: [
          [true],
          [
            encodeErrorResult({
              abi: parsed,
              errorName: 'HttpError',
              args: [[[404, 'Not Found']]],
            }),
          ],
        ],
      })

      const response = JSON.stringify({ data: encoded })
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.write(response)
      res.end()
    })
  })
  test('non-strict', async () => {
    await expect(
      getEnsText(client, {
        name: '1.offchainexample.eth',
        key: 'email',
        gatewayUrls: [server!.url],
      }),
    ).resolves.toBeNull()
  })
  test('strict', async () => {
    await expect(
      getEnsText(client, {
        name: '1.offchainexample.eth',
        key: 'email',
        gatewayUrls: [server!.url],
        strict: true,
      }),
    ).rejects.toThrowError(`The contract function "resolve" reverted.

Error: HttpError((uint16 status, string message)[])
                ([{"status":404,"message":"Not Found"}])`)
  })
})

test('custom universal resolver address', async () => {
  await expect(
    getEnsText(client, {
      name: 'wagmi-dev.eth',
      key: 'com.twitter',
      universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
    }),
  ).resolves.toMatchInlineSnapshot('"wagmi_sh"')
})

describe('universal resolver with generic errors', () => {
  test('wildcard error', async () => {
    await expect(
      getEnsText(client, {
        name: 'random1223232222.eth',
        key: 'com.twitter',
        universalResolverAddress: '0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62',
      }),
    ).resolves.toBeNull()
  })
  test('wildcard error - strict', async () => {
    await expect(
      getEnsText(client, {
        name: 'random1223232222.eth',
        key: 'com.twitter',
        strict: true,
        universalResolverAddress: '0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "resolve" reverted with the following reason:
      UniversalResolver: Wildcard on non-extended resolvers is not supported

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  resolve(bytes name, bytes data)
        args:             (0x1072616e646f6d313232333233323232320365746800, 0x59d1d43c08e69c7f3b86ec46d8fb6fcebf6b6512306f0171375c6309b751a585ab24864b0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b636f6d2e74776974746572000000000000000000000000000000000000000000)

      Docs: https://viem.sh/docs/contract/readContract
      Version: viem@x.y.z]
    `)
  })
})

test('chain not provided', async () => {
  await expect(
    getEnsText(
      createClient({
        transport: http(anvilMainnet.rpcUrl.http),
      }),
      {
        name: 'wagmi-dev.eth',
        key: 'com.twitter',
      },
    ),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    '[Error: client chain not configured. universalResolverAddress is required.]',
  )
})

test('universal resolver contract not configured for chain', async () => {
  await expect(
    getEnsText(
      createClient({
        chain: optimism,
        transport: http(),
      }),
      {
        name: 'wagmi-dev.eth',
        key: 'com.twitter',
      },
    ),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ChainDoesNotSupportContract: Chain "OP Mainnet" does not support contract "ensUniversalResolver".

    This could be due to any of the following:
    - The chain does not have the contract "ensUniversalResolver" configured.

    Version: viem@x.y.z]
  `)
})

test('universal resolver contract deployed on later block', async () => {
  await expect(
    getEnsText(client, {
      name: 'wagmi-dev.eth',
      key: 'com.twitter',
      blockNumber: 14353601n,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ChainDoesNotSupportContract: Chain "Ethereum (Local)" does not support contract "ensUniversalResolver".

    This could be due to any of the following:
    - The contract "ensUniversalResolver" was not deployed until block 19258213 (current block 14353601).

    Version: viem@x.y.z]
  `)
})

test('invalid universal resolver address', async () => {
  await expect(
    getEnsText(client, {
      name: 'wagmi-dev.eth',
      key: 'com.twitter',
      universalResolverAddress: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "resolve" reverted.

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  resolve(bytes name, bytes data)
      args:             (0x097761676d692d6465760365746800, 0x59d1d43cf246651c1b9a6b141d19c2604e9a58f567973833990f830d882534a7478013590000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b636f6d2e74776974746572000000000000000000000000000000000000000000)

    Docs: https://viem.sh/docs/contract/readContract
    Version: viem@x.y.z]
  `)
})
