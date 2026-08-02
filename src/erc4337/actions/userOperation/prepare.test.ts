import { Abi, Hex, Value } from 'ox'
import { beforeAll, expect, test } from 'vitest'

import { Client as CoreClient, http } from 'viem'
import * as accountAbstraction from '~test/account-abstraction.js'
import * as anvil from '~test/anvil.js'
import { bundler } from '~test/bundler.js'
import * as constants from '~test/constants.js'
import { createServer } from '~test/http.js'
import * as BundlerClient from '../../BundlerClient.js'
import * as PaymasterClient from '../../PaymasterClient.js'
import * as Simple7702SmartAccount from '../../Simple7702SmartAccount.js'
import { UserOperationExecutionError } from '../../errors.js'
import { estimateGas } from './estimateGas.js'
import { prepare } from './prepare.js'

const executionClient = anvil.getClient(anvil.mainnet)
const recipient = constants.accounts[8].address
const abi = Abi.from(['function mint(uint256)'])
const fees = {
  maxFeePerGas: Value.fromGwei('15'),
  maxPriorityFeePerGas: Value.fromGwei('2'),
} as const

let account: Simple7702SmartAccount.Account
let client: BundlerClient.Client<
  undefined,
  Simple7702SmartAccount.Account,
  ReturnType<typeof http>,
  typeof executionClient
>

beforeAll(async () => {
  const [, , , , smartAccount] = await accountAbstraction.getSmartAccounts_08()
  if (!smartAccount) throw new Error('Simple7702 account not found.')
  account = smartAccount
  client = BundlerClient.create({
    account,
    client: executionClient,
    transport: http(bundler.rpcUrl.http),
  })
})

test('prepare: fills a v0.8 operation', async () => {
  const operation = await prepare(client, {
    calls: [
      { to: recipient, value: 1n },
      {
        abi,
        args: [9_842_733n],
        functionName: 'mint',
        to: recipient,
      },
    ],
    dataSuffix: '0xdeadbeef',
    ...fees,
  })
  const {
    authorization,
    callData,
    callGasLimit,
    nonce,
    paymasterPostOpGasLimit,
    paymasterVerificationGasLimit,
    preVerificationGas,
    verificationGasLimit,
    ...rest
  } = operation

  expect({
    ...rest,
    authorization: authorization && {
      ...authorization,
      address: null,
      nonce: null,
    },
    callData: {
      hasSuffix: callData.endsWith('deadbeef'),
      selector: callData.slice(0, 10),
    },
    nonce: nonce > 0n,
  }).toMatchInlineSnapshot(`
    {
      "authorization": {
        "address": null,
        "chainId": 1,
        "nonce": null,
        "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
        "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "yParity": 1,
      },
      "callData": {
        "hasSuffix": true,
        "selector": "0x34fcd5be",
      },
      "dataSuffix": "0xdeadbeef",
      "factory": "0x7702",
      "factoryData": "0x",
      "maxFeePerGas": 15000000000n,
      "maxPriorityFeePerGas": 2000000000n,
      "nonce": true,
      "sender": "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
    }
  `)
  expect({
    callGasLimit: callGasLimit > 0n,
    paymasterPostOpGasLimit,
    paymasterVerificationGasLimit,
    preVerificationGas: preVerificationGas > 0n,
    verificationGasLimit: verificationGasLimit > 0n,
  }).toMatchInlineSnapshot(`
    {
      "callGasLimit": true,
      "paymasterPostOpGasLimit": 0n,
      "paymasterVerificationGasLimit": 0n,
      "preVerificationGas": true,
      "verificationGasLimit": true,
    }
  `)
})

test('prepare: bound fee hook', async () => {
  const client = BundlerClient.create({
    account,
    client: executionClient,
    transport: http(bundler.rpcUrl.http),
    userOperation: {
      async estimateFeesPerGas() {
        return { maxFeePerGas: 123n, maxPriorityFeePerGas: 45n }
      },
    },
  })
  const operation = await client.userOperation.prepare({
    calls: [{ to: recipient }],
    parameters: ['fees'],
  })

  expect({
    maxFeePerGas: operation.maxFeePerGas,
    maxPriorityFeePerGas: operation.maxPriorityFeePerGas,
  }).toMatchInlineSnapshot(`
    {
      "maxFeePerGas": 123n,
      "maxPriorityFeePerGas": 45n,
    }
  `)
})

