import * as AbiFunction from 'ox/AbiFunction'
import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as contract from '~test/contract.js'
import * as Http from '~test/http.js'
import { z } from 'ox/zod'
import { describe, expect, test } from 'vitest'
import { Account, Actions, Client, http, NodeError, NonceManager } from 'viem'
import { mainnet } from 'viem/chains'

import { accounts } from '~test/constants.js'

const client = anvil.getClient(anvil.mainnet)
const account = accounts[0].address

const chain = mainnet.extend({
  rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
})

const { address } = await contract.deploy(client, {
  bytecode: generated.Erc721.bytecode.object,
})
const ownerOfAbi = AbiFunction.from(
  'function ownerOf(uint256 tokenId) returns (address)',
)
const ownerOfNonexistent = AbiFunction.encodeData(ownerOfAbi, [12517631n])

describe.each([
  ['json-rpc (Account.from)', Account.from(accounts[0].address)],
  [
    'local (Account.fromPrivateKey)',
    Account.fromPrivateKey(accounts[0].privateKey),
  ],
] as const)('account: %s', (_name, account) => {
  test('fills a transaction request', async () => {
    const { capabilities, raw, transaction } = await Actions.transaction.fill(
      client,
      {
        account,
        data: '0xdeadbeef',
        to: '0x0000000000000000000000000000000000000000',
      },
    )

    const { gasPrice, hash, maxFeePerGas, maxPriorityFeePerGas, nonce, ...tx } =
      transaction

    expect(capabilities).toBeUndefined()
    expect(raw).toBeTypeOf('string')
    expect(hash).toBeTypeOf('string')
    expect(nonce).toBeTypeOf('bigint')
    expect(gasPrice).toBeTypeOf('bigint')
    expect(maxFeePerGas).toBeTypeOf('bigint')
    expect(maxPriorityFeePerGas).toBeTypeOf('bigint')
    expect(tx).toMatchInlineSnapshot(`
      {
        "accessList": [],
        "chainId": 1,
        "data": "0xdeadbeef",
        "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "gas": 21160n,
        "input": "0xdeadbeef",
        "to": "0x0000000000000000000000000000000000000000",
        "type": "eip1559",
        "value": 0n,
      }
    `)
  })

  test('args: gas', async () => {
    const { transaction } = await Actions.transaction.fill(client, {
      account,
      data: '0xdeadbeef',
      gas: 50_000n,
      to: '0x0000000000000000000000000000000000000000',
    })
    expect(transaction.gas).toBe(50_000n)
  })

  test('args: gasPrice', async () => {
    const { transaction } = await Actions.transaction.fill(client, {
      account,
      data: '0xdeadbeef',
      gasPrice: 20_000_000_000n,
      to: '0x0000000000000000000000000000000000000000',
      type: 'legacy',
    })
    expect(transaction.gasPrice).toBe(20_000_000_000n)
  })

  test('args: maxFeePerGas', async () => {
    const { transaction } = await Actions.transaction.fill(client, {
      account,
      data: '0xdeadbeef',
      maxFeePerGas: 50_000_000_000n,
      to: '0x0000000000000000000000000000000000000000',
    })
    expect(transaction.maxFeePerGas).toBe(50_000_000_000n)
  })

  test('args: maxPriorityFeePerGas', async () => {
    const { transaction } = await Actions.transaction.fill(client, {
      account,
      data: '0xdeadbeef',
      maxFeePerGas: 50_000_000_000n,
      maxPriorityFeePerGas: 2_000_000_000n,
      to: '0x0000000000000000000000000000000000000000',
    })
    expect(transaction.maxPriorityFeePerGas).toBe(2_000_000_000n)
  })

  test('args: nonce', async () => {
    const { transaction } = await Actions.transaction.fill(client, {
      account,
      data: '0xdeadbeef',
      nonce: 1000,
      to: '0x0000000000000000000000000000000000000000',
    })
    expect(transaction.nonce).toBe(1000n)
  })
})

test('args: nonceManager', async () => {
  const nonceManager = NonceManager.from({ source: NonceManager.jsonRpc() })
  const base = await nonceManager.get({ address: account, chainId: 1, client })

  const { transaction } = await Actions.transaction.fill(client, {
    account,
    data: '0xdeadbeef',
    nonceManager,
    to: '0x0000000000000000000000000000000000000000',
  })

  expect(transaction.nonce).toBe(BigInt(base))
})

