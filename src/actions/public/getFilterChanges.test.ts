import type { Address } from 'abitype'
import {
  assertType,
  beforeAll,
  describe,
  expect,
  expectTypeOf,
  test,
} from 'vitest'

import { ERC20InvalidTransferEvent } from '~test/contracts/generated.js'
import { usdcContractConfig } from '~test/src/abis.js'
import { accounts, address } from '~test/src/constants.js'
import {
  deployErc20InvalidTransferEvent,
  publicClient,
  testClient,
  walletClient,
} from '~test/src/utils.js'
import type { Log } from '../../types/log.js'
import type { Hash } from '../../types/misc.js'
import { getAddress } from '../../utils/address/getAddress.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { impersonateAccount } from '../test/impersonateAccount.js'
import { mine } from '../test/mine.js'
import { setBalance } from '../test/setBalance.js'
import { stopImpersonatingAccount } from '../test/stopImpersonatingAccount.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import { writeContract } from '../wallet/writeContract.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { createBlockFilter } from './createBlockFilter.js'
import { createContractEventFilter } from './createContractEventFilter.js'
import { createEventFilter } from './createEventFilter.js'
import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'
import { getFilterChanges } from './getFilterChanges.js'

const event = {
  default: {
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  approve: {
    type: 'event',
    name: 'Approval',
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
  },
  invalid: {
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: false,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  unnamed: {
    inputs: [
      {
        indexed: true,
        type: 'address',
      },
      {
        indexed: true,
        type: 'address',
      },
      {
        indexed: false,
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
} as const

beforeAll(async () => {
  await impersonateAccount(testClient, {
    address: address.vitalik,
  })
  await impersonateAccount(testClient, {
    address: address.usdcHolder,
  })
  await setBalance(testClient, {
    address: address.usdcHolder,
    value: 10000000000000000000000n,
  })

  return async () => {
    await stopImpersonatingAccount(testClient, {
      address: address.vitalik,
    })
    await stopImpersonatingAccount(testClient, {
      address: address.usdcHolder,
    })
  }
})

test('default', async () => {
  const filter = await createPendingTransactionFilter(publicClient)
  expect(
    await getFilterChanges(publicClient, { filter }),
  ).toMatchInlineSnapshot('[]')
})

test('pending txns', async () => {
  const filter = await createPendingTransactionFilter(publicClient)

  await sendTransaction(walletClient, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await sendTransaction(walletClient, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })

  let hashes = await getFilterChanges(publicClient, { filter })
  assertType<Hash[]>(hashes)
  expect(hashes.length).toBe(2)

  mine(testClient, { blocks: 1 })

  hashes = await getFilterChanges(publicClient, { filter })
  expect(hashes.length).toBe(0)

  await sendTransaction(walletClient, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })

  hashes = await getFilterChanges(publicClient, { filter })
  expect(hashes.length).toBe(1)
})

test('new blocks', async () => {
  const filter = await createBlockFilter(publicClient)

  await mine(testClient, { blocks: 2 })

  let hashes = await getFilterChanges(publicClient, { filter })
  assertType<Hash[]>(hashes)
  expect(hashes.length).toBe(2)

  hashes = await getFilterChanges(publicClient, { filter })
  expect(hashes.length).toBe(0)

  await mine(testClient, { blocks: 1 })

  hashes = await getFilterChanges(publicClient, { filter })
  expect(hashes.length).toBe(1)
})

describe('contract events', () => {
  test('no args', async () => {
    const filter = await createContractEventFilter(publicClient, {
      abi: usdcContractConfig.abi,
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.usdcHolder,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const logs = await getFilterChanges(publicClient, {
      filter,
    })

    assertType<
      Log<
        bigint,
        number,
        boolean,
        undefined,
        false,
        typeof usdcContractConfig.abi
      >[]
    >(logs)
    expect(logs.length).toBe(3)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
    expect(logs[1].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(logs[1].eventName).toEqual('Transfer')
    expect(logs[2].args).toEqual({
      owner: getAddress(address.vitalik),
      spender: getAddress(address.vitalik),
      value: 1n,
    })
    expect(logs[2].eventName).toEqual('Approval')
  })

  test('args: eventName', async () => {
    const filter = await createContractEventFilter(publicClient, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.usdcHolder,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const logs = await getFilterChanges(publicClient, { filter })
    assertType<
      Log<
        bigint,
        number,
        boolean,
        undefined,
        false,
        typeof usdcContractConfig.abi,
        'Transfer'
      >[]
    >(logs)
    expect(logs.length).toBe(2)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
    expect(logs[1].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(logs[1].eventName).toEqual('Transfer')
  })

  test('args: fromBlock/toBlock', async () => {
    const filter = await createContractEventFilter(publicClient, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
    })

    const logs = await getFilterChanges(publicClient, { filter })
    assertType<
      Log<
        bigint,
        number,
        boolean,
        undefined,
        false,
        typeof usdcContractConfig.abi,
        'Transfer'
      >[]
    >(logs)
    expect(logs.length).toBe(1056)
  })

  test('args: strict', async () => {
    const filter = await createContractEventFilter(publicClient, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
      strict: true,
    })

    const logs = await getFilterChanges(publicClient, { filter })
    assertType<
      Log<
        bigint,
        number,
        boolean,
        undefined,
        true,
        typeof usdcContractConfig.abi,
        'Transfer'
      >[]
    >(logs)
    expect(logs.length).toBe(783)
  })

  test('args: singular `from`', async () => {
    const filter = await createContractEventFilter(publicClient, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      args: {
        from: address.vitalik,
      },
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.usdcHolder,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const logs = await getFilterChanges(publicClient, { filter })
    assertType<
      Log<
        bigint,
        number,
        boolean,
        undefined,
        false,
        typeof usdcContractConfig.abi,
        'Transfer'
      >[]
    >(logs)
    expect(logs.length).toBe(1)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
  })

  test('args: multiple `from`', async () => {
    const filter = await createContractEventFilter(publicClient, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      args: {
        from: [address.vitalik, address.usdcHolder],
      },
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.usdcHolder,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const logs = await getFilterChanges(publicClient, { filter })
    assertType<
      Log<
        bigint,
        number,
        boolean,
        undefined,
        false,
        typeof usdcContractConfig.abi,
        'Transfer'
      >[]
    >(logs)
    expect(logs.length).toBe(2)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
    expect(logs[1].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(logs[1].eventName).toEqual('Transfer')
  })

  test('args: singular `to`', async () => {
    const filter = await createContractEventFilter(publicClient, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      args: {
        to: accounts[0].address,
      },
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.usdcHolder,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const logs = await getFilterChanges(publicClient, { filter })
    assertType<
      Log<
        bigint,
        number,
        boolean,
        undefined,
        false,
        typeof usdcContractConfig.abi,
        'Transfer'
      >[]
    >(logs)
    expect(logs.length).toBe(1)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
  })

  test('args: multiple `to`', async () => {
    const filter = await createContractEventFilter(publicClient, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      args: {
        to: [accounts[0].address, accounts[1].address],
      },
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.usdcHolder,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const logs = await getFilterChanges(publicClient, { filter })
    assertType<
      Log<
        bigint,
        number,
        boolean,
        undefined,
        false,
        typeof usdcContractConfig.abi,
        'Transfer'
      >[]
    >(logs)
    expect(logs.length).toBe(2)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
    expect(logs[1].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(logs[1].eventName).toEqual('Transfer')
  })

  describe('args: strict', () => {
    test('indexed params mismatch', async () => {
      const { contractAddress } = await deployErc20InvalidTransferEvent()

      const strictFilter = await createContractEventFilter(publicClient, {
        abi: usdcContractConfig.abi,
        strict: true,
      })
      const looseFilter = await createContractEventFilter(publicClient, {
        abi: usdcContractConfig.abi,
      })

      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(walletClient, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(walletClient, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        account: address.vitalik,
      })
      await mine(testClient, { blocks: 1 })

      const strictLogs = await getFilterChanges(publicClient, {
        filter: strictFilter,
      })
      const looseLogs = await getFilterChanges(publicClient, {
        filter: looseFilter,
      })
      expect(strictLogs.length).toBe(1)
      expect(looseLogs.length).toBe(3)
    })

    test('non-indexed params mismatch', async () => {
      const { contractAddress } = await deployErc20InvalidTransferEvent()

      const strictFilter = await createContractEventFilter(publicClient, {
        abi: ERC20InvalidTransferEvent.abi,
        strict: true,
      })
      const looseFilter = await createContractEventFilter(publicClient, {
        abi: ERC20InvalidTransferEvent.abi,
      })

      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(walletClient, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(walletClient, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        account: address.vitalik,
      })
      await mine(testClient, { blocks: 1 })

      const strictLogs = await getFilterChanges(publicClient, {
        filter: strictFilter,
      })
      const looseLogs = await getFilterChanges(publicClient, {
        filter: looseFilter,
      })
      expect(strictLogs.length).toBe(2)
      expect(looseLogs.length).toBe(3)
    })
  })
})

describe('events', () => {
  test('no args', async () => {
    const filter = await createEventFilter(publicClient)

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.vitalik,
    })

    await mine(testClient, { blocks: 1 })

    let logs = await getFilterChanges(publicClient, { filter })
    assertType<Log[]>(logs)
    expect(logs.length).toBe(2)

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[2].address, 1n],
      account: address.vitalik,
    })

    await mine(testClient, { blocks: 1 })

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(1)
  })

  test('args: event', async () => {
    const filter = await createEventFilter(publicClient, {
      event: event.default,
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.vitalik,
    })

    await mine(testClient, { blocks: 1 })

    let logs = await getFilterChanges(publicClient, { filter })

    expectTypeOf(logs).toEqualTypeOf<
      Log<bigint, number, false, typeof event.default>[]
    >()
    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
    expectTypeOf(logs[0].args).toEqualTypeOf<{
      from?: Address
      to?: Address
      value?: bigint
    }>()

    expect(logs.length).toBe(2)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
    expect(logs[1].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(logs[1].eventName).toEqual('Transfer')

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[2].address, 1n],
      account: address.vitalik,
    })
    await mine(testClient, { blocks: 1 })

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(1)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[2].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
  })

  test('args: events', async () => {
    const filter = await createEventFilter(publicClient, {
      events: [event.default, event.approve],
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'approve',
      args: [accounts[1].address, 1n],
      account: address.vitalik,
    })

    await mine(testClient, { blocks: 1 })

    let logs = await getFilterChanges(publicClient, {
      filter,
    })

    expect(logs.length).toBe(2)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
    expect(logs[1].args).toEqual({
      owner: getAddress(address.vitalik),
      spender: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(logs[1].eventName).toEqual('Approval')

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)

    await writeContract(walletClient, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[2].address, 1n],
      account: address.vitalik,
    })
    await mine(testClient, { blocks: 1 })

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(1)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[2].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
  })

  test('args: fromBlock/toBlock', async () => {
    const filter = await createEventFilter(publicClient, {
      event: event.default,
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
    })

    let logs = await getFilterChanges(publicClient, { filter })
    assertType<Log<bigint, number, boolean, typeof event.default>[]>(logs)
    expect(logs.length).toBe(1056)
    expect(logs[0].args).toEqual({
      from: '0x00000000003b3cc22aF3aE1EAc0440BcEe416B40',
      to: '0x393ADf60012809316659Af13A3117ec22D093a38',
      value: 1162592016924672n,
    })
    expect(logs[0].eventName).toEqual('Transfer')

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)
  })

  test('args: strict = true (named)', async () => {
    const filter = await createEventFilter(publicClient, {
      event: event.default,
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
      strict: true,
    })

    let logs = await getFilterChanges(publicClient, { filter })

    assertType<Log<bigint, number, boolean, typeof event.default, true>[]>(logs)

    expect(logs.length).toBe(783)

    expectTypeOf(logs[0].args).toEqualTypeOf<{
      from: Address
      to: Address
      value: bigint
    }>()
    expect(logs[0].args).toEqual({
      from: '0x00000000003b3cc22aF3aE1EAc0440BcEe416B40',
      to: '0x393ADf60012809316659Af13A3117ec22D093a38',
      value: 1162592016924672n,
    })
    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
    expect(logs[0].eventName).toEqual('Transfer')

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)
  })

  test('args: strict = false (named)', async () => {
    const filter = await createEventFilter(publicClient, {
      event: event.default,
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
    })

    let logs = await getFilterChanges(publicClient, { filter })

    assertType<Log<bigint, number, boolean, typeof event.default, false>[]>(
      logs,
    )

    expect(logs.length).toBe(1056)

    expectTypeOf(logs[0].args).toEqualTypeOf<{
      from?: Address
      to?: Address
      value?: bigint
    }>()
    expect(logs[0].args).toEqual({
      from: '0x00000000003b3cc22aF3aE1EAc0440BcEe416B40',
      to: '0x393ADf60012809316659Af13A3117ec22D093a38',
      value: 1162592016924672n,
    })
    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
    expect(logs[0].eventName).toEqual('Transfer')

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)
  })

  test('args: strict = true (unnamed)', async () => {
    const filter = await createEventFilter(publicClient, {
      event: event.unnamed,
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
      strict: true,
    })

    let logs = await getFilterChanges(publicClient, { filter })
    assertType<Log<bigint, number, boolean, typeof event.unnamed, true>[]>(logs)

    expect(logs.length).toBe(783)

    expectTypeOf(logs[0].args).toEqualTypeOf<
      readonly [`0x${string}`, `0x${string}`, bigint]
    >()
    expect(logs[0].args).toEqual([
      '0x00000000003b3cc22aF3aE1EAc0440BcEe416B40',
      '0x393ADf60012809316659Af13A3117ec22D093a38',
      1162592016924672n,
    ])
    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
    expect(logs[0].eventName).toEqual('Transfer')

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)
  })

  test('args: strict = false (unnamed)', async () => {
    const filter = await createEventFilter(publicClient, {
      event: event.unnamed,
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
    })

    let logs = await getFilterChanges(publicClient, { filter })
    assertType<Log<bigint, number, boolean, typeof event.unnamed, false>[]>(
      logs,
    )

    expect(logs.length).toBe(1056)

    expectTypeOf(logs[0].args).toEqualTypeOf<
      | readonly []
      | readonly [`0x${string}`, `0x${string}`, bigint]
      | readonly [`0x${string}`, `0x${string}`]
      | readonly [`0x${string}`]
    >()
    expect(logs[0].args).toEqual([
      '0x00000000003b3cc22aF3aE1EAc0440BcEe416B40',
      '0x393ADf60012809316659Af13A3117ec22D093a38',
      1162592016924672n,
    ])

    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
    expect(logs[0].eventName).toEqual('Transfer')

    logs = await getFilterChanges(publicClient, { filter })
    expect(logs.length).toBe(0)
  })

  test('args: singular `from`', async () => {
    const namedFilter = await createEventFilter(publicClient, {
      event: event.default,
      args: {
        from: address.vitalik,
      },
    })
    const unnamedFilter = await createEventFilter(publicClient, {
      event: event.unnamed,
      args: [address.vitalik],
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.usdcHolder,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[2].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const namedLogs = await getFilterChanges(publicClient, {
      filter: namedFilter,
    })
    expect(namedLogs.length).toBe(2)
    expect(namedLogs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(namedLogs[0].eventName).toEqual('Transfer')
    expect(namedLogs[1].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[2].address),
      value: 1n,
    })
    expect(namedLogs[1].eventName).toEqual('Transfer')

    const unnamedLogs = await getFilterChanges(publicClient, {
      filter: unnamedFilter,
    })
    expect(unnamedLogs.length).toBe(2)
    expect(unnamedLogs.length).toBe(2)
    expect(unnamedLogs[0].args).toEqual([
      getAddress(address.vitalik),
      getAddress(accounts[1].address),
      1n,
    ])
    expect(unnamedLogs[0].eventName).toEqual('Transfer')
    expect(unnamedLogs[1].args).toEqual([
      getAddress(address.vitalik),
      getAddress(accounts[2].address),
      1n,
    ])
    expect(unnamedLogs[1].eventName).toEqual('Transfer')
  })

  test('args: multiple `from`', async () => {
    const namedFilter = await createEventFilter(publicClient, {
      event: event.default,
      args: {
        from: [address.usdcHolder, address.vitalik],
      },
    })
    const unnamedFilter = await createEventFilter(publicClient, {
      event: event.unnamed,
      args: [[address.usdcHolder, address.vitalik]],
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.usdcHolder,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const namedLogs = await getFilterChanges(publicClient, {
      filter: namedFilter,
    })
    expect(namedLogs.length).toBe(3)
    expect(namedLogs[0].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[0].address),
      value: 1n,
    })
    expect(namedLogs[0].eventName).toEqual('Transfer')
    expect(namedLogs[1].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(namedLogs[1].eventName).toEqual('Transfer')
    expect(namedLogs[2].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[1].address),
      value: 1n,
    })
    expect(namedLogs[2].eventName).toEqual('Transfer')

    const unnamedLogs = await getFilterChanges(publicClient, {
      filter: unnamedFilter,
    })
    expect(unnamedLogs.length).toBe(3)
    expect(unnamedLogs[0].args).toEqual([
      getAddress(address.usdcHolder),
      getAddress(accounts[0].address),
      1n,
    ])
    expect(unnamedLogs[0].eventName).toEqual('Transfer')
    expect(unnamedLogs[1].args).toEqual([
      getAddress(address.vitalik),
      getAddress(accounts[1].address),
      1n,
    ])
    expect(unnamedLogs[1].eventName).toEqual('Transfer')
    expect(unnamedLogs[2].args).toEqual([
      getAddress(address.vitalik),
      getAddress(accounts[1].address),
      1n,
    ])
    expect(unnamedLogs[2].eventName).toEqual('Transfer')
  })

  test('args: singular `to`', async () => {
    const namedFilter = await createEventFilter(publicClient, {
      event: event.default,
      args: {
        to: accounts[0].address,
      },
    })
    const unnamedFilter = await createEventFilter(publicClient, {
      event: event.unnamed,
      args: [null, accounts[0].address],
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.usdcHolder,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const namedLogs = await getFilterChanges(publicClient, {
      filter: namedFilter,
    })
    expect(namedLogs.length).toBe(1)
    expect(namedLogs[0].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[0].address),
      value: 1n,
    })

    const unnamedLogs = await getFilterChanges(publicClient, {
      filter: unnamedFilter,
    })
    expect(unnamedLogs.length).toBe(1)
    expect(unnamedLogs[0].args).toEqual([
      getAddress(address.usdcHolder),
      getAddress(accounts[0].address),
      1n,
    ])
  })

  test('args: multiple `to`', async () => {
    const namedFilter = await createEventFilter(publicClient, {
      event: event.default,
      args: {
        to: [accounts[0].address, accounts[1].address],
      },
    })
    const unnamedFilter = await createEventFilter(publicClient, {
      event: event.unnamed,
      args: [null, [accounts[0].address, accounts[1].address]],
    })

    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.usdcHolder,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(walletClient, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(testClient, { blocks: 1 })

    const namedLogs = await getFilterChanges(publicClient, {
      filter: namedFilter,
    })
    expect(namedLogs.length).toBe(3)
    expect(namedLogs[0].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[0].address),
      value: 1n,
    })

    const unnamedLogs = await getFilterChanges(publicClient, {
      filter: unnamedFilter,
    })
    expect(unnamedLogs.length).toBe(3)
    expect(unnamedLogs[0].args).toEqual([
      getAddress(address.usdcHolder),
      getAddress(accounts[0].address),
      1n,
    ])
  })

  describe('args: strict', () => {
    test('indexed params mismatch', async () => {
      const { contractAddress } = await deployErc20InvalidTransferEvent()

      const strictFilter = await createEventFilter(publicClient, {
        event: event.default,
        strict: true,
      })
      const looseFilter = await createEventFilter(publicClient, {
        event: event.default,
      })

      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(walletClient, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(walletClient, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        account: address.vitalik,
      })
      await mine(testClient, { blocks: 1 })

      const strictLogs = await getFilterChanges(publicClient, {
        filter: strictFilter,
      })
      const looseLogs = await getFilterChanges(publicClient, {
        filter: looseFilter,
      })
      expect(strictLogs.length).toBe(1)
      expect(looseLogs.length).toBe(3)
    })

    test('non-indexed params mismatch', async () => {
      const { contractAddress } = await deployErc20InvalidTransferEvent()

      const strictFilter = await createEventFilter(publicClient, {
        event: event.invalid,
        strict: true,
      })
      const looseFilter = await createEventFilter(publicClient, {
        event: event.invalid,
      })

      await writeContract(walletClient, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(walletClient, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(walletClient, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        account: address.vitalik,
      })
      await mine(testClient, { blocks: 1 })

      const strictLogs = await getFilterChanges(publicClient, {
        filter: strictFilter,
      })
      const looseLogs = await getFilterChanges(publicClient, {
        filter: looseFilter,
      })
      expect(strictLogs.length).toBe(2)
      expect(looseLogs.length).toBe(3)
    })
  })
})