test('prepare: custom paymaster getData fallback', async () => {
  const context = { mode: 'fallback', validUntil: 3_735_928_600 }
  const paymaster = constants.accounts[6].address
  const server = await createServer((req, res) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      const { method, params } = JSON.parse(data)
      const [, entryPoint, chainId, receivedContext] = params
      if (
        method !== 'pm_getPaymasterData' ||
        entryPoint !== account.entryPoint.address ||
        chainId !== '0x1' ||
        receivedContext?.mode !== context.mode ||
        receivedContext?.validUntil !== context.validUntil
      ) {
        res.writeHead(500)
        res.end()
        return
      }

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          result: {
            paymaster,
            paymasterData: '0xfade',
            paymasterPostOpGasLimit: '0x6f',
            paymasterVerificationGasLimit: '0xde',
          },
        }),
      )
    })
  })

  try {
    const paymasterClient = PaymasterClient.create({
      transport: http(server.url),
    })
    const operation = await prepare(client, {
      calls: [{ to: recipient }],
      nonce: 0n,
      parameters: ['paymaster'],
      paymaster: { getData: paymasterClient.paymaster.getData },
      paymasterContext: context,
    })

    expect({
      paymaster: operation.paymaster,
      paymasterData: operation.paymasterData,
      paymasterPostOpGasLimit: operation.paymasterPostOpGasLimit,
      paymasterVerificationGasLimit: operation.paymasterVerificationGasLimit,
    }).toMatchInlineSnapshot(`
      {
        "paymaster": "0x976ea74026e726554db657fa54763abd0c3a0aa9",
        "paymasterData": "0xfade",
        "paymasterPostOpGasLimit": 111n,
        "paymasterVerificationGasLimit": 222n,
      }
    `)
  } finally {
    await server.close()
  }
})

test('prepare: custom paymaster stub and final data', async () => {
  const stubPaymaster = constants.accounts[6].address
  const finalPaymaster = constants.accounts[7].address
  const server = await createServer((req, res) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      const { method, params } = JSON.parse(data)
      const [operation, entryPoint, chainId, context] = params
      if (entryPoint !== account.entryPoint.address || chainId !== '0x1') {
        res.writeHead(500)
        res.end()
        return
      }

      if (method === 'pm_getPaymasterStubData') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            result: {
              isFinal: context.mode === 'final',
              paymaster: stubPaymaster,
              paymasterData: context.mode === 'final' ? '0xf1a1' : '0x57ab',
              paymasterPostOpGasLimit: '0x6f',
              paymasterVerificationGasLimit: '0xde',
              sponsor: { name: 'Viem Sugar Daddy' },
            },
          }),
        )
        return
      }

      if (
        method !== 'pm_getPaymasterData' ||
        context.mode !== 'continue' ||
        operation.paymaster !== stubPaymaster.toLowerCase() ||
        operation.paymasterData !== '0x57ab' ||
        operation.paymasterPostOpGasLimit !== '0x6f' ||
        operation.paymasterVerificationGasLimit !== '0xde'
      ) {
        res.writeHead(500)
        res.end()
        return
      }

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          result: {
            paymaster: finalPaymaster,
            paymasterData: '0xda7a',
            paymasterPostOpGasLimit: '0x14d',
            paymasterVerificationGasLimit: '0x1bc',
          },
        }),
      )
    })
  })

  try {
    const paymasterClient = PaymasterClient.create({
      transport: http(server.url),
    })
    const paymaster = {
      getData: paymasterClient.paymaster.getData,
      getStubData: paymasterClient.paymaster.getStubData,
    }
    const [continued, final] = await Promise.all([
      prepare(client, {
        calls: [{ to: recipient }],
        nonce: 0n,
        parameters: ['paymaster'],
        paymaster,
        paymasterContext: { mode: 'continue' },
      }),
      prepare(client, {
        calls: [{ to: recipient }],
        nonce: 0n,
        parameters: ['paymaster'],
        paymaster,
        paymasterContext: { mode: 'final' },
      }),
    ])

    expect([
      {
        paymaster: continued.paymaster,
        paymasterData: continued.paymasterData,
        paymasterPostOpGasLimit: continued.paymasterPostOpGasLimit,
        paymasterVerificationGasLimit: continued.paymasterVerificationGasLimit,
      },
      {
        paymaster: final.paymaster,
        paymasterData: final.paymasterData,
        paymasterPostOpGasLimit: final.paymasterPostOpGasLimit,
        paymasterVerificationGasLimit: final.paymasterVerificationGasLimit,
      },
    ]).toMatchInlineSnapshot(`
      [
        {
          "paymaster": "0x14dc79964da2c08b23698b3d3cc7ca32193d9955",
          "paymasterData": "0xda7a",
          "paymasterPostOpGasLimit": 333n,
          "paymasterVerificationGasLimit": 444n,
        },
        {
          "paymaster": "0x976ea74026e726554db657fa54763abd0c3a0aa9",
          "paymasterData": "0xf1a1",
          "paymasterPostOpGasLimit": 111n,
          "paymasterVerificationGasLimit": 222n,
        },
      ]
    `)
  } finally {
    await server.close()
  }
})