test('args: account object with nonceManager and chain', async () => {
  const nonceManager = NonceManager.from({ source: NonceManager.jsonRpc() })
  const base = await nonceManager.get({ address: account, chainId: 1, client })

  const { transaction } = await Actions.transaction.fill(client, {
    account: Account.from(account),
    chain,
    data: '0xdeadbeef',
    nonceManager,
    to: '0x0000000000000000000000000000000000000000',
  })

  expect(transaction.nonce).toBe(BigInt(base))
})

test('behavior: nonceManager not used without account', async () => {
  const nonceManager = NonceManager.from({ source: NonceManager.jsonRpc() })
  const { transaction } = await Actions.transaction.fill(client, {
    data: '0xdeadbeef',
    nonceManager,
    to: '0x0000000000000000000000000000000000000000',
  })
  expect(transaction.nonce).toBeTypeOf('bigint')
})

test('behavior: nonceManager not used with explicit nonce', async () => {
  const nonceManager = NonceManager.from({ source: NonceManager.jsonRpc() })
  const { transaction } = await Actions.transaction.fill(client, {
    account,
    data: '0xdeadbeef',
    nonce: 999,
    nonceManager,
    to: '0x0000000000000000000000000000000000000000',
  })
  expect(transaction.nonce).toBe(999n)
})

test('behavior: baseFeeMultiplier function (sync)', async () => {
  const baseline = await Actions.transaction.fill(client, {
    account,
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
  })

  const { transaction } = await Actions.transaction.fill(client, {
    account,
    chain: { ...chain, fees: { baseFeeMultiplier: () => 1.5 } },
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
  })

  expect(transaction.maxFeePerGas).toBeGreaterThan(
    baseline.transaction.maxFeePerGas!,
  )
})

test('behavior: baseFeeMultiplier function receives request', async () => {
  let received: unknown
  await Actions.transaction.fill(client, {
    account,
    chain: {
      ...chain,
      fees: {
        baseFeeMultiplier: ({ request }) => {
          received = request
          return 1.5
        },
      },
    },
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
    value: 1n,
  })

  expect(received).toMatchObject({
    from: account,
    to: '0x0000000000000000000000000000000000000000',
    value: 1n,
  })
})

test('behavior: baseFeeMultiplier value (integer)', async () => {
  const baseline = await Actions.transaction.fill(client, {
    account,
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
  })

  const { transaction } = await Actions.transaction.fill(client, {
    account,
    chain: { ...chain, fees: { baseFeeMultiplier: 2 } },
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
  })

  expect(transaction.maxFeePerGas).toBeGreaterThan(
    baseline.transaction.maxFeePerGas!,
  )
})

test('behavior: baseFeeMultiplier function (async)', async () => {
  const baseline = await Actions.transaction.fill(client, {
    account,
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
  })

  const { transaction } = await Actions.transaction.fill(client, {
    account,
    chain: { ...chain, fees: { baseFeeMultiplier: async () => 1.5 } },
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
  })

  expect(transaction.maxFeePerGas).toBeGreaterThan(
    baseline.transaction.maxFeePerGas!,
  )
})

test('behavior: fee multiplier not applied when maxFeePerGas provided', async () => {
  const { transaction } = await Actions.transaction.fill(client, {
    account,
    chain: { ...chain, fees: { baseFeeMultiplier: () => 1.5 } },
    data: '0xdeadbeef',
    maxFeePerGas: 50_000_000_000n,
    to: '0x0000000000000000000000000000000000000000',
  })
  expect(transaction.maxFeePerGas).toBe(50_000_000_000n)
})

test('behavior: fee multiplier not applied when gasPrice provided', async () => {
  const { transaction } = await Actions.transaction.fill(client, {
    account,
    chain: { ...chain, fees: { baseFeeMultiplier: () => 1.5 } },
    data: '0xdeadbeef',
    gasPrice: 20_000_000_000n,
    to: '0x0000000000000000000000000000000000000000',
    type: 'legacy',
  })
  expect(transaction.gasPrice).toBe(20_000_000_000n)
})

