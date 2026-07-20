import { Value } from 'ox'
import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'
import { client as tokenClient, holder, usdc } from '~test/token.js'
import { describe, expect, test } from 'vitest'

import { Client, http } from 'viem'

import { publicActions } from './public.js'

const { address, blockNumber } = await contract.deploy(
  anvil.getClient(anvil.mainnet),
  {
    bytecode: generated.Erc721.bytecode.object,
  },
)

const transactionHash =
  '0xa94e96a83d0c8ec8726d5393b832f2973bdb16249f8c84b01672b5a150010836'

test('decorates a client with public actions', async () => {
  const client = anvil.getClient(anvil.mainnet).extend(publicActions())
  expect(
    (
      await client.call({
        data: '0x06fdde03',
        to: address,
      })
    ).data,
  ).toBeDefined()
  expect(await client.fee.estimateMaxPriorityFeePerGas()).toBeTypeOf('bigint')
  expect(
    await client.address.getBalance({
      address: '0xC02aaa39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    }),
  ).toBeTypeOf('bigint')
  expect((await client.block.get()).number).toBeTypeOf('bigint')
  expect(typeof (await client.block.getNumber())).toBe('bigint')
  expect(await client.fee.getBlobBaseFee()).toBeTypeOf('bigint')
  expect(await client.block.getTransactionCount()).toBeTypeOf('number')
  expect(await client.chains.getId()).toBe(1)
  expect(
    await client.address.getCode({
      address,
    }),
  ).toMatch(/^0x60/)
  expect(
    await client.address.getDelegation({
      address: constants.accounts[0].address,
    }),
  ).toBeUndefined()
  expect(
    (
      await client.address.getProof({
        address,
        storageKeys: [
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        ],
      })
    ).accountProof.length,
  ).toBeGreaterThan(0)
  expect(
    (
      await client.fee.getHistory({
        blockCount: 4,
        rewardPercentiles: [25, 75],
      })
    ).oldestBlock,
  ).toBeTypeOf('bigint')
  expect(await client.fee.getGasPrice()).toBeTypeOf('bigint')
  expect(await client.event.getLogs({ address })).toBeInstanceOf(Array)
  expect(await client.block.getReceipts({ blockNumber })).toHaveLength(1)
  expect(
    await client.address.getStorageAt({
      address,
      slot: '0x0',
    }),
  ).toBeDefined()
  expect(
    await client.address.getTransactionCount({
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
    }),
  ).toBeTypeOf('number')
  const fees = await client.fee.estimateFeesPerGas()
  expect(fees.maxFeePerGas).toBeTypeOf('bigint')
  expect(fees.maxPriorityFeePerGas).toBeTypeOf('bigint')
})

test('calls contract actions through the decorator', async () => {
  const client = anvil.getClient(anvil.mainnet).extend(publicActions())

  expect(
    await client.contract.read({
      abi: generated.Erc721.abi,
      address,
      functionName: 'name',
    }),
  ).toMatchInlineSnapshot(`"wagmi"`)
  expect(
    await client.contract.estimateGas({
      abi: generated.Erc721.abi,
      account: constants.accounts[0].address,
      address,
      functionName: 'mint',
    }),
  ).toBeGreaterThan(0n)
  expect(
    (
      await client.contract.simulate({
        abi: generated.Erc721.abi,
        account: constants.accounts[0].address,
        address,
        functionName: 'mint',
      })
    ).request.functionName,
  ).toMatchInlineSnapshot(`"mint"`)
  expect(
    await client.contract.getLogs({
      abi: generated.Events.abi,
      address,
      eventName: 'Transfer',
      fromBlock: blockNumber,
    }),
  ).toMatchInlineSnapshot(`[]`)
  await expect(client.contract.getEip712Domain({ address })).rejects.toThrow(
    'reverted',
  )
})

test('calls filter actions through the decorator', async () => {
  const client = anvil.getClient(anvil.mainnet).extend(publicActions())
  const filter = await client.event.createFilter({ address })

  expect(await client.filter.getLogs({ filter })).toMatchInlineSnapshot(`[]`)
  expect(await client.filter.uninstall({ filter })).toMatchInlineSnapshot(
    `true`,
  )
})

test('calls transaction actions through the decorator', async () => {
  const client = anvil.getClient(anvil.mainnet).extend(publicActions())
  const request = {
    account: constants.accounts[0].address,
    to: constants.accounts[1].address,
    value: 1n,
  } as const

  expect(
    (await client.transaction.createAccessList(request)).gasUsed,
  ).toBeTypeOf('bigint')
  expect(await client.transaction.estimateGas(request)).toBeTypeOf('bigint')
  expect((await client.transaction.fill(request)).raw).toMatch(/^0x/)
  expect((await client.transaction.prepare(request)).request.gas).toBeTypeOf(
    'bigint',
  )
  expect((await client.transaction.get({ hash: transactionHash })).hash).toBe(
    transactionHash,
  )
  expect(
    await client.transaction.getConfirmations({ hash: transactionHash }),
  ).toBeGreaterThan(0n)
  expect(await client.transaction.getRaw({ hash: transactionHash })).toMatch(
    /^0x/,
  )
  expect(
    (await client.transaction.getReceipt({ hash: transactionHash })).status,
  ).toMatchInlineSnapshot(`"success"`)
  const watcher = client.transaction.waitForReceipt({ hash: transactionHash })
  expect((await watcher.receipt).status).toMatchInlineSnapshot(`"success"`)
})

test('starts watchers through the decorator', () => {
  const client = anvil.getClient(anvil.mainnet).extend(publicActions())
  const blocks = client.block.watch()
  const blockNumbers = client.block.watchNumber()
  const pending = client.transaction.watchPending()

  const methods = [
    typeof blocks.onBlock,
    typeof blockNumbers.onBlockNumber,
    typeof pending.onTransactions,
  ]

  blocks.off()
  blockNumbers.off()
  pending.off()

  expect(methods).toMatchInlineSnapshot(`
    [
      "function",
      "function",
      "function",
    ]
  `)
})

test('calls ENS actions through the decorator', async () => {
  const client = Client.create({
    transport: http('http://127.0.0.1:0'),
  }).extend(publicActions())
  const error = 'Client chain not configured.'

  await expect(client.ens.getAvatar({ name: 'example.eth' })).rejects.toThrow(
    error,
  )
  await expect(
    client.ens.getName({ address: constants.accounts[0].address }),
  ).rejects.toThrow(error)
  await expect(
    client.ens.getText({ key: 'url', name: 'example.eth' }),
  ).rejects.toThrow(error)
})

describe('token', () => {
  const client = tokenClient.extend(publicActions())

  test('attaches read token actions', () => {
    expect(typeof client.token.getAllowance).toBe('function')
    expect(typeof client.token.getBalance).toBe('function')
    expect(typeof client.token.getMetadata).toBe('function')
    expect(typeof client.token.getTotalSupply).toBe('function')
  })

  describe('getBalance', () => {
    test('default: by token symbol', async () => {
      const balance = await client.token.getBalance({
        token: 'usdc',
        account: holder,
      })
      expect(balance.amount).toBeTypeOf('bigint')
      expect(balance.formatted).toBe(Value.format(balance.amount, 6))
    })

    test('by token address', async () => {
      const balance = await client.token.getBalance({
        token: usdc,
        account: holder,
      })
      expect(balance.amount).toBeTypeOf('bigint')
      expect(balance.formatted).toBe(Value.format(balance.amount, 6))
    })

    test('call', () => {
      expect(
        client.token.getBalance.call({ token: usdc, account: holder }),
      ).toMatchObject({ functionName: 'balanceOf', to: usdc })
    })
  })

  describe('getAllowance', () => {
    test('default', async () => {
      const spender = constants.accounts[0].address
      expect(
        await client.token.getAllowance({
          account: holder,
          spender,
          token: usdc,
        }),
      ).toMatchInlineSnapshot(`
        {
          "amount": 0n,
          "decimals": 6,
          "formatted": "0",
        }
      `)
      expect(
        client.token.getAllowance.call({
          account: holder,
          spender,
          token: usdc,
        }),
      ).toMatchObject({ functionName: 'allowance', to: usdc })
    })
  })

  describe('getMetadata', () => {
    test('default: by token symbol', async () => {
      const metadata = await client.token.getMetadata({ token: 'usdc' })
      expect(metadata).toMatchInlineSnapshot(`
        {
          "decimals": 6,
          "name": "USD Coin",
          "symbol": "USDC",
        }
      `)
    })
  })

  describe('getTotalSupply', () => {
    test('default: by token symbol', async () => {
      const totalSupply = await client.token.getTotalSupply({ token: 'usdc' })
      expect(totalSupply.amount).toBeTypeOf('bigint')
      expect(totalSupply.amount).toBeGreaterThan(0n)
      expect(totalSupply.formatted).toBe(Value.format(totalSupply.amount, 6))
    })

    test('call', () => {
      expect(client.token.getTotalSupply.call({ token: usdc })).toMatchObject({
        functionName: 'totalSupply',
        to: usdc,
      })
    })
  })
})
