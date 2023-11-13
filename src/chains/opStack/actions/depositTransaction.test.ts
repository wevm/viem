import { beforeAll, describe, expect, test } from 'vitest'
import {
  setBlockNumber,
  testClient,
  walletClient,
  walletClientWithoutChain,
} from '~test/src/utils.js'
import { accounts } from '../../../../test/src/constants.js'
import {
  getTransactionReceipt,
  mine,
  setBalance,
} from '../../../actions/index.js'
import { decodeEventLog, encodePacked, parseEther } from '../../../index.js'
import { base } from '../../index.js'
import { portalAbi } from '../abis.js'
import { depositTransaction } from './depositTransaction.js'

beforeAll(async () => {
  await setBlockNumber(18136086n)
  await setBalance(testClient, {
    address: accounts[0].address,
    value: parseEther('10000'),
  })
})

describe('json-rpc accounts (anvil mainnet)', () => {
  test('default', async () => {
    const hash = await depositTransaction(walletClient, {
      account: accounts[0].address,
      gas: 21000n,
      targetChain: base,
      to: accounts[0].address,
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
      data: '0xdeadbeef',
      gas: 21100n,
      targetChain: base,
      to: accounts[0].address,
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

  test('args: dataSuffix', async () => {
    const hash = await depositTransaction(walletClient, {
      account: accounts[0].address,
      data: '0xdeadbeef',
      dataSuffix: '0xdeadbeef',
      gas: 21200n,
      targetChain: base,
      to: accounts[0].address,
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
        [0n, 0n, 21200n, false, '0xdeadbeefdeadbeef'],
      ),
    )
  })

  test('args: gas', async () => {
    const hash = await depositTransaction(walletClient, {
      account: accounts[0].address,
      gas: 69420n,
      targetChain: base,
      to: accounts[0].address,
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

  test('args: portalAddress', async () => {
    const hash = await depositTransaction(walletClient, {
      account: accounts[0].address,
      gas: 21000n,
      portalAddress: base.contracts.portal[1].address,
      to: accounts[0].address,
    })
    expect(hash).toBeDefined()
  })

  test('args: value', async () => {
    const hash = await depositTransaction(walletClient, {
      account: accounts[0].address,
      gas: 21000n,
      targetChain: base,
      to: accounts[0].address,
      value: 1n,
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
      gas: 21000n,
      chain: null,
      targetChain: base,
      to: accounts[0].address,
    })
    expect(hash).toBeDefined()
  })
})