test('error: baseFeeMultiplier below 1', async () => {
  await expect(() =>
    Actions.transaction.fill(client, {
      account,
      chain: { ...chain, fees: { baseFeeMultiplier: 0.8 } },
      data: '0xdeadbeef',
      to: '0x0000000000000000000000000000000000000000',
    }),
  ).rejects.toThrowError('`baseFeeMultiplier` must be greater than 1.')
})

test('error: execution reverted maps to NodeError', async () => {
  const error = await Actions.transaction
    .fill(client, {
      account,
      data: ownerOfNonexistent,
      to: address,
    })
    .catch((error) => error)

  expect(error).toBeInstanceOf(NodeError.ExecutionRevertedError)
})

test('error: unrecognized node error rethrows original', async () => {
  // A blob versioned hash without a valid sidecar makes the node reject the
  // fill with an unrecognized `invalid params` error, which is rethrown as-is.
  const error = await Actions.transaction
    .fill(client, {
      account,
      blobVersionedHashes: [
        '0x0100000000000000000000000000000000000000000000000000000000000000',
      ],
      maxFeePerBlobGas: 100n,
      to: '0x0000000000000000000000000000000000000000',
    })
    .catch((error) => error)

  expect(error).not.toBeInstanceOf(NodeError.UnknownNodeError)
  expect(error.name).toBe('RpcResponse.InvalidParamsError')
})

test('behavior: encodes/decodes via chain schema when declared', async () => {
  const schemaChain = mainnet.extend({
    rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
    schema: {
      transaction: { fromRpc: z.Transaction.Pending },
      transactionRequest: {
        toRpc: z.TransactionRequest.TransactionRequestToRpc,
      },
    },
  })
  const schemaClient = Client.create({
    chain: schemaChain,
    transport: http(),
  })

  const { transaction } = await Actions.transaction.fill(schemaClient, {
    account,
    data: '0xdeadbeef',
    to: '0x0000000000000000000000000000000000000000',
  })

  expect(transaction.from).toBe(account.toLowerCase())
  expect(transaction.type).toBe('eip1559')
  if (transaction.type !== 'eip1559') return
  expect(transaction.maxFeePerGas).toBeTypeOf('bigint')
})

test('behavior: blob transaction fee preference', async () => {
  // The anvil fork cannot fill a blob (EIP-4844) transaction, so a real
  // ephemeral server returns a crafted `eth_fillTransaction` blob response to
  // exercise the `maxFeePerBlobGas` preference path.
  const tx = {
    accessList: [],
    blobVersionedHashes: [`0x01${'00'.repeat(31)}`],
    blockHash: `0x${'00'.repeat(32)}`,
    blockNumber: '0x1',
    chainId: '0x1',
    from: account,
    gas: '0x5208',
    hash: `0x${'11'.repeat(32)}`,
    input: '0xdeadbeef',
    maxFeePerBlobGas: '0x3b9aca00',
    maxFeePerGas: '0x77359400',
    maxPriorityFeePerGas: '0x3b9aca00',
    nonce: '0x0',
    r: `0x${'01'.repeat(32)}`,
    s: `0x${'02'.repeat(32)}`,
    to: '0x0000000000000000000000000000000000000000',
    transactionIndex: '0x0',
    type: '0x3',
    value: '0x0',
    yParity: '0x0',
  }
  const server = await Http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        result: {
          capabilities: { example: true },
          raw: '0x03deadbeef',
          tx,
        },
      }),
    )
  })
  try {
    const blobClient = Client.create({ transport: http(server.url) })
    const { capabilities, transaction } = await Actions.transaction.fill(
      blobClient,
      {
        account,
        data: '0xdeadbeef',
        maxFeePerBlobGas: 1n,
        to: '0x0000000000000000000000000000000000000000',
      },
    )
    expect(capabilities).toEqual({ example: true })
    expect(transaction.type).toBe('eip4844')
    expect(transaction.maxFeePerBlobGas).toBe(1n)
  } finally {
    await server.close()
  }
})

test('error: aborted request is not wrapped', async () => {
  const controller = new AbortController()
  controller.abort()
  await expect(() =>
    Actions.transaction.fill(client, {
      account,
      data: '0xdeadbeef',
      requestOptions: { signal: controller.signal },
      to: '0x0000000000000000000000000000000000000000',
    }),
  ).rejects.toThrowError()
})