test('prepare: dataSuffix precedence', async () => {
  const executionClient = CoreClient.create({
    dataSuffix: { value: '0x1111' },
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  const inherited = BundlerClient.create({
    account,
    client: executionClient,
    transport: http(bundler.rpcUrl.http),
  })
  const configured = BundlerClient.create({
    account,
    client: executionClient,
    dataSuffix: '0x2222',
    transport: http(bundler.rpcUrl.http),
  })
  const calls = [{ to: recipient }] as const
  const encoded = await account.encodeCalls(calls)

  const [fromExecutionClient, fromBundlerClient, fromAction] =
    await Promise.all([
      prepare(inherited, { calls, parameters: [] }),
      prepare(configured, { calls, parameters: [] }),
      prepare(configured, {
        calls,
        dataSuffix: '0x3333',
        parameters: [],
      }),
    ])

  expect({
    action: fromAction.callData === Hex.concat(encoded, '0x3333'),
    bundlerClient: fromBundlerClient.callData === Hex.concat(encoded, '0x2222'),
    executionClient:
      fromExecutionClient.callData === Hex.concat(encoded, '0x1111'),
  }).toMatchInlineSnapshot(`
    {
      "action": true,
      "bundlerClient": true,
      "executionClient": true,
    }
  `)
})

test('prepare: merges partial account gas estimates', async () => {
  const operation = await prepare(client, {
    account: {
      ...account,
      userOperation: {
        async estimateGas() {
          return { verificationGasLimit: 1_000_000n }
        },
      },
    },
    calls: [{ to: recipient, value: 1n }],
    ...fees,
  })

  expect({
    callGasLimit: operation.callGasLimit > 0n,
    paymasterPostOpGasLimit: operation.paymasterPostOpGasLimit,
    paymasterVerificationGasLimit: operation.paymasterVerificationGasLimit,
    preVerificationGas: operation.preVerificationGas > 0n,
    verificationGasLimit: operation.verificationGasLimit,
  }).toMatchInlineSnapshot(`
    {
      "callGasLimit": true,
      "paymasterPostOpGasLimit": 0n,
      "paymasterVerificationGasLimit": 0n,
      "preVerificationGas": true,
      "verificationGasLimit": 1000000n,
    }
  `)
})

test('prepare: skips gas estimation when account fills split paymaster gas', async () => {
  const server = await createServer((_req, res) => {
    res.writeHead(500)
    res.end()
  })

  try {
    const client = BundlerClient.create({
      account,
      client: executionClient,
      transport: http(server.url),
    })
    const operation = await prepare(client, {
      account: {
        ...account,
        userOperation: {
          async estimateGas() {
            return {
              callGasLimit: 1_000_000n,
              paymasterPostOpGasLimit: 2_000_000n,
              paymasterVerificationGasLimit: 3_000_000n,
              preVerificationGas: 4_000_000n,
              verificationGasLimit: 5_000_000n,
            }
          },
        },
      },
      calls: [{ to: recipient, value: 1n }],
      paymaster: constants.accounts[7].address,
      ...fees,
    })

    expect({
      callGasLimit: operation.callGasLimit,
      paymaster: operation.paymaster,
      paymasterPostOpGasLimit: operation.paymasterPostOpGasLimit,
      paymasterVerificationGasLimit: operation.paymasterVerificationGasLimit,
      preVerificationGas: operation.preVerificationGas,
      verificationGasLimit: operation.verificationGasLimit,
    }).toMatchInlineSnapshot(`
      {
        "callGasLimit": 1000000n,
        "paymaster": "0x14dc79964da2c08b23698b3d3cc7ca32193d9955",
        "paymasterPostOpGasLimit": 2000000n,
        "paymasterVerificationGasLimit": 3000000n,
        "preVerificationGas": 4000000n,
        "verificationGasLimit": 5000000n,
      }
    `)
  } finally {
    await server.close()
  }
})

test('estimateGas: forwards state overrides', async () => {
  const gas = await estimateGas(client, {
    calls: [{ to: recipient, value: 1n }],
    stateOverride: {
      [account.address]: { balance: Value.fromEther('20000') },
    },
    ...fees,
  })

  expect({
    callGasLimit: gas.callGasLimit > 0n,
    preVerificationGas: gas.preVerificationGas > 0n,
    verificationGasLimit: gas.verificationGasLimit > 0n,
  }).toMatchInlineSnapshot(`
    {
      "callGasLimit": true,
      "preVerificationGas": true,
      "verificationGasLimit": true,
    }
  `)
})

test('estimateGas: maps Bundler errors', async () => {
  const error = await estimateGas(client, {
    calls: [{ to: recipient, value: Value.fromEther('1000000') }],
    ...fees,
  }).catch((error) => error)

  if (!(error instanceof UserOperationExecutionError)) throw error
  expect({ cause: error.cause.name, name: error.name }).toMatchInlineSnapshot(`
    {
      "cause": "ExecutionRevertedError",
      "name": "UserOperationExecutionError",
    }
  `)
})
