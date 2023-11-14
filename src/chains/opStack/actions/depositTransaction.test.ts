import { beforeAll, describe, expect, test } from 'vitest'
import { accounts } from '~test/src/constants.js'
import {
  setBlockNumber,
  testClient,
  walletClient,
  walletClientWithoutChain,
} from '~test/src/utils.js'

import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import {
  getTransactionReceipt,
  mine,
  setBalance,
  waitForTransactionReceipt,
} from '../../../actions/index.js'
import {
  http,
  createClient,
  decodeEventLog,
  encodePacked,
  parseEther,
} from '../../../index.js'
import { base, baseSepolia, sepolia } from '../../index.js'
import { portalAbi } from '../abis.js'
import { depositTransaction } from './depositTransaction.js'
import { prepareDepositTransaction } from './prepareDepositTransaction.js'

beforeAll(async () => {
  await setBlockNumber(18136086n)
  await setBalance(testClient, {
    address: accounts[0].address,
    value: parseEther('10000'),
  })
})

describe('json-rpc accounts', () => {
  test('default', async () => {
    const hash = await depositTransaction(walletClient, {
      account: accounts[0].address,
      args: { gas: 21000n, to: accounts[0].address },
      targetChain: base,
    })
    expect(hash).toBeDefined()

    await mine(testClient, { blocks: 1 })

    const receipt = await getTransactionReceipt(walletClient, {
      hash,
    })
    const log = decodeEventLog({
      abi: portalAbi,
      eventName: 'TransactionDeposited',
      ...receipt.logs[0],
    })
    expect(log.args.opaqueData).toEqual(
      encodePacked(
        ['uint', 'uint', 'uint64', 'bool', 'bytes'],
        [0n, 0n, 21000n, false, '0x'],
      ),
    )
  })

  test('args: data', async () => {
    const hash = await depositTransaction(walletClient, {
      account: accounts[0].address,
      args: { data: '0xdeadbeef', gas: 21100n, to: accounts[0].address },
      targetChain: base,
    })
    expect(hash).toBeDefined()

    await mine(testClient, { blocks: 1 })

    const receipt = await getTransactionReceipt(walletClient, {
      hash,
    })
    const log = decodeEventLog({
      abi: portalAbi,
      eventName: 'TransactionDeposited',
      ...receipt.logs[0],
    })
    expect(log.args.opaqueData).toEqual(
      encodePacked(
        ['uint', 'uint', 'uint64', 'bool', 'bytes'],
        [0n, 0n, 21100n, false, '0xdeadbeef'],
      ),
    )
  })

  test('args: gas', async () => {
    const hash = await depositTransaction(walletClient, {
      account: accounts[0].address,
      args: {
        gas: 69420n,
        to: accounts[0].address,
      },
      targetChain: base,
    })
    expect(hash).toBeDefined()

    await mine(testClient, { blocks: 1 })

    const receipt = await getTransactionReceipt(walletClient, {
      hash,
    })
    const log = decodeEventLog({
      abi: portalAbi,
      eventName: 'TransactionDeposited',
      ...receipt.logs[0],
    })
    expect(log.args.opaqueData).toEqual(
      encodePacked(
        ['uint', 'uint', 'uint64', 'bool', 'bytes'],
        [0n, 0n, 69420n, false, '0x'],
      ),
    )
  })

  test('args: isCreation', async () => {
    const hash = await depositTransaction(walletClient, {
      account: accounts[0].address,
      args: {
        data: '0xdeadbeef',
        gas: 69_420n,
        isCreation: true,
      },
      targetChain: base,
    })
    expect(hash).toBeDefined()

    await mine(testClient, { blocks: 1 })

    const receipt = await getTransactionReceipt(walletClient, {
      hash,
    })
    const log = decodeEventLog({
      abi: portalAbi,
      eventName: 'TransactionDeposited',
      ...receipt.logs[0],
    })
    expect(log.args.opaqueData).toEqual(
      encodePacked(
        ['uint', 'uint', 'uint64', 'bool', 'bytes'],
        [0n, 0n, 69420n, true, '0xdeadbeef'],
      ),
    )
  })

  test('args: portalAddress', async () => {
    const hash = await depositTransaction(walletClient, {
      account: accounts[0].address,
      args: {
        gas: 21000n,
        to: accounts[0].address,
      },
      portalAddress: base.contracts.portal[1].address,
    })
    expect(hash).toBeDefined()
  })

  test('args: value', async () => {
    const hash = await depositTransaction(walletClient, {
      account: accounts[0].address,
      args: {
        gas: 21000n,
        to: accounts[0].address,
        value: 1n,
      },
      targetChain: base,
    })
    expect(hash).toBeDefined()

    await mine(testClient, { blocks: 1 })

    const receipt = await getTransactionReceipt(walletClient, {
      hash,
    })
    const log = decodeEventLog({
      abi: portalAbi,
      eventName: 'TransactionDeposited',
      ...receipt.logs[0],
    })
    expect(log.args.opaqueData).toEqual(
      encodePacked(
        ['uint', 'uint', 'uint64', 'bool', 'bytes'],
        [0n, 1n, 21000n, false, '0x'],
      ),
    )
  })

  test('args: nullish chain', async () => {
    const hash = await depositTransaction(walletClientWithoutChain, {
      account: accounts[0].address,
      args: { gas: 21000n, to: accounts[0].address },
      chain: null,
      targetChain: base,
    })
    expect(hash).toBeDefined()
  })
})

test.skip(
  'e2e (sepolia)',
  async () => {
    const account = privateKeyToAccount(
      process.env.VITE_ACCOUNT_PRIVATE_KEY as `0x${string}`,
    )

    const client_baseSepolia = createClient({
      chain: baseSepolia,
      transport: http(),
    })
    const client_sepolia = createClient({
      account,
      chain: sepolia,
      transport: http('https://ethereum-sepolia.publicnode.com'),
    })

    const request = await prepareDepositTransaction(client_baseSepolia, {
      to: account.address,
      value: 1n,
    })

    const hash = await depositTransaction(client_sepolia, request)
    expect(hash).toBeDefined()

    const receipt = await waitForTransactionReceipt(client_sepolia, {
      hash,
    })
    const log = decodeEventLog({
      abi: portalAbi,
      eventName: 'TransactionDeposited',
      ...receipt.logs[0],
    })
    expect(log.args.opaqueData).toEqual(
      encodePacked(
        ['uint', 'uint', 'uint64', 'bool', 'bytes'],
        [0n, 1n, 21_000n, false, '0x'],
      ),
    )
  },
  { timeout: 60000 },
)
