import type { Address } from 'abitype'
import {
  assertType,
  beforeAll,
  describe,
  expect,
  expectTypeOf,
  test,
} from 'vitest'

import { ERC20InvalidTransferEvent } from '~contracts/generated.js'
import { usdcContractConfig } from '~test/src/abis.js'
import { anvilMainnet } from '~test/src/anvil.js'
import { accounts, address } from '~test/src/constants.js'
import { deployErc20InvalidTransferEvent } from '~test/src/utils.js'
import type { Log } from '../../types/log.js'
import type { Hash } from '../../types/misc.js'
import { getAddress } from '../../utils/address/getAddress.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { impersonateAccount } from '../test/impersonateAccount.js'
import { mine } from '../test/mine.js'
import { setBalance } from '../test/setBalance.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import { writeContract } from '../wallet/writeContract.js'

import { createBlockFilter } from './createBlockFilter.js'
import { createContractEventFilter } from './createContractEventFilter.js'
import { createEventFilter } from './createEventFilter.js'
import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'
import { getFilterChanges } from './getFilterChanges.js'

const client = anvilMainnet.getClient()

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
  await impersonateAccount(client, {
    address: address.vitalik,
  })
  await impersonateAccount(client, {
    address: address.usdcHolder,
  })
  await setBalance(client, {
    address: address.usdcHolder,
    value: 10000000000000000000000n,
  })
})

test('default', async () => {
  const filter = await createPendingTransactionFilter(client)
  expect(await getFilterChanges(client, { filter })).toMatchInlineSnapshot('[]')
})

test('pending txns', async () => {
  const filter = await createPendingTransactionFilter(client)

  await sendTransaction(client, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await sendTransaction(client, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })

  let hashes = await getFilterChanges(client, { filter })
  assertType<Hash[]>(hashes)
  expect(hashes.length).toBe(2)

  mine(client, { blocks: 1 })

  hashes = await getFilterChanges(client, { filter })
  expect(hashes.length).toBe(0)

  await sendTransaction(client, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })

  hashes = await getFilterChanges(client, { filter })
  expect(hashes.length).toBe(1)
})

test('new blocks', async () => {
  const filter = await createBlockFilter(client)

  await mine(client, { blocks: 2 })

  let hashes = await getFilterChanges(client, { filter })
  assertType<Hash[]>(hashes)
  expect(hashes.length).toBe(2)

  hashes = await getFilterChanges(client, { filter })
  expect(hashes.length).toBe(0)

  await mine(client, { blocks: 1 })

  hashes = await getFilterChanges(client, { filter })
  expect(hashes.length).toBe(1)
})

describe('contract events', () => {
  test('no args', async () => {
    const filter = await createContractEventFilter(client, {
      abi: usdcContractConfig.abi,
    })

    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.usdcHolder,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(client, { blocks: 1 })

    const logs = await getFilterChanges(client, {
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
    const filter = await createContractEventFilter(client, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
    })

    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.usdcHolder,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(client, { blocks: 1 })

    const logs = await getFilterChanges(client, { filter })
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
    const filter = await createContractEventFilter(client, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
    })

    const logs = await getFilterChanges(client, { filter })
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
    expect(logs.length).toBe(973)
  })

  test('args: strict', async () => {
    const filter = await createContractEventFilter(client, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
      strict: true,
    })

    const logs = await getFilterChanges(client, { filter })
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
    expect(logs.length).toBe(958)
  })

  test('args: singular `from`', async () => {
    const filter = await createContractEventFilter(client, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      args: {
        from: address.vitalik,
      },
    })

    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.usdcHolder,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(client, { blocks: 1 })

    const logs = await getFilterChanges(client, { filter })
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
    const filter = await createContractEventFilter(client, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      args: {
        from: [address.vitalik, address.usdcHolder],
      },
    })

    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.usdcHolder,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(client, { blocks: 1 })

    const logs = await getFilterChanges(client, { filter })
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
    const filter = await createContractEventFilter(client, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      args: {
        to: accounts[0].address,
      },
    })

    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.usdcHolder,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(client, { blocks: 1 })

    const logs = await getFilterChanges(client, { filter })
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
    const filter = await createContractEventFilter(client, {
      abi: usdcContractConfig.abi,
      eventName: 'Transfer',
      args: {
        to: [accounts[0].address, accounts[1].address],
      },
    })

    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.usdcHolder,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(client, { blocks: 1 })

    const logs = await getFilterChanges(client, { filter })
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

      const strictFilter = await createContractEventFilter(client, {
        abi: usdcContractConfig.abi,
        strict: true,
      })
      const looseFilter = await createContractEventFilter(client, {
        abi: usdcContractConfig.abi,
      })

      await writeContract(client, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(client, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(client, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        account: address.vitalik,
      })
      await mine(client, { blocks: 1 })

      const strictLogs = await getFilterChanges(client, {
        filter: strictFilter,
      })
      const looseLogs = await getFilterChanges(client, {
        filter: looseFilter,
      })
      expect(strictLogs.length).toBe(1)
      expect(looseLogs.length).toBe(3)
    })

    test('non-indexed params mismatch', async () => {
      const { contractAddress } = await deployErc20InvalidTransferEvent()

      const strictFilter = await createContractEventFilter(client, {
        abi: ERC20InvalidTransferEvent.abi,
        strict: true,
      })
      const looseFilter = await createContractEventFilter(client, {
        abi: ERC20InvalidTransferEvent.abi,
      })

      await writeContract(client, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(client, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(client, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        account: address.vitalik,
      })
      await mine(client, { blocks: 1 })

      const strictLogs = await getFilterChanges(client, {
        filter: strictFilter,
      })
      const looseLogs = await getFilterChanges(client, {
        filter: looseFilter,
      })
      expect(strictLogs.length).toBe(2)
      expect(looseLogs.length).toBe(3)
    })
  })
})

describe('events', () => {
  test('no args', async () => {
    const filter = await createEventFilter(client)

    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.vitalik,
    })

    await mine(client, { blocks: 1 })

    let logs = await getFilterChanges(client, { filter })
    assertType<Log[]>(logs)
    expect(logs.length).toBe(2)

    logs = await getFilterChanges(client, { filter })
    expect(logs.length).toBe(0)

    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[2].address, 1n],
      account: address.vitalik,
    })

    await mine(client, { blocks: 1 })

    logs = await getFilterChanges(client, { filter })
    expect(logs.length).toBe(1)
  })

  test('args: event', async () => {
    const filter = await createEventFilter(client, {
      event: event.default,
    })

    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
      account: address.vitalik,
    })

    await mine(client, { blocks: 1 })

    let logs = await getFilterChanges(client, { filter })

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

    logs = await getFilterChanges(client, { filter })
    expect(logs.length).toBe(0)

    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[2].address, 1n],
      account: address.vitalik,
    })
    await mine(client, { blocks: 1 })

    logs = await getFilterChanges(client, { filter })
    expect(logs.length).toBe(1)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[2].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
  })

  test('args: events', async () => {
    const filter = await createEventFilter(client, {
      events: [event.default, event.approve],
    })

    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
      account: address.vitalik,
    })
    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'approve',
      args: [accounts[1].address, 1n],
      account: address.vitalik,
    })

    await mine(client, { blocks: 1 })

    let logs = await getFilterChanges(client, {
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

    logs = await getFilterChanges(client, { filter })
    expect(logs.length).toBe(0)

    await writeContract(client, {
      ...usdcContractConfig,
      functionName: 'transfer',
      args: [accounts[2].address, 1n],
      account: address.vitalik,
    })
    await mine(client, { blocks: 1 })

    logs = await getFilterChanges(client, { filter })
    expect(logs.length).toBe(1)
    expect(logs[0].args).toEqual({
      from: getAddress(address.vitalik),
      to: getAddress(accounts[2].address),
      value: 1n,
    })
    expect(logs[0].eventName).toEqual('Transfer')
  })

  test('args: fromBlock/toBlock', async () => {
    const filter = await createEventFilter(client, {
      event: event.default,
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
    })

    let logs = await getFilterChanges(client, { filter })
    assertType<Log<bigint, number, boolean, typeof event.default>[]>(logs)
    expect(logs.length).toBe(973)
    expect(logs[0].args).toMatchInlineSnapshot(`
      {
        "from": "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
        "to": "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
        "value": 17991444454902871n,
      }
    `)
    expect(logs[0].eventName).toEqual('Transfer')

    logs = await getFilterChanges(client, { filter })
    expect(logs.length).toBe(0)
  })

  test('args: strict = true (named)', async () => {
    const filter = await createEventFilter(client, {
      event: event.default,
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
      strict: true,
    })

    let logs = await getFilterChanges(client, { filter })

    assertType<Log<bigint, number, boolean, typeof event.default, true>[]>(logs)

    expect(logs.length).toBe(958)

    expectTypeOf(logs[0].args).toEqualTypeOf<{
      from: Address
      to: Address
      value: bigint
    }>()
    expect(logs[0].args).toMatchInlineSnapshot(`
      {
        "from": "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
        "to": "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
        "value": 17991444454902871n,
      }
    `)
    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
    expect(logs[0].eventName).toEqual('Transfer')

    logs = await getFilterChanges(client, { filter })
    expect(logs.length).toBe(0)
  })

  test('args: strict = false (named)', async () => {
    const filter = await createEventFilter(client, {
      event: event.default,
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
    })

    let logs = await getFilterChanges(client, { filter })

    assertType<Log<bigint, number, boolean, typeof event.default, false>[]>(
      logs,
    )

    expect(logs.length).toBe(973)

    expectTypeOf(logs[0].args).toEqualTypeOf<{
      from?: Address
      to?: Address
      value?: bigint
    }>()
    expect(logs[0].args).toMatchInlineSnapshot(`
      {
        "from": "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
        "to": "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
        "value": 17991444454902871n,
      }
    `)
    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
    expect(logs[0].eventName).toEqual('Transfer')

    logs = await getFilterChanges(client, { filter })
    expect(logs.length).toBe(0)
  })

  test('args: strict = true (unnamed)', async () => {
    const filter = await createEventFilter(client, {
      event: event.unnamed,
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
      strict: true,
    })

    let logs = await getFilterChanges(client, { filter })
    assertType<Log<bigint, number, boolean, typeof event.unnamed, true>[]>(logs)

    expect(logs.length).toBe(958)

    expectTypeOf(logs[0].args).toEqualTypeOf<
      readonly [`0x${string}`, `0x${string}`, bigint]
    >()
    expect(logs[0].args).toMatchInlineSnapshot(`
      [
        "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
        "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
        17991444454902871n,
      ]
    `)
    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
    expect(logs[0].eventName).toEqual('Transfer')

    logs = await getFilterChanges(client, { filter })
    expect(logs.length).toBe(0)
  })

  test('args: strict = false (unnamed)', async () => {
    const filter = await createEventFilter(client, {
      event: event.unnamed,
      fromBlock: anvilMainnet.forkBlockNumber - 5n,
      toBlock: anvilMainnet.forkBlockNumber,
    })

    let logs = await getFilterChanges(client, { filter })
    assertType<Log<bigint, number, boolean, typeof event.unnamed, false>[]>(
      logs,
    )

    expect(logs.length).toBe(973)

    expectTypeOf(logs[0].args).toEqualTypeOf<
      | readonly []
      | readonly [`0x${string}`, `0x${string}`, bigint]
      | readonly [`0x${string}`, `0x${string}`]
      | readonly [`0x${string}`]
    >()
    expect(logs[0].args).toMatchInlineSnapshot(`
      [
        "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
        "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
        17991444454902871n,
      ]
    `)

    expectTypeOf(logs[0].eventName).toEqualTypeOf<'Transfer'>()
    expect(logs[0].eventName).toEqual('Transfer')

    logs = await getFilterChanges(client, { filter })
    expect(logs.length).toBe(0)
  })

  test('args: singular `from`', async () => {
    const namedFilter = await createEventFilter(client, {
      event: event.default,
      args: {
        from: address.vitalik,
      },
    })
    const unnamedFilter = await createEventFilter(client, {
      event: event.unnamed,
      args: [address.vitalik],
    })

    await writeContract(client, {
      ...usdcContractConfig,
      account: address.usdcHolder,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[2].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(client, { blocks: 1 })

    const namedLogs = await getFilterChanges(client, {
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

    const unnamedLogs = await getFilterChanges(client, {
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
    const namedFilter = await createEventFilter(client, {
      event: event.default,
      args: {
        from: [address.usdcHolder, address.vitalik],
      },
    })
    const unnamedFilter = await createEventFilter(client, {
      event: event.unnamed,
      args: [[address.usdcHolder, address.vitalik]],
    })

    await writeContract(client, {
      ...usdcContractConfig,
      account: address.usdcHolder,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(client, { blocks: 1 })

    const namedLogs = await getFilterChanges(client, {
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

    const unnamedLogs = await getFilterChanges(client, {
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
    const namedFilter = await createEventFilter(client, {
      event: event.default,
      args: {
        to: accounts[0].address,
      },
    })
    const unnamedFilter = await createEventFilter(client, {
      event: event.unnamed,
      args: [null, accounts[0].address],
    })

    await writeContract(client, {
      ...usdcContractConfig,
      account: address.usdcHolder,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(client, { blocks: 1 })

    const namedLogs = await getFilterChanges(client, {
      filter: namedFilter,
    })
    expect(namedLogs.length).toBe(1)
    expect(namedLogs[0].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[0].address),
      value: 1n,
    })

    const unnamedLogs = await getFilterChanges(client, {
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
    const namedFilter = await createEventFilter(client, {
      event: event.default,
      args: {
        to: [accounts[0].address, accounts[1].address],
      },
    })
    const unnamedFilter = await createEventFilter(client, {
      event: event.unnamed,
      args: [null, [accounts[0].address, accounts[1].address]],
    })

    await writeContract(client, {
      ...usdcContractConfig,
      account: address.usdcHolder,
      functionName: 'transfer',
      args: [accounts[0].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'transfer',
      args: [accounts[1].address, 1n],
    })
    await writeContract(client, {
      ...usdcContractConfig,
      account: address.vitalik,
      functionName: 'approve',
      args: [address.vitalik, 1n],
    })
    await mine(client, { blocks: 1 })

    const namedLogs = await getFilterChanges(client, {
      filter: namedFilter,
    })
    expect(namedLogs.length).toBe(3)
    expect(namedLogs[0].args).toEqual({
      from: getAddress(address.usdcHolder),
      to: getAddress(accounts[0].address),
      value: 1n,
    })

    const unnamedLogs = await getFilterChanges(client, {
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

      const strictFilter = await createEventFilter(client, {
        event: event.default,
        strict: true,
      })
      const looseFilter = await createEventFilter(client, {
        event: event.default,
      })

      await writeContract(client, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(client, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(client, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        account: address.vitalik,
      })
      await mine(client, { blocks: 1 })

      const strictLogs = await getFilterChanges(client, {
        filter: strictFilter,
      })
      const looseLogs = await getFilterChanges(client, {
        filter: looseFilter,
      })
      expect(strictLogs.length).toBe(1)
      expect(looseLogs.length).toBe(3)
    })

    test('non-indexed params mismatch', async () => {
      const { contractAddress } = await deployErc20InvalidTransferEvent()

      const strictFilter = await createEventFilter(client, {
        event: event.invalid,
        strict: true,
      })
      const looseFilter = await createEventFilter(client, {
        event: event.invalid,
      })

      await writeContract(client, {
        ...usdcContractConfig,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(client, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[0].address, 1n],
        account: address.vitalik,
      })
      await writeContract(client, {
        abi: ERC20InvalidTransferEvent.abi,
        address: contractAddress!,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        account: address.vitalik,
      })
      await mine(client, { blocks: 1 })

      const strictLogs = await getFilterChanges(client, {
        filter: strictFilter,
      })
      const looseLogs = await getFilterChanges(client, {
        filter: looseFilter,
      })
      expect(strictLogs.length).toBe(2)
      expect(looseLogs.length).toBe(3)
    })
  })
})
